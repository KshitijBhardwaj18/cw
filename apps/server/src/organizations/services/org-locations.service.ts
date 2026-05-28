import { randomUUID } from "node:crypto";
import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import {
	S3_PREFIX_PUBLIC_ORGANIZATION_LOCATIONS,
	validateImageFile,
} from "@repo/shared";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { FilesService } from "src/files/files.service";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateOrganizationLocationDto } from "../dto/create-organization.dto";
import type { UpdateOrganizationLocationDto } from "../dto/update-organization-location.dto";

@Injectable()
export class OrgLocationsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly filesService: FilesService,
	) {}

	private async uploadLocationPhoto(
		file: Express.Multer.File | undefined,
	): Promise<string | null> {
		if (!file?.buffer) return null;
		const err = validateImageFile(file, "Location photo");
		if (err) throw new BadRequestException(err);
		const ext = file.mimetype === "image/png" ? "png" : "jpg";
		const folder = randomUUID();
		const key = `${S3_PREFIX_PUBLIC_ORGANIZATION_LOCATIONS}/${folder}/${randomUUID()}.${ext}`;
		const result = await this.filesService.uploadFile(file, key, {
			public: true,
		});
		return result.url;
	}

	async findLocationsByOrganizationId(
		organizationId: string,
		session: UserSession,
		page = 1,
		limit = 8,
		search?: string,
	) {
		if (!session) {
			throw new UnauthorizedException("Sign in required.");
		}
		const org = await this.prisma.organization.findUnique({
			where: { id: organizationId },
			select: { id: true },
		});

		if (!org) {
			throw new NotFoundException("Organization not found.");
		}

		const searchFilter = search?.trim()
			? {
					OR: [
						{ name: { contains: search.trim(), mode: "insensitive" as const } },
						{
							address: {
								contains: search.trim(),
								mode: "insensitive" as const,
							},
						},
						{ city: { contains: search.trim(), mode: "insensitive" as const } },
						{
							state: { contains: search.trim(), mode: "insensitive" as const },
						},
						{
							zipCode: {
								contains: search.trim(),
								mode: "insensitive" as const,
							},
						},
					],
				}
			: {};

		const where = { organizationId, ...searchFilter };
		const skip = (page - 1) * limit;
		const [data, total] = await Promise.all([
			this.prisma.organizationLocation.findMany({
				where,
				orderBy: { name: "asc" },
				skip,
				take: limit,
			}),
			this.prisma.organizationLocation.count({ where }),
		]);

		return {
			data,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async findPublicLocationsByOrganizationId(
		organizationId: string,
		page = 1,
		limit = 8,
		search?: string,
	) {
		const searchFilter = search?.trim()
			? {
					OR: [
						{ name: { contains: search.trim(), mode: "insensitive" as const } },
						{
							address: {
								contains: search.trim(),
								mode: "insensitive" as const,
							},
						},
						{ city: { contains: search.trim(), mode: "insensitive" as const } },
						{
							state: { contains: search.trim(), mode: "insensitive" as const },
						},
						{
							zipCode: {
								contains: search.trim(),
								mode: "insensitive" as const,
							},
						},
					],
				}
			: {};

		const where = { organizationId, ...searchFilter };
		const skip = (page - 1) * limit;

		const [data, total] = await Promise.all([
			this.prisma.organizationLocation.findMany({
				where,
				select: { id: true, name: true, city: true, state: true },
				orderBy: { name: "asc" },
				skip,
				take: limit,
			}),
			this.prisma.organizationLocation.count({ where }),
		]);

		return {
			data,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async createLocation(
		organizationId: string,
		dto: CreateOrganizationLocationDto,
		session: UserSession,
		files?: { photo?: Express.Multer.File },
	) {
		if (!session) {
			throw new UnauthorizedException("Sign in required.");
		}
		const org = await this.prisma.organization.findUnique({
			where: { id: organizationId },
		});

		if (!org) {
			throw new NotFoundException("Organization not found.");
		}

		const photoUrl = await this.uploadLocationPhoto(files?.photo);

		return this.prisma.organizationLocation.create({
			data: {
				organizationId,
				name: dto.name,
				address: dto.address,
				city: dto.city,
				state: dto.state,
				zipCode: dto.zipCode,
				locationType: dto.locationType,
				phone: dto.phone ?? null,
				email: dto.email ?? null,
				costCenter: dto.costCenter ?? null,
				photoUrl: photoUrl ?? dto.photoUrl ?? null,
			},
		});
	}

	async updateLocation(
		organizationId: string,
		locationId: string,
		dto: UpdateOrganizationLocationDto,
		session: UserSession,
		files?: { photo?: Express.Multer.File },
	) {
		if (!session) {
			throw new UnauthorizedException("Sign in required.");
		}
		const org = await this.prisma.organization.findUnique({
			where: { id: organizationId },
		});

		if (!org) {
			throw new NotFoundException("Organization not found.");
		}

		const location = await this.prisma.organizationLocation.findFirst({
			where: { id: locationId, organizationId },
		});

		if (!location) {
			throw new NotFoundException("Location not found.");
		}

		const updateData: Record<string, unknown> = {};
		if (dto.name !== undefined) updateData.name = dto.name;
		if (dto.address !== undefined) updateData.address = dto.address;
		if (dto.city !== undefined) updateData.city = dto.city;
		if (dto.state !== undefined) updateData.state = dto.state;
		if (dto.zipCode !== undefined) updateData.zipCode = dto.zipCode;
		if (dto.locationType !== undefined)
			updateData.locationType = dto.locationType;
		if (dto.phone !== undefined) updateData.phone = dto.phone ?? null;
		if (dto.email !== undefined) updateData.email = dto.email ?? null;
		if (dto.costCenter !== undefined)
			updateData.costCenter = dto.costCenter ?? null;

		const photoUrl =
			(await this.uploadLocationPhoto(files?.photo)) ?? dto.photoUrl;
		if (photoUrl !== undefined) updateData.photoUrl = photoUrl ?? null;

		if (Object.keys(updateData).length === 0) {
			throw new BadRequestException(
				"At least one field is required to update.",
			);
		}

		return this.prisma.organizationLocation.update({
			where: { id: locationId },
			data: updateData as Parameters<
				typeof this.prisma.organizationLocation.update
			>[0]["data"],
		});
	}

	async deleteLocation(
		organizationId: string,
		locationId: string,
		session: UserSession,
	): Promise<void> {
		if (!session) {
			throw new UnauthorizedException("Sign in required.");
		}
		const org = await this.prisma.organization.findUnique({
			where: { id: organizationId },
		});

		if (!org) {
			throw new NotFoundException("Organization not found.");
		}

		const location = await this.prisma.organizationLocation.findFirst({
			where: { id: locationId, organizationId },
		});

		if (!location) {
			throw new NotFoundException("Location not found.");
		}
		const locations = await this.prisma.organizationLocation.findMany({
			where: { organizationId },
		});
		if (locations.length === 1) {
			throw new BadRequestException(
				"At least one location must remain for the organization.",
			);
		}

		const [departments, requisitionTemplates, shiftTemplates, perDiemShifts] =
			await Promise.all([
				this.prisma.department.count({ where: { locationId } }),
				this.prisma.requisitionTemplate.count({ where: { locationId } }),
				this.prisma.shiftTemplate.count({ where: { locationId } }),
				this.prisma.perDiemShift.count({ where: { locationId } }),
			]);

		const blockers: string[] = [];
		if (departments > 0) blockers.push(`${departments} department(s)`);
		if (requisitionTemplates > 0)
			blockers.push(`${requisitionTemplates} requisition template(s)`);
		if (shiftTemplates > 0)
			blockers.push(`${shiftTemplates} shift template(s)`);
		if (perDiemShifts > 0) blockers.push(`${perDiemShifts} per-diem shift(s)`);

		if (blockers.length > 0) {
			throw new ConflictException(
				`Cannot delete location because it is referenced by ${blockers.join(", ")}. Remove or reassign these first.`,
			);
		}

		await this.prisma.organizationLocation.delete({
			where: { id: locationId },
		});
	}
}
