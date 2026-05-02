import { randomUUID } from "node:crypto";
import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import {
	getContractDocumentExtension,
	S3_PREFIX_ORGANIZATIONS,
	S3_SEGMENT_ORGANIZATION_VENDOR_CONTRACTS,
	validateContractDocument,
} from "@repo/shared";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { FilesService } from "src/files/files.service";
import { CreateOrganizationVendorDto } from "src/organizations/dto/create-organization-vendor.dto";
import { UpdateOrganizationVendorDto } from "src/organizations/dto/update-organization-vendor.dto";
import { PrismaService } from "src/prisma/prisma.service";

const CONTRACT_SIGNED_URL_EXPIRES_IN = 3600;

@Injectable()
export class OrgVendorsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly filesService: FilesService,
	) {}

	private async uploadOrganizationVendorContract(
		file: Express.Multer.File | undefined,
		organizationId: string,
		organizationVendorId: string,
	): Promise<{ key: string; fileName: string } | null> {
		if (!file?.buffer) return null;
		const err = validateContractDocument(file, "Contract document");
		if (err) throw new BadRequestException(err);
		const ext = getContractDocumentExtension(file.mimetype);
		const key = `${S3_PREFIX_ORGANIZATIONS}/${organizationId}/${S3_SEGMENT_ORGANIZATION_VENDOR_CONTRACTS}/${organizationVendorId}/${randomUUID()}.${ext}`;
		const result = await this.filesService.uploadFile(file, key);
		return {
			key: result.key,
			fileName: file.originalname ?? `contract.${ext}`,
		};
	}

	async findOrganizationVendorsByOrganizationId(
		organizationId: string,
		session: UserSession,
		page = 1,
		limit = 8,
		search?: string,
	) {
		if (!session) {
			throw new UnauthorizedException("Unauthorized");
		}
		const org = await this.prisma.organization.findUnique({
			where: { id: organizationId },
		});

		if (!org) {
			throw new NotFoundException("Organization not found");
		}

		const searchFilter = search?.trim()
			? {
					vendor: {
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
					},
				}
			: {};

		const where = { organizationId, ...searchFilter };
		const skip = (page - 1) * limit;
		const [data, total] = await Promise.all([
			this.prisma.organizationVendor.findMany({
				where,
				include: {
					vendor: { select: { id: true, name: true, internalId: true } },
				},
				orderBy: { createdAt: "desc" },
				skip,
				take: limit,
			}),
			this.prisma.organizationVendor.count({ where }),
		]);

		return {
			data,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async findAvailableVendorsForOrganization(
		organizationId: string,
		session: UserSession,
		page = 1,
		limit = 20,
		search?: string,
	) {
		if (!session) {
			throw new UnauthorizedException("Unauthorized");
		}
		const org = await this.prisma.organization.findUnique({
			where: { id: organizationId },
		});

		if (!org) {
			throw new NotFoundException("Organization not found");
		}

		const searchFilter = search?.trim()
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
			: {};

		const where = {
			organizationVendors: {
				none: { organizationId },
			},
			...searchFilter,
		};

		const skip = (page - 1) * limit;
		const [data, total] = await Promise.all([
			this.prisma.vendor.findMany({
				where,
				select: { id: true, name: true, internalId: true },
				orderBy: { name: "asc" },
				skip,
				take: limit,
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

	async createOrganizationVendor(
		organizationId: string,
		dto: CreateOrganizationVendorDto,
		session: UserSession,
		files?: { contract?: Express.Multer.File },
	) {
		if (!session) {
			throw new UnauthorizedException("Unauthorized");
		}
		const org = await this.prisma.organization.findUnique({
			where: { id: organizationId },
		});

		if (!org) {
			throw new NotFoundException("Organization not found");
		}

		const vendor = await this.prisma.vendor.findUnique({
			where: { id: dto.vendorId },
		});
		if (!vendor) {
			throw new NotFoundException("Vendor not found");
		}

		const existing = await this.prisma.organizationVendor.findFirst({
			where: {
				organizationId,
				vendorId: dto.vendorId,
			},
		});
		if (existing) {
			throw new ConflictException(
				"This vendor is already linked to this organization",
			);
		}

		const orgVendor = await this.prisma.organizationVendor.create({
			data: {
				organizationId,
				vendorId: dto.vendorId,
				status: dto.status,
				startDate: dto.startDate ? new Date(dto.startDate) : null,
				notes: dto.notes?.trim() || null,
			},
		});

		if (files?.contract?.buffer) {
			const uploaded = await this.uploadOrganizationVendorContract(
				files.contract,
				organizationId,
				orgVendor.id,
			);
			if (uploaded) {
				await this.prisma.organizationVendor.update({
					where: { id: orgVendor.id },
					data: {
						contractDocumentKey: uploaded.key,
						contractFileName: uploaded.fileName,
					},
				});
			}
		}

		return this.prisma.organizationVendor.findUniqueOrThrow({
			where: { id: orgVendor.id },
			include: {
				vendor: { select: { id: true, name: true, internalId: true } },
			},
		});
	}

	async updateOrganizationVendor(
		organizationId: string,
		organizationVendorId: string,
		dto: UpdateOrganizationVendorDto,
		session: UserSession,
		files?: { contract?: Express.Multer.File },
	) {
		if (!session) {
			throw new UnauthorizedException("Unauthorized");
		}
		const org = await this.prisma.organization.findUnique({
			where: { id: organizationId },
		});

		if (!org) {
			throw new NotFoundException("Organization not found");
		}

		const orgVendor = await this.prisma.organizationVendor.findFirst({
			where: {
				id: organizationVendorId,
				organizationId,
			},
		});

		if (!orgVendor) {
			throw new NotFoundException("Organization vendor link not found");
		}

		const updateData: Record<string, unknown> = {};
		if (dto.status !== undefined) updateData.status = dto.status;
		if (dto.startDate !== undefined)
			updateData.startDate =
				dto.startDate && String(dto.startDate).trim()
					? new Date(dto.startDate)
					: null;
		if (dto.notes !== undefined) updateData.notes = dto.notes?.trim() || null;

		if (files?.contract?.buffer) {
			const uploaded = await this.uploadOrganizationVendorContract(
				files.contract,
				organizationId,
				orgVendor.id,
			);
			if (uploaded) {
				updateData.contractDocumentKey = uploaded.key;
				updateData.contractFileName = uploaded.fileName;
			}
		}

		if (Object.keys(updateData).length === 0) {
			throw new BadRequestException(
				"At least one field is required for update",
			);
		}

		const delegate = this.prisma.organizationVendor;
		return delegate.update({
			where: { id: organizationVendorId },
			data: updateData as Parameters<typeof delegate.update>[0]["data"],
			include: {
				vendor: { select: { id: true, name: true, internalId: true } },
			},
		});
	}

	async deleteOrganizationVendor(
		organizationId: string,
		organizationVendorId: string,
		session: UserSession,
	): Promise<void> {
		if (!session) {
			throw new UnauthorizedException("Unauthorized");
		}
		const org = await this.prisma.organization.findUnique({
			where: { id: organizationId },
		});

		if (!org) {
			throw new NotFoundException("Organization not found");
		}

		const orgVendor = await this.prisma.organizationVendor.findFirst({
			where: {
				id: organizationVendorId,
				organizationId,
			},
		});

		if (!orgVendor) {
			throw new NotFoundException("Organization vendor link not found");
		}

		await this.prisma.organizationVendor.delete({
			where: { id: organizationVendorId },
		});
	}

	async getOrganizationVendorContractSignedUrl(
		organizationId: string,
		organizationVendorId: string,
		session: UserSession,
	): Promise<{ signedUrl: string }> {
		if (!session) {
			throw new UnauthorizedException("Unauthorized");
		}
		const org = await this.prisma.organization.findUnique({
			where: { id: organizationId },
		});

		if (!org) {
			throw new NotFoundException("Organization not found");
		}

		const orgVendor = await this.prisma.organizationVendor.findFirst({
			where: {
				id: organizationVendorId,
				organizationId,
			},
		});

		if (!orgVendor) {
			throw new NotFoundException("Organization vendor link not found");
		}

		if (!orgVendor.contractDocumentKey) {
			throw new NotFoundException("No contract document for this vendor");
		}

		const signedUrl = await this.filesService.getSignedUrl(
			orgVendor.contractDocumentKey,
			CONTRACT_SIGNED_URL_EXPIRES_IN,
		);
		return { signedUrl };
	}
}
