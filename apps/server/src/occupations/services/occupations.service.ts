import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import type { Prisma } from "@repo/db";
import { $Enums } from "@repo/db";
import { ComplianceWalletTemplateService } from "src/compliance-wallet-template/compliance-wallet-template.service";
import { PrismaService } from "src/prisma/prisma.service";
import type { CreateOccupationDto } from "../dto/create-occupation.dto";
import type { LinkOrgOccupationsInput } from "../dto/link-org-occupations.dto";
import type { ReplaceOrgOccupationsInput } from "../dto/replace-org-occupations.dto";
import type { UnlinkOrgOccupationsInput } from "../dto/unlink-org-occupations.dto";
import type { UpdateOccupationDto } from "../dto/update-occupation.dto";

const occupationInclude = {
	occupationSpecialties: {
		include: { specialty: { select: { id: true, name: true, acronym: true } } },
	},
} as const;

@Injectable()
export class OccupationsService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly complianceWalletTemplateService: ComplianceWalletTemplateService,
	) {}

	async getOccupationsPaginated(
		page = 1,
		limit = 10,
		search?: string,
		status?: $Enums.OccupationStatus,
		organizationId?: string,
	) {
		const baseWhere: Prisma.OccupationWhereInput = {
			...(status && !organizationId && { status }),
			...this.buildSearchWhere(search),
		};

		const where: Prisma.OccupationWhereInput = organizationId
			? {
					AND: [
						baseWhere,
						{
							OR: [
								{ status: $Enums.OccupationStatus.ACTIVE },
								{
									status: $Enums.OccupationStatus.INACTIVE,
									organizationOccupations: {
										some: { organizationId },
									},
								},
							],
						},
					],
				}
			: baseWhere;
		const skip = (page - 1) * limit;
		const [data, total] = await Promise.all([
			this.prismaService.occupation.findMany({
				where,
				orderBy: { name: "asc" },
				skip,
				take: limit,
				include: occupationInclude,
			}),
			this.prismaService.occupation.count({ where }),
		]);
		return {
			data,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	private buildSearchWhere(search?: string): Prisma.OccupationWhereInput {
		const term = search?.trim().toLowerCase();
		if (!term) return {};

		const orConditions: Prisma.OccupationWhereInput[] = [
			{ name: { contains: term, mode: "insensitive" } },
			{ acronym: { contains: term, mode: "insensitive" } },
			{ code: { contains: term, mode: "insensitive" } },
			{ description: { contains: term, mode: "insensitive" } },
		];

		const industries = Object.values($Enums.OrganizationIndustry) as string[];
		const matchingIndustry = industries.filter((i) =>
			i.toLowerCase().includes(term),
		);
		if (matchingIndustry.length > 0) {
			orConditions.push({
				industry: {
					in: matchingIndustry as $Enums.OrganizationIndustry[],
				},
			});
		}

		const statuses = Object.values($Enums.OccupationStatus) as string[];
		const matchingStatus = statuses.filter((s) =>
			s.toLowerCase().includes(term),
		);
		if (matchingStatus.length > 0) {
			orConditions.push({
				status: { in: matchingStatus as $Enums.OccupationStatus[] },
			});
		}

		return { OR: orConditions };
	}

	async getAllOccupations() {
		return this.prismaService.occupation.findMany({
			orderBy: { name: "asc" },
			include: occupationInclude,
		});
	}

	async createOccupation(dto: CreateOccupationDto) {
		return this.prismaService.occupation.create({
			data: {
				name: dto.name,
				code: dto.code,
				acronym: dto.acronym,
				industry: dto.industry ?? null,
				description: dto.description ?? null,
				status: dto.status ?? $Enums.OccupationStatus.ACTIVE,
				hasSpecialty: dto.hasSpecialty ?? false,
				...(dto.hasSpecialty &&
					dto.specialtyIds?.length && {
						occupationSpecialties: {
							create: dto.specialtyIds.map((specialtyId) => ({ specialtyId })),
						},
					}),
			},
			include: occupationInclude,
		});
	}

	async updateOccupation(id: string, dto: UpdateOccupationDto) {
		const shouldUpdateSpecialties =
			dto.hasSpecialty === false || dto.specialtyIds !== undefined;

		const occupation = await this.prismaService.occupation.findUnique({
			where: { id },
			select: {
				id: true,
				...(shouldUpdateSpecialties && {
					occupationSpecialties: { select: { specialtyId: true } },
				}),
			},
		});

		if (!occupation) {
			throw new NotFoundException(`Occupation with id ${id} not found`);
		}

		const currentSpecIds =
			"occupationSpecialties" in occupation
				? new Set(occupation.occupationSpecialties.map((s) => s.specialtyId))
				: new Set<string>();

		let removedSpecialtyIds: string[] = [];
		if (dto.hasSpecialty === false) {
			removedSpecialtyIds = [...currentSpecIds];
		} else if (dto.specialtyIds !== undefined) {
			const newSpecIds = new Set(dto.specialtyIds);
			removedSpecialtyIds = [...currentSpecIds].filter(
				(sid) => !newSpecIds.has(sid),
			);
		}

		const occupationFields = {
			...(dto.name !== undefined && { name: dto.name }),
			...(dto.code !== undefined && { code: dto.code }),
			...(dto.acronym !== undefined && { acronym: dto.acronym }),
			...(dto.industry !== undefined && { industry: dto.industry }),
			...(dto.description !== undefined && { description: dto.description }),
			...(dto.status !== undefined && { status: dto.status }),
			...(dto.hasSpecialty !== undefined && { hasSpecialty: dto.hasSpecialty }),
		};

		if (removedSpecialtyIds.length > 0) {
			return this.prismaService.$transaction(async (tx) => {
				await tx.organizationSpecialty.deleteMany({
					where: {
						specialtyId: { in: removedSpecialtyIds },
						organizationOccupation: { occupationId: id },
					},
				});
				await tx.occupationSpecialty.deleteMany({
					where: { occupationId: id, specialtyId: { in: removedSpecialtyIds } },
				});
				if (dto.hasSpecialty !== false && dto.specialtyIds !== undefined) {
					const addedIds = dto.specialtyIds.filter(
						(sid) => !currentSpecIds.has(sid),
					);
					if (addedIds.length > 0) {
						await tx.occupationSpecialty.createMany({
							data: addedIds.map((specialtyId) => ({
								occupationId: id,
								specialtyId,
							})),
							skipDuplicates: true,
						});
					}
				}
				return tx.occupation.update({
					where: { id },
					data: occupationFields,
					include: occupationInclude,
				});
			});
		}

		const addedIds =
			dto.hasSpecialty !== false && dto.specialtyIds !== undefined
				? dto.specialtyIds.filter((sid) => !currentSpecIds.has(sid))
				: [];

		return this.prismaService.occupation.update({
			where: { id },
			data: {
				...occupationFields,
				...(addedIds.length > 0 && {
					occupationSpecialties: {
						create: addedIds.map((specialtyId) => ({ specialtyId })),
					},
				}),
			},
			include: occupationInclude,
		});
	}

	async deleteOccupation(id: string): Promise<void> {
		const occupation = await this.prismaService.occupation.findUnique({
			where: { id },
		});

		if (!occupation) {
			throw new NotFoundException(`Occupation with id ${id} not found`);
		}

		await this.prismaService.occupation.delete({ where: { id } });
	}

	async linkOccupationsToOrganization(dto: LinkOrgOccupationsInput) {
		const organization = await this.prismaService.organization.findUnique({
			where: { id: dto.organizationId },
		});
		if (!organization) {
			throw new NotFoundException(
				`Organization with id ${dto.organizationId} not found`,
			);
		}

		const uniqueOccupationIds = [...new Set(dto.occupationIds)];
		const existingOccupations = await this.prismaService.occupation.findMany({
			where: {
				id: { in: uniqueOccupationIds },
				status: $Enums.OccupationStatus.ACTIVE,
			},
			select: { id: true },
		});
		const foundIds = new Set(existingOccupations.map((o) => o.id));
		const missingIds = uniqueOccupationIds.filter((id) => !foundIds.has(id));
		if (missingIds.length > 0) {
			throw new NotFoundException(
				`Occupation(s) not found or inactive: ${missingIds.join(", ")}`,
			);
		}

		return this.prismaService.$transaction(async (tx) => {
			const result = await tx.organizationOccupation.createMany({
				data: uniqueOccupationIds.map((occupationId) => ({
					occupationId: occupationId,
					organizationId: dto.organizationId,
					createdBy: dto.userId,
					updatedBy: dto.userId,
				})),
				skipDuplicates: true,
			});
			if (result.count > 0) {
				const created = await tx.organizationOccupation.findMany({
					where: {
						organizationId: dto.organizationId,
						occupationId: { in: uniqueOccupationIds },
					},
					select: { id: true },
				});
				await this.complianceWalletTemplateService.createTemplatesForOrgOccupations(
					dto.organizationId,
					created.map((c) => c.id),
					dto.userId,
					tx,
				);
			}
			return result;
		});
	}

	async unlinkOccupationsFromOrganization(dto: UnlinkOrgOccupationsInput) {
		const uniqueOccupationIds = [...new Set(dto.occupationIds)];
		return this.prismaService.organizationOccupation.deleteMany({
			where: {
				organizationId: dto.organizationId,
				occupationId: { in: uniqueOccupationIds },
			},
		});
	}

	async replaceOccupationsForOrganization(dto: ReplaceOrgOccupationsInput) {
		const organization = await this.prismaService.organization.findUnique({
			where: { id: dto.organizationId },
		});
		if (!organization) {
			throw new NotFoundException(
				`Organization with id ${dto.organizationId} not found`,
			);
		}

		const uniqueOccupationIds = [...new Set(dto.occupationIds)];

		if (uniqueOccupationIds.length > 0) {
			const [occupations, linkedOccupations] = await Promise.all([
				this.prismaService.occupation.findMany({
					where: { id: { in: uniqueOccupationIds } },
					select: { id: true, status: true },
				}),
				this.prismaService.organizationOccupation.findMany({
					where: {
						organizationId: dto.organizationId,
						occupationId: { in: uniqueOccupationIds },
					},
					select: { occupationId: true },
				}),
			]);
			const occupationMap = new Map(occupations.map((o) => [o.id, o.status]));
			const linkedIds = new Set(linkedOccupations.map((lo) => lo.occupationId));
			const missingIds = uniqueOccupationIds.filter(
				(id) => !occupationMap.has(id),
			);
			if (missingIds.length > 0) {
				throw new NotFoundException(
					`Occupation(s) not found: ${missingIds.join(", ")}`,
				);
			}
			const invalidInactive = uniqueOccupationIds.filter((id) => {
				const status = occupationMap.get(id);
				const isLinked = linkedIds.has(id);
				return status === $Enums.OccupationStatus.INACTIVE && !isLinked;
			});
			if (invalidInactive.length > 0) {
				throw new BadRequestException(
					`Cannot link inactive occupation(s): ${invalidInactive.join(", ")}`,
				);
			}
		}

		const existing = await this.prismaService.organizationOccupation.findMany({
			where: { organizationId: dto.organizationId },
			select: { occupationId: true },
		});
		const existingIds = new Set(existing.map((e) => e.occupationId));
		const newIds = new Set(uniqueOccupationIds);
		const toDelete = [...existingIds].filter((id) => !newIds.has(id));
		const toAdd = uniqueOccupationIds.filter((id) => !existingIds.has(id));

		await this.prismaService.$transaction(async (tx) => {
			if (toDelete.length > 0) {
				await tx.organizationOccupation.deleteMany({
					where: {
						organizationId: dto.organizationId,
						occupationId: { in: toDelete },
					},
				});
			}
			if (toAdd.length > 0) {
				await tx.organizationOccupation.createMany({
					data: toAdd.map((occupationId) => ({
						occupationId,
						organizationId: dto.organizationId,
						createdBy: dto.userId,
						updatedBy: dto.userId,
					})),
				});
				const added = await tx.organizationOccupation.findMany({
					where: {
						organizationId: dto.organizationId,
						occupationId: { in: toAdd },
					},
					select: { id: true },
				});
				await this.complianceWalletTemplateService.createTemplatesForOrgOccupations(
					dto.organizationId,
					added.map((a) => a.id),
					dto.userId,
					tx,
				);
			}
		});
	}

	async getLinkedOccupationsForOrganization(
		organizationId: string,
		options?: {
			page?: number;
			limit?: number;
			search?: string;
			idsOnly?: boolean;
			all?: boolean;
		},
	) {
		const {
			page = 1,
			limit = 10,
			search,
			idsOnly = false,
			all = false,
		} = options ?? {};

		const occupationWhere = this.buildSearchWhere(search);
		const where = {
			organizationId,
			...(Object.keys(occupationWhere).length > 0 && {
				occupation: occupationWhere,
			}),
		};

		if (idsOnly) {
			const rows = await this.prismaService.organizationOccupation.findMany({
				where,
				select: { occupationId: true },
			});
			return { ids: rows.map((r) => r.occupationId) };
		}

		const skip = (page - 1) * limit;
		const [data, total] = await Promise.all([
			this.prismaService.organizationOccupation.findMany({
				where,
				include: {
					occupation: {
						select: {
							id: true,
							name: true,
							acronym: true,
							code: true,
							industry: true,
							description: true,
							status: true,
						},
					},
					specialties: {
						select: {
							id: true,
							specialty: {
								select: {
									acronym: true,
									name: true,
									id: true,
								},
							},
						},
					},
				},
				orderBy: { createdAt: "desc" },
				...(all ? {} : { skip, take: limit }),
			}),
			this.prismaService.organizationOccupation.count({ where }),
		]);

		return {
			data,
			total,
			page: all ? 1 : page,
			limit: all ? total : limit,
			totalPages: all ? (total > 0 ? 1 : 0) : Math.ceil(total / limit),
		};
	}
}
