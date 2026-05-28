import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import type { CreateComplianceChecklistDto } from "./dto/create-compliance-checklist.dto";
import type { QueryComplianceChecklistDto } from "./dto/query-compliance-checklist.dto";
import type { UpdateComplianceChecklistDto } from "./dto/update-compliance-checklist.dto";

const CHECKLIST_SELECT = {
	id: true,
	organizationId: true,
	name: true,
	description: true,
	isActive: true,
	createdById: true,
	updatedById: true,
	createdAt: true,
	updatedAt: true,
	items: {
		select: {
			id: true,
			checklistId: true,
			complianceListItemId: true,
			phase: true,
			createdAt: true,
			complianceListItem: {
				select: {
					id: true,
					name: true,
					category: true,
					expirationType: true,
					displayToCandidate: true,
					status: true,
				},
			},
		},
	},
	_count: {
		select: {
			requisitions: true,
			requisitionTemplates: true,
		},
	},
} as const;

@Injectable()
export class ComplianceChecklistService {
	constructor(private readonly prisma: PrismaService) {}

	async getChecklists(orgId: string, query: QueryComplianceChecklistDto) {
		const page = query.page ?? 1;
		const limit = query.limit ?? 10;
		const skip = (page - 1) * limit;

		const where = {
			organizationId: orgId,
			isActive: true,
			...(query.search?.trim()
				? {
						OR: [
							{
								name: {
									contains: query.search.trim(),
									mode: "insensitive" as const,
								},
							},
							{
								description: {
									contains: query.search.trim(),
									mode: "insensitive" as const,
								},
							},
						],
					}
				: {}),
		};

		const [data, total] = await Promise.all([
			this.prisma.complianceChecklist.findMany({
				where,
				select: CHECKLIST_SELECT,
				orderBy: { updatedAt: "desc" },
				skip,
				take: limit,
			}),
			this.prisma.complianceChecklist.count({ where }),
		]);

		return {
			data,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit) || 1,
		};
	}

	async getChecklist(orgId: string, id: string) {
		const checklist = await this.prisma.complianceChecklist.findFirst({
			where: { id, organizationId: orgId },
			select: CHECKLIST_SELECT,
		});
		if (!checklist) {
			throw new NotFoundException("Compliance checklist not found.");
		}
		return checklist;
	}

	async createChecklist(
		orgId: string,
		dto: CreateComplianceChecklistDto,
		userId: string,
	) {
		await this.validateListItemIds(dto.complianceListItemIds);

		return this.prisma.complianceChecklist.create({
			data: {
				organizationId: orgId,
				name: dto.name,
				description: dto.description ?? null,
				createdById: userId,
				updatedById: userId,
				items: {
					create: dto.complianceListItemIds.map((complianceListItemId) => ({
						complianceListItemId,
					})),
				},
			},
			select: CHECKLIST_SELECT,
		});
	}

	async updateChecklist(
		orgId: string,
		id: string,
		dto: UpdateComplianceChecklistDto,
		userId: string,
	) {
		const existing = await this.prisma.complianceChecklist.findFirst({
			where: { id, organizationId: orgId },
			select: { id: true },
		});
		if (!existing) {
			throw new NotFoundException("Compliance checklist not found.");
		}

		if (dto.complianceListItemIds) {
			await this.validateListItemIds(dto.complianceListItemIds);
		}

		return this.prisma.$transaction(async (tx) => {
			if (dto.complianceListItemIds) {
				await tx.complianceChecklistItem.deleteMany({
					where: { checklistId: id },
				});
				await tx.complianceChecklistItem.createMany({
					data: dto.complianceListItemIds.map((complianceListItemId) => ({
						checklistId: id,
						complianceListItemId,
					})),
				});
			}

			return tx.complianceChecklist.update({
				where: { id },
				data: {
					...(dto.name !== undefined && { name: dto.name }),
					...(dto.description !== undefined && {
						description: dto.description ?? null,
					}),
					updatedById: userId,
				},
				select: CHECKLIST_SELECT,
			});
		});
	}

	async deleteChecklist(orgId: string, id: string) {
		const existing = await this.prisma.complianceChecklist.findFirst({
			where: { id, organizationId: orgId },
			select: {
				id: true,
				requisitions: { select: { id: true }, take: 1 },
				requisitionTemplates: { select: { id: true }, take: 1 },
			},
		});
		if (!existing) {
			throw new NotFoundException("Compliance checklist not found.");
		}
		if (
			existing.requisitions.length > 0 ||
			existing.requisitionTemplates.length > 0
		) {
			throw new BadRequestException(
				"Cannot delete a checklist that is linked to requisitions or requisition templates",
			);
		}

		await this.prisma.complianceChecklist.delete({ where: { id } });
	}

	async duplicateChecklist(orgId: string, id: string, userId: string) {
		const source = await this.getChecklist(orgId, id);

		return this.prisma.complianceChecklist.create({
			data: {
				organizationId: orgId,
				name: `${source.name} (Copy)`,
				description: source.description ?? null,
				createdById: userId,
				updatedById: userId,
				items: {
					create: source.items.map(({ complianceListItemId, phase }) => ({
						complianceListItemId,
						phase,
					})),
				},
			},
			select: CHECKLIST_SELECT,
		});
	}

	private async validateListItemIds(ids: string[]) {
		const found = await this.prisma.complianceListItem.count({
			where: { id: { in: ids }, status: "ACTIVE" },
		});
		if (found !== ids.length) {
			throw new BadRequestException(
				"One or more compliance list item IDs are invalid or inactive",
			);
		}
	}
}
