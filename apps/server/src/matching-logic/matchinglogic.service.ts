import { Injectable, NotFoundException } from "@nestjs/common";
import { DEFAULT_MATCHING_LOGIC_WEIGHTS } from "@repo/shared";
import { PrismaService } from "src/prisma/prisma.service";
import type { MatchingCriterionWithLogicDto } from "./dto/matching-criterion-with-logic.dto";
import type { SaveMatchingLogicDto } from "./dto/save-matching-logic.dto";

@Injectable()
export class MatchingLogicService {
	constructor(private readonly prisma: PrismaService) {}

	async seedDefaultMatchingLogic(
		organizationId: string,
		tx: Pick<PrismaService, "matchingLogic" | "matchingCriterion">,
	): Promise<void> {
		const criteria = await tx.matchingCriterion.findMany();
		for (const criterion of criteria) {
			const weight = DEFAULT_MATCHING_LOGIC_WEIGHTS[criterion.key];
			const active = weight !== undefined;
			await tx.matchingLogic.upsert({
				where: {
					organizationId_matchingCriterionId: {
						organizationId,
						matchingCriterionId: criterion.id,
					},
				},
				create: {
					organizationId,
					matchingCriterionId: criterion.id,
					active,
					weight: active ? weight : 0,
				},
				update: {
					active,
					weight: active ? weight : 0,
				},
			});
		}
	}

	private async ensureOrgExists(organizationId: string): Promise<void> {
		const org = await this.prisma.organization.findUnique({
			where: { id: organizationId },
			select: { id: true },
		});
		if (!org) {
			throw new NotFoundException(`Organization ${organizationId} not found`);
		}
	}

	async findMatchingLogicsForOrg(
		organizationId: string,
	): Promise<MatchingCriterionWithLogicDto[]> {
		await this.ensureOrgExists(organizationId);

		const criteria = await this.prisma.matchingCriterion.findMany({
			include: {
				matchingLogics: {
					where: { organizationId },
				},
			},
			orderBy: { name: "asc" },
		});

		return criteria.map((criterion) => {
			const orgLogic = criterion.matchingLogics[0];
			return {
				matchingCriterionId: criterion.id,
				key: criterion.key,
				name: criterion.name,
				description: criterion.description,
				active: orgLogic?.active ?? false,
				weight: orgLogic?.weight ?? 0,
				matchingLogicId: orgLogic?.id ?? null,
			};
		});
	}

	async saveMatchingLogicForOrg(
		organizationId: string,
		dto: SaveMatchingLogicDto,
		userId?: string,
	): Promise<MatchingCriterionWithLogicDto[]> {
		await this.ensureOrgExists(organizationId);

		await this.prisma.$transaction(
			dto.items.map((item) =>
				this.prisma.matchingLogic.upsert({
					where: {
						organizationId_matchingCriterionId: {
							organizationId,
							matchingCriterionId: item.matchingCriterionId,
						},
					},
					create: {
						organizationId,
						matchingCriterionId: item.matchingCriterionId,
						active: item.active,
						weight: item.weight,
						createdBy: userId,
						updatedBy: userId,
					},
					update: {
						active: item.active,
						weight: item.weight,
						updatedBy: userId,
					},
				}),
			),
		);

		return this.findMatchingLogicsForOrg(organizationId);
	}
}
