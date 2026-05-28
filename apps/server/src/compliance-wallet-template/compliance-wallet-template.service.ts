import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { ComplianceListItemResponseStyle, type Prisma } from "@repo/db";
import type {
	CombinationRow,
	CombinationsFilter,
	CombinationsResponse,
	WalletTemplateDetail,
} from "@repo/shared";
import { PrismaService } from "src/prisma/prisma.service";

type PrismaTx = Parameters<Parameters<PrismaService["$transaction"]>[0]>[0];

const NO_SPECIALTY_SEARCH_TERM = "no specialty";

const combinationsIncludeShape = {
	organizationOccupation: {
		select: {
			occupation: {
				select: { id: true, name: true, acronym: true },
			},
		},
	},
	organizationSpecialty: {
		select: {
			specialty: {
				select: { id: true, name: true, acronym: true },
			},
		},
	},
	_count: { select: { complianceWalletTemplateItems: true } },
} as const;

type TemplateWithInclude = Prisma.ComplianceWalletTemplateGetPayload<{
	include: typeof combinationsIncludeShape;
}>;

@Injectable()
export class ComplianceWalletTemplateService {
	private readonly combinationsInclude = combinationsIncludeShape;

	private readonly combinationsOrderBy = [
		{
			organizationOccupation: {
				occupation: { name: "asc" as const },
			},
		},
		{ createdAt: "asc" as const },
	] as const;

	constructor(private readonly prismaService: PrismaService) {}

