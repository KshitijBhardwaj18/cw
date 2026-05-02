import { Injectable, NotFoundException } from "@nestjs/common";
import type { Prisma } from "@repo/db";
import { $Enums } from "@repo/db";
import { ComplianceWalletTemplateService } from "src/compliance-wallet-template/compliance-wallet-template.service";
import { PrismaService } from "src/prisma/prisma.service";
import type { CreateSpecialtyDto } from "../dto/create-specialty.dto";
import type { LinkOrgSpecialtyInput } from "../dto/link-org-specialties.dto";
import type { ReplaceOrgSpecialtiesInput } from "../dto/replace-org-specialties.dto";
import type { UnlinkOrgSpecialtiesInput } from "../dto/unlink-org-specialties.dto";
import type { UpdateSpecialtyDto } from "../dto/update-specialty.dto";

@Injectable()
export class SpecialtiesService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly complianceWalletTemplateService: ComplianceWalletTemplateService,
	) {}

	private readonly includeOccupations = {
		occupationSpecialties: {
			include: {
				occupation: { select: { id: true, name: true, acronym: true } },
			},
		},
	} as const;

	async getSpecialtiesPaginated(page = 1, limit = 10, search?: string) {
		const where = this.buildSearchWhere(search);
		const skip = (page - 1) * limit;
		const [data, total] = await Promise.all([
			this.prismaService.specialty.findMany({
				where,
				orderBy: { name: "asc" },
				skip,
				take: limit,
				include: this.includeOccupations,
			}),
			this.prismaService.specialty.count({ where }),
		]);
		return {
			data,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	private buildSearchWhere(search?: string): Prisma.SpecialtyWhereInput {
		const term = search?.trim().toLowerCase();
		if (!term) return {};

		const orConditions: Prisma.SpecialtyWhereInput[] = [
			{ name: { contains: term, mode: "insensitive" } },
			{ acronym: { contains: term, mode: "insensitive" } },
			{ group: { contains: term, mode: "insensitive" } },
			{ description: { contains: term, mode: "insensitive" } },
		];

		const statuses = Object.values($Enums.SpecialtyStatus) as string[];
		const matchingStatus = statuses.filter((s) =>
			s.toLowerCase().includes(term),
		);
		if (matchingStatus.length > 0) {
			orConditions.push({
				status: { in: matchingStatus as $Enums.SpecialtyStatus[] },
			});
		}

		return { OR: orConditions };
	}

	async getAllSpecialties() {
		return this.prismaService.specialty.findMany({
			orderBy: { name: "asc" },
			include: this.includeOccupations,
		});
	}

	async createSpecialty(dto: CreateSpecialtyDto) {
		return this.prismaService.specialty.create({
			data: {
				acronym: dto.acronym,
				name: dto.name,
				group: dto.group ?? null,
				description: dto.description ?? null,
				status: dto.status ?? $Enums.SpecialtyStatus.ACTIVE,
				occupationSpecialties: {
					create: dto.occupationIds.map((occupationId) => ({ occupationId })),
				},
			},
			include: this.includeOccupations,
		});
	}

	async updateSpecialty(id: string, dto: UpdateSpecialtyDto) {
		const specialty = await this.prismaService.specialty.findUnique({
			where: { id },
			select: {
				id: true,
				...(dto.occupationIds !== undefined && {
					occupationSpecialties: { select: { occupationId: true } },
				}),
			},
		});

		if (!specialty) {
			throw new NotFoundException(`Specialty with id ${id} not found`);
		}

		const currentOccIds =
			"occupationSpecialties" in specialty
				? new Set(specialty.occupationSpecialties.map((o) => o.occupationId))
				: new Set<string>();

		let removedOccupationIds: string[] = [];
		if (dto.occupationIds !== undefined) {
			const newOccIds = new Set(dto.occupationIds);
			removedOccupationIds = [...currentOccIds].filter(
				(oid) => !newOccIds.has(oid),
			);
		}

		const specialtyFields = {
			...(dto.acronym !== undefined && { acronym: dto.acronym }),
			...(dto.name !== undefined && { name: dto.name }),
			...(dto.group !== undefined && { group: dto.group }),
			...(dto.description !== undefined && { description: dto.description }),
			...(dto.status !== undefined && { status: dto.status }),
		};

		if (removedOccupationIds.length > 0) {
			return this.prismaService.$transaction(async (tx) => {
				await tx.organizationSpecialty.deleteMany({
					where: {
						specialtyId: id,
						organizationOccupation: {
							occupationId: { in: removedOccupationIds },
						},
					},
				});
				await tx.occupationSpecialty.deleteMany({
					where: {
						specialtyId: id,
						occupationId: { in: removedOccupationIds },
					},
				});
				if (dto.occupationIds !== undefined) {
					const addedOccIds = dto.occupationIds.filter(
						(oid) => !currentOccIds.has(oid),
					);
					if (addedOccIds.length > 0) {
						await tx.occupationSpecialty.createMany({
							data: addedOccIds.map((occupationId) => ({
								specialtyId: id,
								occupationId,
							})),
							skipDuplicates: true,
						});
					}
				}
				return tx.specialty.update({
					where: { id },
					data: specialtyFields,
					include: this.includeOccupations,
				});
			});
		}

		const addedOccIds =
			dto.occupationIds !== undefined
				? dto.occupationIds.filter((oid) => !currentOccIds.has(oid))
				: [];

		return this.prismaService.specialty.update({
			where: { id },
			data: {
				...specialtyFields,
				...(addedOccIds.length > 0 && {
					occupationSpecialties: {
						create: addedOccIds.map((occupationId) => ({ occupationId })),
					},
				}),
			},
			include: this.includeOccupations,
		});
	}

	async deleteSpecialty(id: string): Promise<void> {
		const specialty = await this.prismaService.specialty.findUnique({
			where: { id },
		});

		if (!specialty) {
			throw new NotFoundException(`Specialty with id ${id} not found`);
		}

		await this.prismaService.specialty.delete({ where: { id } });
	}

	async getSpecialtiesForOccupation(occupationId: string) {
		return this.prismaService.specialty.findMany({
			where: {
				occupationSpecialties: {
					some: { occupationId },
				},
				status: $Enums.SpecialtyStatus.ACTIVE,
			},
			orderBy: { name: "asc" },
			select: {
				id: true,
				name: true,
				acronym: true,
			},
		});
	}

	async getDistinctSpecialtiesForOrganizationLinkedOccupations(
		organizationId: string,
		options?: { linkedOccupationsLimit?: number },
	) {
		const rows = await this.prismaService.organizationOccupation.findMany({
			where: { organizationId },
			select: { occupationId: true },
			orderBy: { createdAt: "desc" },
			...(options?.linkedOccupationsLimit !== undefined
				? { take: options.linkedOccupationsLimit }
				: {}),
		});
		const occupationIds = rows.map((r) => r.occupationId);
		return this.getSpecialtiesForOccupationIds(occupationIds);
	}

	async getSpecialtiesForOccupationIds(occupationIds: string[]) {
		if (occupationIds.length === 0) {
			return [];
		}
		return this.prismaService.specialty.findMany({
			where: {
				occupationSpecialties: {
					some: { occupationId: { in: occupationIds } },
				},
				status: $Enums.SpecialtyStatus.ACTIVE,
			},
			orderBy: { name: "asc" },
			select: {
				id: true,
				name: true,
				acronym: true,
			},
		});
	}

	async getSpecialtiesForOccupationPaginated(
		occupationId: string,
		page = 1,
		limit = 10,
		search?: string,
		organizationOccupationId?: string,
	) {
		const baseWhere: Prisma.SpecialtyWhereInput = {
			occupationSpecialties: {
				some: { occupationId },
			},
		};

		const excludeInactiveUnlinked: Prisma.SpecialtyWhereInput =
			organizationOccupationId
				? {
						OR: [
							{ status: $Enums.SpecialtyStatus.ACTIVE },
							{
								organizationSpecialties: {
									some: {
										organizationOccupationId,
									},
								},
							},
						],
					}
				: { status: $Enums.SpecialtyStatus.ACTIVE };

		const combinedBase =
			Object.keys(excludeInactiveUnlinked).length > 0
				? { AND: [baseWhere, excludeInactiveUnlinked] }
				: baseWhere;

		const searchWhere = this.buildSearchWhere(search);
		const where: Prisma.SpecialtyWhereInput =
			Object.keys(searchWhere).length > 0
				? { AND: [combinedBase, searchWhere] }
				: combinedBase;

		const skip = (page - 1) * limit;
		const [data, total] = await Promise.all([
			this.prismaService.specialty.findMany({
				where,
				orderBy: { name: "asc" },
				skip,
				take: limit,
				select: {
					id: true,
					name: true,
					acronym: true,
					status: true,
				},
			}),
			this.prismaService.specialty.count({ where }),
		]);
		return {
			data,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async replaceSpecialtiesForOrgOccupation(
		dto: ReplaceOrgSpecialtiesInput,
	): Promise<void> {
		const orgOccupation =
			await this.prismaService.organizationOccupation.findUnique({
				where: {
					id: dto.orgOccupationId,
					organizationId: dto.organizationId,
				},
				select: { occupationId: true },
			});
		if (!orgOccupation) {
			throw new NotFoundException(`Organization occupation not found`);
		}

		const uniqueSpecialtyIds = [...new Set(dto.specialtyIds)];
		if (uniqueSpecialtyIds.length > 0) {
			const existingLinks =
				await this.prismaService.organizationSpecialty.findMany({
					where: { organizationOccupationId: dto.orgOccupationId },
					select: { specialtyId: true },
				});
			const existingIds = new Set(existingLinks.map((l) => l.specialtyId));
			const validSpecialties = await this.prismaService.specialty.findMany({
				where: {
					id: { in: uniqueSpecialtyIds },
					occupationSpecialties: {
						some: { occupationId: orgOccupation.occupationId },
					},
					OR: [
						{ status: $Enums.SpecialtyStatus.ACTIVE },
						{ id: { in: Array.from(existingIds) } },
					],
				},
				select: { id: true },
			});
			const validIds = new Set(validSpecialties.map((s) => s.id));
			const invalidIds = uniqueSpecialtyIds.filter((id) => !validIds.has(id));
			if (invalidIds.length > 0) {
				throw new NotFoundException(
					`Some specialties are invalid (not active or not belonging to occupation): ${invalidIds.join(", ")}`,
				);
			}
		}

		await this.prismaService.$transaction(async (tx) => {
			await tx.organizationSpecialty.deleteMany({
				where: { organizationOccupationId: dto.orgOccupationId },
			});
			if (uniqueSpecialtyIds.length > 0) {
				await tx.organizationSpecialty.createMany({
					data: uniqueSpecialtyIds.map((specialtyId) => ({
						specialtyId,
						organizationOccupationId: dto.orgOccupationId,
						organizationId: dto.organizationId,
						createdBy: dto.userId,
						updatedBy: dto.userId,
					})),
				});
				const created = await tx.organizationSpecialty.findMany({
					where: {
						organizationOccupationId: dto.orgOccupationId,
						specialtyId: { in: uniqueSpecialtyIds },
					},
					select: { id: true, organizationOccupationId: true },
				});
				await this.complianceWalletTemplateService.createTemplatesForOrgSpecialties(
					dto.organizationId,
					created,
					dto.userId,
					tx,
				);
			}
		});
	}

	async linkOrgSpecialtyToOrgOccupation(dto: LinkOrgSpecialtyInput) {
		const orgOccupation =
			await this.prismaService.organizationOccupation.findUnique({
				where: {
					organizationId: dto.organizationId,
					id: dto.orgOccupationId,
				},
			});
		if (!orgOccupation) {
			throw new NotFoundException(`Organization occupation not found`);
		}
		const validSpecialties = await this.prismaService.specialty.findMany({
			where: {
				id: { in: dto.specialtyIds },
				status: $Enums.SpecialtyStatus.ACTIVE,
				occupationSpecialties: {
					some: { occupationId: orgOccupation.occupationId },
				},
			},
			select: { id: true },
		});
		if (validSpecialties.length !== [...new Set(dto.specialtyIds)].length) {
			throw new NotFoundException(
				`Some specialties are invalid, inactive, or do not belong to this occupation`,
			);
		}
		return this.prismaService.$transaction(async (tx) => {
			const result = await tx.organizationSpecialty.createMany({
				data: dto.specialtyIds.map((id) => ({
					specialtyId: id,
					organizationOccupationId: orgOccupation.id,
					organizationId: dto.organizationId,
					createdBy: dto.userId,
					updatedBy: dto.userId,
				})),
				skipDuplicates: true,
			});
			if (result.count > 0) {
				const created = await tx.organizationSpecialty.findMany({
					where: {
						organizationOccupationId: orgOccupation.id,
						specialtyId: { in: dto.specialtyIds },
					},
					select: { id: true, organizationOccupationId: true },
				});
				await this.complianceWalletTemplateService.createTemplatesForOrgSpecialties(
					dto.organizationId,
					created,
					dto.userId,
					tx,
				);
			}
			return result;
		});
	}

	async unlinkOrgSpecialties(dto: UnlinkOrgSpecialtiesInput): Promise<void> {
		const uniqueSpecialtyIds = [...new Set(dto.specialtyIds)];
		await this.prismaService.organizationSpecialty.deleteMany({
			where: {
				organizationOccupationId: dto.orgOccupationId,
				specialtyId: { in: uniqueSpecialtyIds },
			},
		});
	}

	async getOrganizationSpecialtiesPaginated(
		organizationId: string,
		page = 1,
		limit = 10,
		search?: string,
		all = false,
	) {
		const searchWhere = this.buildSearchWhere(search);
		const where: Prisma.OrganizationSpecialtyWhereInput = {
			organizationId,
			...(Object.keys(searchWhere).length > 0 && {
				specialty: searchWhere,
			}),
		};

		const skip = (page - 1) * limit;
		const [data, total] = await Promise.all([
			this.prismaService.organizationSpecialty.findMany({
				where,
				include: {
					specialty: {
						select: {
							id: true,
							name: true,
							acronym: true,
							status: true,
						},
					},
					organizationOccupation: {
						select: {
							occupation: {
								select: {
									id: true,
									name: true,
									acronym: true,
								},
							},
						},
					},
				},
				orderBy: { createdAt: "desc" },
				...(all ? {} : { skip, take: limit }),
			}),
			this.prismaService.organizationSpecialty.count({ where }),
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
