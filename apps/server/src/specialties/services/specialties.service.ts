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

function diffOrgSpecialties(
	existing: { id: string; specialtyId: string }[],
	desired: string[],
): { toAdd: string[]; toRemoveIds: string[] } {
	const existingBySpecialty = new Map(
		existing.map((e) => [e.specialtyId, e.id]),
	);
	const desiredSet = new Set(desired);
	return {
		toAdd: desired.filter((sid) => !existingBySpecialty.has(sid)),
		toRemoveIds: existing
			.filter((e) => !desiredSet.has(e.specialtyId))
			.map((e) => e.id),
	};
}

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
			throw new NotFoundException("Specialty not found.");
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
			throw new NotFoundException("Specialty not found.");
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
		const orgOccupation = await this.requireOrgOccupation(
			dto.organizationId,
			dto.orgOccupationId,
		);
		const desired = [...new Set(dto.specialtyIds)];

		await this.prismaService.$transaction(async (tx) => {
			const existing = await tx.organizationSpecialty.findMany({
				where: { organizationOccupationId: dto.orgOccupationId },
				select: { id: true, specialtyId: true },
			});

			const { toAdd, toRemoveIds } = diffOrgSpecialties(existing, desired);

			await this.assertSpecialtiesAllowed(
				tx,
				toAdd,
				orgOccupation.occupationId,
			);

			if (toRemoveIds.length > 0) {
				await tx.organizationSpecialty.deleteMany({
					where: { id: { in: toRemoveIds } },
				});
			}
			await this.linkSpecialtiesInTx(tx, {
				organizationId: dto.organizationId,
				orgOccupationId: dto.orgOccupationId,
				specialtyIds: toAdd,
				userId: dto.userId,
			});
		});
	}

	async linkOrgSpecialtyToOrgOccupation(dto: LinkOrgSpecialtyInput) {
		const orgOccupation = await this.requireOrgOccupation(
			dto.organizationId,
			dto.orgOccupationId,
		);
		const desired = [...new Set(dto.specialtyIds)];

		return this.prismaService.$transaction(async (tx) => {
			const alreadyLinked = await tx.organizationSpecialty.findMany({
				where: {
					organizationOccupationId: dto.orgOccupationId,
					specialtyId: { in: desired },
				},
				select: { specialtyId: true },
			});
			const alreadyLinkedSet = new Set(alreadyLinked.map((r) => r.specialtyId));
			const toAdd = desired.filter((sid) => !alreadyLinkedSet.has(sid));

			await this.assertSpecialtiesAllowed(
				tx,
				toAdd,
				orgOccupation.occupationId,
			);
			return this.linkSpecialtiesInTx(tx, {
				organizationId: dto.organizationId,
				orgOccupationId: dto.orgOccupationId,
				specialtyIds: toAdd,
				userId: dto.userId,
			});
		});
	}

	async unlinkOrgSpecialties(dto: UnlinkOrgSpecialtiesInput): Promise<void> {
		await this.prismaService.organizationSpecialty.deleteMany({
			where: {
				organizationOccupationId: dto.orgOccupationId,
				specialtyId: { in: [...new Set(dto.specialtyIds)] },
			},
		});
	}

	private async requireOrgOccupation(
		organizationId: string,
		orgOccupationId: string,
	) {
		const row = await this.prismaService.organizationOccupation.findUnique({
			where: { id: orgOccupationId, organizationId },
			select: { id: true, occupationId: true },
		});
		if (!row) throw new NotFoundException("Organization occupation not found.");
		return row;
	}

	private async assertSpecialtiesAllowed(
		tx: Prisma.TransactionClient,
		specialtyIds: string[],
		occupationId: string,
	): Promise<void> {
		if (specialtyIds.length === 0) return;
		const valid = await tx.specialty.findMany({
			where: {
				id: { in: specialtyIds },
				status: $Enums.SpecialtyStatus.ACTIVE,
				occupationSpecialties: { some: { occupationId } },
			},
			select: { id: true },
		});
		if (valid.length === specialtyIds.length) return;
		throw new NotFoundException(
			"Some specialties are inactive or do not belong to this occupation.",
		);
	}

	private async linkSpecialtiesInTx(
		tx: Prisma.TransactionClient,
		input: {
			organizationId: string;
			orgOccupationId: string;
			specialtyIds: string[];
			userId: string;
		},
	): Promise<{ count: number }> {
		if (input.specialtyIds.length === 0) return { count: 0 };
		const result = await tx.organizationSpecialty.createMany({
			data: input.specialtyIds.map((specialtyId) => ({
				specialtyId,
				organizationOccupationId: input.orgOccupationId,
				organizationId: input.organizationId,
				createdBy: input.userId,
				updatedBy: input.userId,
			})),
			skipDuplicates: true,
		});
		const created = await tx.organizationSpecialty.findMany({
			where: {
				organizationOccupationId: input.orgOccupationId,
				specialtyId: { in: input.specialtyIds },
			},
			select: { id: true, organizationOccupationId: true },
		});
		await this.complianceWalletTemplateService.createTemplatesForOrgSpecialties(
			input.organizationId,
			created,
			input.userId,
			tx,
		);
		return result;
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