	async getCombinations(
		organizationId: string,
		page = 1,
		limit = 10,
		search?: string,
		filter: CombinationsFilter = "all",
	): Promise<CombinationsResponse> {
		const where = this.buildCombinationsWhere({
			organizationId,
			search,
			filter,
		});

		const [data, total, totalCombinations, withWallets, withoutWallets] =
			await this.fetchCombinationData(organizationId, where, page, limit);

		return {
			data: this.mapToCombinationRows(data),
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit) || 1,
			totalCombinations,
			withWallets,
			withoutWallets,
		};
	}

	private buildCombinationsWhere(params: {
		organizationId: string;
		search?: string;
		filter: CombinationsFilter;
	}): Prisma.ComplianceWalletTemplateWhereInput {
		const { organizationId, search, filter } = params;
		const searchWhere = this.buildSearchWhereClause(search);

		return {
			organizationId,
			...(searchWhere && { OR: searchWhere }),
			...this.buildWalletFilterCondition(filter),
		};
	}

	private buildSearchWhereClause(
		search?: string,
	): Prisma.ComplianceWalletTemplateWhereInput[] | undefined {
		const searchTerm = search?.trim();
		if (!searchTerm) return undefined;

		const searchLower = searchTerm.toLowerCase();
		const orConditions: Prisma.ComplianceWalletTemplateWhereInput[] = [
			{
				organizationOccupation: {
					occupation: this.buildNameAcronymSearch(searchTerm),
				},
			},
			{
				organizationSpecialty: {
					specialty: this.buildNameAcronymSearch(searchTerm),
				},
			},
		];

		if (
			searchLower === NO_SPECIALTY_SEARCH_TERM ||
			searchLower.includes(NO_SPECIALTY_SEARCH_TERM)
		) {
			orConditions.push({ organizationSpecialtyId: null });
		}

		return orConditions;
	}

	private buildNameAcronymSearch(
		searchTerm: string,
	): Prisma.OccupationWhereInput & Prisma.SpecialtyWhereInput {
		return {
			OR: [
				{ name: { contains: searchTerm, mode: "insensitive" } },
				{ acronym: { contains: searchTerm, mode: "insensitive" } },
			],
		};
	}

	private buildWalletFilterCondition(
		filter: CombinationsFilter,
	): Prisma.ComplianceWalletTemplateWhereInput {
		if (filter === "with_wallet") {
			return { complianceWalletTemplateItems: { some: {} } };
		}
		if (filter === "without_wallet") {
			return { complianceWalletTemplateItems: { none: {} } };
		}
		return {};
	}

	private async fetchCombinationData(
		organizationId: string,
		where: Prisma.ComplianceWalletTemplateWhereInput,
		page: number,
		limit: number,
	): Promise<[TemplateWithInclude[], number, number, number, number]> {
		return Promise.all([
			this.prismaService.complianceWalletTemplate.findMany({
				where,
				include: this.combinationsInclude,
				orderBy: [...this.combinationsOrderBy],
				skip: (page - 1) * limit,
				take: limit,
			}),
			this.prismaService.complianceWalletTemplate.count({ where }),
			this.prismaService.complianceWalletTemplate.count({
				where: { organizationId },
			}),
			this.prismaService.complianceWalletTemplate.count({
				where: {
					organizationId,
					complianceWalletTemplateItems: { some: {} },
				},
			}),
			this.prismaService.complianceWalletTemplate.count({
				where: {
					organizationId,
					complianceWalletTemplateItems: { none: {} },
				},
			}),
		]);
	}

	private mapToCombinationRows(data: TemplateWithInclude[]): CombinationRow[] {
		return data.map((t) => ({
			organizationOccupationId: t.organizationOccupationId,
			organizationSpecialtyId: t.organizationSpecialtyId,
			occupation: t.organizationOccupation.occupation,
			specialty: t.organizationSpecialty?.specialty ?? null,
			wallet: {
				id: t.id,
				itemsCount: t._count.complianceWalletTemplateItems,
			},
		}));
	}

	async getById(
		id: string,
		organizationId: string,
	): Promise<WalletTemplateDetail> {
		const template =
			await this.prismaService.complianceWalletTemplate.findFirst({
				where: { id, organizationId },
				include: {
					organizationOccupation: {
						select: {
							occupation: {
								select: { id: true, name: true, acronym: true },
							},
						},
					},
					organizationSpecialty: {
						select: {
							specialty: {
								select: { id: true, name: true, acronym: true },
							},
						},
					},
					complianceWalletTemplateItems: {
						include: {
							complianceListItem: {
								select: {
									id: true,
									name: true,
									category: true,
									expirationType: true,
								},
							},
						},
					},
				},
			});

		if (!template) {
			throw new NotFoundException("Compliance wallet template not found.");
		}

		return {
			id: template.id,
			organizationId: template.organizationId,
			organizationOccupationId: template.organizationOccupationId,
			organizationSpecialtyId: template.organizationSpecialtyId,
			occupation: template.organizationOccupation.occupation,
			specialty: template.organizationSpecialty?.specialty ?? null,
			items: template.complianceWalletTemplateItems.map((item) => ({
				id: item.id,
				complianceListItemId: item.complianceListItemId,
				complianceListItem: {
					id: item.complianceListItem.id,
					name: item.complianceListItem.name,
					category: item.complianceListItem.category,
					expirationType: item.complianceListItem.expirationType,
				},
			})),
		};
	}

	async updateItems(
		id: string,
		organizationId: string,
		complianceListItemIds: string[],
		userId?: string,
	): Promise<WalletTemplateDetail> {
		const template =
			await this.prismaService.complianceWalletTemplate.findFirst({
				where: { id, organizationId },
			});

		if (!template) {
			throw new NotFoundException("Compliance wallet template not found.");
		}

		if (complianceListItemIds.length > 0) {
			const items = await this.prismaService.complianceListItem.findMany({
				where: { id: { in: complianceListItemIds } },
				select: {
					id: true,
					status: true,
					name: true,
					responseStyle: true,
					displayToCandidate: true,
				},
			});
			const inactiveItems = items.filter((item) => item.status === "INACTIVE");
			if (inactiveItems.length > 0) {
				throw new BadRequestException(
					`Cannot add inactive compliance items to wallet: ${inactiveItems.map((i) => i.name).join(", ")}`,
				);
			}
			const internalTaskItems = items.filter(
				(item) =>
					item.responseStyle === ComplianceListItemResponseStyle.INTERNAL_TASK,
			);
			if (internalTaskItems.length > 0) {
				throw new BadRequestException(
					`Internal task items cannot be added to a candidate document wallet: ${internalTaskItems.map((i) => i.name).join(", ")}`,
				);
			}
			const hiddenItems = items.filter((item) => !item.displayToCandidate);
			if (hiddenItems.length > 0) {
				throw new BadRequestException(
					`Items hidden from candidates cannot be added to a candidate document wallet: ${hiddenItems.map((i) => i.name).join(", ")}`,
				);
			}
		}

		await this.prismaService.$transaction(async (tx) => {
			await tx.complianceWalletTemplateItem.deleteMany({
				where: { complianceWalletTemplateId: id },
			});

			if (complianceListItemIds.length > 0) {
				await tx.complianceWalletTemplateItem.createMany({
					data: complianceListItemIds.map((complianceListItemId) => ({
						organizationId,
						complianceWalletTemplateId: id,
						complianceListItemId,
					})),
				});
			}

			await tx.complianceWalletTemplate.update({
				where: { id },
				data: { updatedBy: userId },
			});
		});

		return this.getById(id, organizationId);
	}

	async delete(id: string, organizationId: string): Promise<void> {
		const template =
			await this.prismaService.complianceWalletTemplate.findFirst({
				where: { id, organizationId },
			});

		if (!template) {
			throw new NotFoundException("Compliance wallet template not found.");
		}

		await this.prismaService.complianceWalletTemplateItem.deleteMany({
			where: {
				complianceWalletTemplateId: id,
				organizationId,
			},
		});
	}

	async createTemplatesForOrgOccupations(
		organizationId: string,
		organizationOccupationIds: string[],
		userId?: string,
		tx?: PrismaTx,
	): Promise<void> {
		if (organizationOccupationIds.length === 0) return;

		const prisma = tx ?? this.prismaService;
		const existing = await prisma.complianceWalletTemplate.findMany({
			where: {
				organizationId,
				organizationOccupationId: { in: organizationOccupationIds },
				organizationSpecialtyId: null,
			},
			select: { organizationOccupationId: true },
		});
		const existingIds = new Set(
			existing.map((e) => e.organizationOccupationId),
		);
		const toCreate = organizationOccupationIds.filter(
			(id) => !existingIds.has(id),
		);
		if (toCreate.length === 0) return;

		await prisma.complianceWalletTemplate.createMany({
			data: toCreate.map((organizationOccupationId) => ({
				organizationId,
				organizationOccupationId,
				organizationSpecialtyId: null,
				createdBy: userId,
				updatedBy: userId,
			})),
		});
	}

	async createTemplatesForOrgSpecialties(
		organizationId: string,
		orgSpecialties: { id: string; organizationOccupationId: string }[],
		userId?: string,
		tx?: PrismaTx,
	): Promise<void> {
		if (orgSpecialties.length === 0) return;

		const prisma = tx ?? this.prismaService;
		const existing = await prisma.complianceWalletTemplate.findMany({
			where: {
				organizationId,
				organizationSpecialtyId: {
					in: orgSpecialties.map((os) => os.id),
				},
			},
			select: { organizationSpecialtyId: true },
		});
		const existingSpecIds = new Set(
			existing
				.map((e) => e.organizationSpecialtyId)
				.filter((id): id is string => id != null),
		);
		const toCreate = orgSpecialties.filter((os) => !existingSpecIds.has(os.id));
		if (toCreate.length === 0) return;

		await prisma.complianceWalletTemplate.createMany({
			data: toCreate.map((os) => ({
				organizationId,
				organizationOccupationId: os.organizationOccupationId,
				organizationSpecialtyId: os.id,
				createdBy: userId,
				updatedBy: userId,
			})),
		});
	}
}
