import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { MatchingCriterionKey } from "@repo/db";
import { DEFAULT_MATCHING_LOGIC_WEIGHTS } from "@repo/shared";
import { PrismaService } from "src/prisma/prisma.service";
import type { MatchingCriterionWithLogicDto } from "./dto/matching-criterion-with-logic.dto";
import type { SaveMatchingLogicDto } from "./dto/save-matching-logic.dto";

const GATE_CRITERION_KEYS: MatchingCriterionKey[] = [
	MatchingCriterionKey.OCCUPATION,
	MatchingCriterionKey.SPECIALTIES,
];

@Injectable()
export class MatchingLogicService {
	constructor(private readonly prisma: PrismaService) {}

	async seedDefaultMatchingLogic(
		organizationId: string,
		tx: Pick<PrismaService, "matchingLogic" | "matchingCriterion">,
	): Promise<void> {
		const criteria = await tx.matchingCriterion.findMany({
			where: { key: { notIn: GATE_CRITERION_KEYS } },
		});
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
			throw new NotFoundException("Organization not found.");
		}
	}

	async findMatchingLogicsForOrg(
		organizationId: string,
	): Promise<MatchingCriterionWithLogicDto[]> {
		await this.ensureOrgExists(organizationId);

		const criteria = await this.prisma.matchingCriterion.findMany({
			where: { key: { notIn: GATE_CRITERION_KEYS } },
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

		const submittedIds = dto.items.map((i) => i.matchingCriterionId);
		if (submittedIds.length > 0) {
			const gateRowCount = await this.prisma.matchingCriterion.count({
				where: {
					id: { in: submittedIds },
					key: { in: GATE_CRITERION_KEYS },
				},
			});
			if (gateRowCount > 0) {
				throw new BadRequestException(
					"Occupation and specialty are required to match and cannot be configured here",
				);
			}
		}

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
