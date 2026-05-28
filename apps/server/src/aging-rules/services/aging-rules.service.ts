import { Injectable } from "@nestjs/common";
import { AgingRuleStageTransition, type AgingRuleUnit } from "@repo/db";
import {
	AGING_RULE_DEFAULTS,
	AGING_RULE_STAGE_TRANSITIONS,
} from "@repo/shared";
import { PrismaService } from "src/prisma/prisma.service";
import type { UpsertAgingRulesDto } from "../dto/upsert-aging-rules.dto";

export type ResolvedAgingRule = {
	stageTransition: AgingRuleStageTransition;
	thresholdValue: number;
	thresholdUnit: `${AgingRuleUnit}`;
	isEnabled: boolean;
	isConfigured: boolean;
};

@Injectable()
export class AgingRulesService {
	constructor(private readonly prisma: PrismaService) {}

	async list(organizationId: string): Promise<ResolvedAgingRule[]> {
		const rows = await this.prisma.agingRule.findMany({
			where: { organizationId },
			select: {
				stageTransition: true,
				thresholdValue: true,
				thresholdUnit: true,
				isEnabled: true,
			},
		});
		const byTransition = new Map(
			rows.map((r) => [r.stageTransition, r] as const),
		);
		return AGING_RULE_STAGE_TRANSITIONS.map((stageTransition) => {
			const row = byTransition.get(stageTransition);
			if (row) return { ...row, isConfigured: true };
			const def = AGING_RULE_DEFAULTS[stageTransition];
			return {
				stageTransition,
				thresholdValue: def.thresholdValue,
				thresholdUnit: def.thresholdUnit,
				isEnabled: def.isEnabled,
				isConfigured: false,
			};
		});
	}

	async resolveByTransition(
		organizationId: string,
	): Promise<Record<AgingRuleStageTransition, ResolvedAgingRule>> {
		const rules = await this.list(organizationId);
		const out = {} as Record<AgingRuleStageTransition, ResolvedAgingRule>;
		for (const rule of rules) {
			out[rule.stageTransition] = rule;
		}
		return out;
	}

	async deleteOne(
		organizationId: string,
		stageTransition: AgingRuleStageTransition,
	): Promise<void> {
		await this.prisma.agingRule.deleteMany({
			where: { organizationId, stageTransition },
		});
	}

	async upsertMany(
		organizationId: string,
		dto: UpsertAgingRulesDto,
	): Promise<ResolvedAgingRule[]> {
		await this.prisma.$transaction(
			dto.rules.map((rule) =>
				this.prisma.agingRule.upsert({
					where: {
						organizationId_stageTransition: {
							organizationId,
							stageTransition: rule.stageTransition,
						},
					},
					update: {
						thresholdValue: rule.thresholdValue,
						thresholdUnit: rule.thresholdUnit,
						isEnabled: rule.isEnabled,
					},
					create: {
						organizationId,
						stageTransition: rule.stageTransition,
						thresholdValue: rule.thresholdValue,
						thresholdUnit: rule.thresholdUnit,
						isEnabled: rule.isEnabled,
					},
				}),
			),
		);
		return this.list(organizationId);
	}
}
