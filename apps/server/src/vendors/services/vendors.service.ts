import { randomBytes, randomUUID } from "node:crypto";
import {
	BadRequestException,
	ConflictException,
	Injectable,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import { UserRole } from "@repo/db";
import { S3_PREFIX_PUBLIC_VENDOR_LOGOS, validateImageFile } from "@repo/shared";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { FilesService } from "../../files/files.service";
import { PrismaService } from "../../prisma/prisma.service";
import {
	AddVendorOccupationsDto,
	CreateVendorDto,
	CreateVendorUserDto,
	UpdateVendorUserDto,
} from "../dto/create-vendor.dto";
import { UpdateVendorDto } from "../dto/update-vendor.dto";

interface VendorFiles {
	logo?: Express.Multer.File;
}

@Injectable()
export class VendorsService {
	private readonly logger = new Logger(VendorsService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly filesService: FilesService,
	) {}

	async create(
		data: Record<string, unknown>,
		userId: string,
		files?: VendorFiles,
	) {
		const dto = plainToInstance(CreateVendorDto, data);
		const validationErrors = await validate(dto);
		if (validationErrors.length > 0) {
			const messages = validationErrors.flatMap((e) =>
				Object.values(e.constraints ?? {}),
			);
			throw new BadRequestException(messages[0] ?? "Validation failed");
		}

		const uploadedLogo = await this.uploadLogo(files?.logo);
		this.logger.log(`Creating vendor "${dto.name}" by user ${userId}`);

		const internalId = dto.internalId || this.generateInternalId();

		const vendor = await this.prisma.vendor.create({
			data: {
				name: dto.name,
				industries: dto.industries,
				certifiedBusinessClassifications:
					dto.certifiedBusinessClassifications ?? [],
				about: dto.about,
				isActive: dto.isActive ?? true,
				logo: uploadedLogo ?? dto.logoUrl ?? undefined,
				taxId: dto.taxId,
				phoneNumber: dto.phoneNumber,
				website: dto.website,
				annualRevenue: dto.annualRevenue,
				employeeCount: dto.employeeCount,
				internalId,
				address: dto.address
					? {
							create: {
								street: dto.address.street,
								city: dto.address.city,
								state: dto.address.state,
								zipCode: dto.address.zipCode,
								country: dto.address.country,
							},
						}
					: undefined,
			},
		});

		this.logger.log(`Vendor "${vendor.name}" created with ID ${vendor.id}`);
		return vendor;
	}

	async setOccupations(vendorId: string, dto: AddVendorOccupationsDto) {
		await this.prisma.vendorOccupationSpecialization.deleteMany({
			where: { vendorId },
		});

		if (dto.occupationIds.length > 0) {
			await this.prisma.vendorOccupationSpecialization.createMany({
				data: dto.occupationIds.map((occupationId) => ({
					vendorId,
					occupationId,
				})),
			});
		}

		this.logger.log(
			`Set ${dto.occupationIds.length} occupations for vendor ${vendorId}`,
		);

		return { vendorId, count: dto.occupationIds.length };
	}

	async addVendorUser(vendorId: string, dto: CreateVendorUserDto) {
		let user = await this.prisma.user.findUnique({
			where: { email: dto.email },
		});

		if (!user) {
			user = await this.prisma.user.create({
				data: {
					name: `${dto.firstName} ${dto.lastName}`.trim(),
					email: dto.email,
					title: dto.title,
					officePhone: dto.officePhone ?? null,
					phoneNumber: dto.mobilePhone ?? dto.officePhone ?? null,
					role: "VENDOR_USER",
					emailVerified: false,
				},
			});
		} else if (user.role !== UserRole.VENDOR_USER) {
			throw new ConflictException("An account already exists with this email.");
		}

		const existingLink = await this.prisma.vendorUser.findUnique({
			where: { userId: user.id },
			select: { vendorId: true },
		});

		if (existingLink) {
			if (existingLink.vendorId === vendorId) {
				throw new ConflictException(
					"This user is already associated with this vendor.",
				);
			}
			throw new ConflictException(
				"This user is already associated with another vendor. A user can only be linked to one vendor.",
			);
		}

		await this.prisma.vendorUser.create({
			data: {
				userId: user.id,
				vendorId,
				role: dto.role,
			},
		});

		this.logger.log(`Added user ${dto.email} to vendor ${vendorId}`);
		return { vendorId, userId: user.id, role: dto.role };
	}

	async updateVendorUser(
		vendorId: string,
		vendorUserId: string,
		dto: UpdateVendorUserDto,
	) {
		const vendorUser = await this.prisma.vendorUser.findFirstOrThrow({
			where: { id: vendorUserId, vendorId },
			include: { user: true },
		});

		await this.prisma.$transaction([
			this.prisma.user.update({
				where: { id: vendorUser.userId },
				data: {
					name: `${dto.firstName} ${dto.lastName}`.trim(),
					title: dto.title,
					officePhone: dto.officePhone ?? null,
					phoneNumber: dto.phoneNumber ?? null,
					status: dto.status,
				},
			}),
			this.prisma.vendorUser.update({
				where: { id: vendorUserId },
				data: { role: dto.role },
			}),
		]);

		this.logger.log(
			`Updated vendor user ${vendorUserId} for vendor ${vendorId}`,
		);
		return { vendorId, vendorUserId };
	}

	/**
	 * Removes a vendor team member by deleting their `User` (cascades `VendorUser`, sessions, etc.).
	 * Only users with `UserRole.VENDOR_USER` may be removed via this path.
	 */
	async removeVendorUser(vendorId: string, vendorUserId: string) {
		const vendorUser = await this.prisma.vendorUser.findFirst({
			where: { id: vendorUserId, vendorId },
			include: { user: { select: { id: true, role: true } } },
		});

		if (!vendorUser) {
			throw new NotFoundException("Vendor user not found.");
		}
		if (vendorUser.user.role !== UserRole.VENDOR_USER) {
			throw new BadRequestException(
				"This account cannot be removed from the vendor team",
			);
		}

		await this.prisma.user.delete({ where: { id: vendorUser.userId } });

		this.logger.log(
			`Removed vendor user ${vendorUserId} (user ${vendorUser.userId}) from vendor ${vendorId}`,
		);
		return { vendorId, vendorUserId };
	}

	async findAll(options: { page: number; limit: number; search?: string }) {
		const { page, limit, search } = options;
		const skip = (page - 1) * limit;

		const where = search?.trim()
			? {
					OR: [
						{
							name: {
								contains: search.trim(),
								mode: "insensitive" as const,
							},
						},
						{
							internalId: {
								contains: search.trim(),
								mode: "insensitive" as const,
							},
						},
					],
				}
			: undefined;

		const [data, total] = await Promise.all([
			this.prisma.vendor.findMany({
				where,
				skip,
				take: limit,
				include: {
					address: true,
					vendorOccupationSpecializations: {
						include: { occupation: true },
					},
					vendorUsers: {
						include: { user: true },
					},
					_count: {
						select: {
							documents: true,
							notes: true,
						},
					},
				},
				orderBy: { createdAt: "desc" },
			}),
			this.prisma.vendor.count({ where }),
		]);

		return {
			data,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async findOne(id: string) {
		return this.prisma.vendor.findUniqueOrThrow({
			where: { id },
			include: {
				address: true,
				vendorOccupationSpecializations: {
					include: { occupation: true },
				},
				vendorUsers: {
					include: { user: true },
				},
				documents: true,
				notes: true,
				organizationVendors: {
					include: { organization: true },
				},
			},
		});
	}

	async findVendorUsers(vendorId: string, search?: string) {
		const where = search?.trim()
			? {
					vendorId,
					user: {
						OR: [
							{
								name: {
									contains: search.trim(),
									mode: "insensitive" as const,
								},
							},
							{
								email: {
									contains: search.trim(),
									mode: "insensitive" as const,
								},
							},
						],
					},
				}
			: { vendorId };

		return this.prisma.vendorUser.findMany({
			where,
			include: { user: true },
			orderBy: { user: { name: "asc" } },
		});
	}

	async update(
		id: string,
		data?: Record<string, unknown>,
		files?: VendorFiles,
	) {
		const uploadedLogo = files?.logo
			? await this.uploadLogo(files.logo, id)
			: undefined;

		const dto = data
			? plainToInstance(UpdateVendorDto, data)
			: ({} as UpdateVendorDto);

		let addressId: string | undefined;
		if (dto.address) {
			const existing = await this.prisma.vendor.findUniqueOrThrow({
				where: { id },
				select: { addressId: true },
			});

			if (existing.addressId) {
				await this.prisma.address.update({
					where: { id: existing.addressId },
					data: {
						street: dto.address.street,
						city: dto.address.city,
						state: dto.address.state,
						zipCode: dto.address.zipCode,
						country: dto.address.country,
					},
				});
				addressId = existing.addressId;
			} else {
				const addr = await this.prisma.address.create({
					data: {
						street: dto.address.street,
						city: dto.address.city,
						state: dto.address.state,
						zipCode: dto.address.zipCode,
						country: dto.address.country,
					},
				});
				addressId = addr.id;
			}
		}

		const logoValue = uploadedLogo ?? dto.logoUrl;

		return this.prisma.vendor.update({
			where: { id },
			data: {
				...(dto.name !== undefined && { name: dto.name }),
				...(dto.industries !== undefined && {
					industries: dto.industries,
				}),
				...(dto.certifiedBusinessClassifications !== undefined && {
					certifiedBusinessClassifications:
						dto.certifiedBusinessClassifications,
				}),
				...(dto.about !== undefined && { about: dto.about }),
				...(dto.isActive !== undefined && { isActive: dto.isActive }),
				...(logoValue !== undefined && { logo: logoValue }),
				...(dto.taxId !== undefined && { taxId: dto.taxId }),
				...(dto.phoneNumber !== undefined && {
					phoneNumber: dto.phoneNumber,
				}),
				...(dto.website !== undefined && { website: dto.website }),
				...(dto.annualRevenue !== undefined && {
					annualRevenue: dto.annualRevenue,
				}),
				...(dto.employeeCount !== undefined && {
					employeeCount: dto.employeeCount,
				}),
				...(addressId !== undefined && { addressId }),
			},
		});
	}

	private async uploadLogo(
		file: Express.Multer.File | undefined,
		vendorId?: string,
	): Promise<string | null> {
		if (!file?.buffer) return null;
		const err = validateImageFile(file, "Logo");
		if (err) throw new BadRequestException(err);
		const ext = file.mimetype === "image/png" ? "png" : "jpg";
		const folder = vendorId ?? randomUUID();
		const key = `${S3_PREFIX_PUBLIC_VENDOR_LOGOS}/${folder}/${randomUUID()}.${ext}`;
		const result = await this.filesService.uploadFile(file, key, {
			public: true,
		});
		return result.url;
	}

	async remove(id: string) {
		return this.prisma.vendor.delete({
			where: { id },
		});
	}

	private generateInternalId(): string {
		return randomBytes(4).toString("hex").toUpperCase();
	}
}
