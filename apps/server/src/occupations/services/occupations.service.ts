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

function diffOrgOccupations(
	existing: { occupationId: string }[],
	desired: string[],
): { toAdd: string[]; toRemove: string[] } {
	const existingSet = new Set(existing.map((e) => e.occupationId));
	const desiredSet = new Set(desired);
	return {
		toAdd: desired.filter((id) => !existingSet.has(id)),
		toRemove: [...existingSet].filter((id) => !desiredSet.has(id)),
	};
}

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
			throw new NotFoundException("Occupation not found.");
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
			throw new NotFoundException("Occupation not found.");
		}

		await this.prismaService.occupation.delete({ where: { id } });
	}

	async linkOccupationsToOrganization(dto: LinkOrgOccupationsInput) {
		await this.requireOrganization(dto.organizationId);
		const desired = [...new Set(dto.occupationIds)];

		return this.prismaService.$transaction(async (tx) => {
			const existing = await tx.organizationOccupation.findMany({
				where: {
					organizationId: dto.organizationId,
					occupationId: { in: desired },
				},
				select: { occupationId: true },
			});
			const alreadyLinked = new Set(existing.map((r) => r.occupationId));
			const toAdd = desired.filter((id) => !alreadyLinked.has(id));

			await this.assertOccupationsAllowed(tx, toAdd, alreadyLinked);
			return this.linkOccupationsInTx(tx, {
				organizationId: dto.organizationId,
				occupationIds: toAdd,
				userId: dto.userId,
			});
		});
	}

	async unlinkOccupationsFromOrganization(dto: UnlinkOrgOccupationsInput) {
		return this.prismaService.organizationOccupation.deleteMany({
			where: {
				organizationId: dto.organizationId,
				occupationId: { in: [...new Set(dto.occupationIds)] },
			},
		});
	}

	async replaceOccupationsForOrganization(dto: ReplaceOrgOccupationsInput) {
		await this.requireOrganization(dto.organizationId);
		const desired = [...new Set(dto.occupationIds)];

		await this.prismaService.$transaction(async (tx) => {
			const existing = await tx.organizationOccupation.findMany({
				where: { organizationId: dto.organizationId },
				select: { occupationId: true },
			});
			const { toAdd, toRemove } = diffOrgOccupations(existing, desired);
			const linkedSet = new Set(existing.map((e) => e.occupationId));

			await this.assertOccupationsAllowed(tx, toAdd, linkedSet);

			if (toRemove.length > 0) {
				await tx.organizationOccupation.deleteMany({
					where: {
						organizationId: dto.organizationId,
						occupationId: { in: toRemove },
					},
				});
			}
			await this.linkOccupationsInTx(tx, {
				organizationId: dto.organizationId,
				occupationIds: toAdd,
				userId: dto.userId,
			});
		});
	}

	private async requireOrganization(organizationId: string): Promise<void> {
		const exists = await this.prismaService.organization.findUnique({
			where: { id: organizationId },
			select: { id: true },
		});
		if (!exists) throw new NotFoundException("Organization not found.");
	}

	private async assertOccupationsAllowed(
		tx: Prisma.TransactionClient,
		occupationIds: string[],
		alreadyLinked: Set<string>,
	): Promise<void> {
		if (occupationIds.length === 0) return;
		const rows = await tx.occupation.findMany({
			where: { id: { in: occupationIds } },
			select: { id: true, status: true },
		});
		const byId = new Map(rows.map((r) => [r.id, r.status]));
		const missing = occupationIds.filter((id) => !byId.has(id));
		if (missing.length > 0) {
			throw new NotFoundException(
				"One or more selected occupations are not available.",
			);
		}
		const invalidInactive = occupationIds.filter(
			(id) =>
				byId.get(id) === $Enums.OccupationStatus.INACTIVE &&
				!alreadyLinked.has(id),
		);
		if (invalidInactive.length > 0) {
			throw new BadRequestException(
				"One or more selected occupations are inactive and cannot be linked.",
			);
		}
	}

	private async linkOccupationsInTx(
		tx: Prisma.TransactionClient,
		input: {
			organizationId: string;
			occupationIds: string[];
			userId: string;
		},
	): Promise<{ count: number }> {
		if (input.occupationIds.length === 0) return { count: 0 };
		const result = await tx.organizationOccupation.createMany({
			data: input.occupationIds.map((occupationId) => ({
				occupationId,
				organizationId: input.organizationId,
				createdBy: input.userId,
				updatedBy: input.userId,
			})),
			skipDuplicates: true,
		});
		const added = await tx.organizationOccupation.findMany({
			where: {
				organizationId: input.organizationId,
				occupationId: { in: input.occupationIds },
			},
			select: { id: true },
		});
		await this.complianceWalletTemplateService.createTemplatesForOrgOccupations(
			input.organizationId,
			added.map((a) => a.id),
			input.userId,
			tx,
		);
		return result;
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

	async getOrgEnabledSpecialtiesForOccupation(input: {
		organizationId: string;
		organizationOccupationId?: string;
		occupationId?: string;
	}): Promise<
		Array<{
			id: string;
			specialtyId: string;
			name: string;
			acronym: string | null;
		}>
	> {
		const { organizationId, organizationOccupationId, occupationId } = input;
		if (!organizationOccupationId && !occupationId) return [];

		const orgOccupation =
			await this.prismaService.organizationOccupation.findFirst({
				where: {
					organizationId,
					...(organizationOccupationId
						? { id: organizationOccupationId }
						: { occupationId }),
				},
				select: { id: true },
			});
		if (!orgOccupation) return [];

		const rows = await this.prismaService.organizationSpecialty.findMany({
			where: {
				organizationId,
				organizationOccupationId: orgOccupation.id,
			},
			select: {
				id: true,
				specialty: { select: { id: true, name: true, acronym: true } },
			},
			orderBy: { specialty: { name: "asc" } },
		});

		return rows.map((r) => ({
			id: r.id,
			specialtyId: r.specialty.id,
			name: r.specialty.name,
			acronym: r.specialty.acronym,
		}));
	}
}
