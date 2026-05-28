import { BadRequestException, Injectable } from "@nestjs/common";
import {
	RequisitionAttentionRuleKey,
	type RequisitionAttentionRuleUnit,
} from "@repo/db";
import {
	REQUISITION_ATTENTION_RULE_DEFAULTS,
	REQUISITION_ATTENTION_RULE_KEYS,
	RULE_KEY_ALLOWED_UNITS,
} from "@repo/shared";
import { PrismaService } from "src/prisma/prisma.service";
import type {
	RequisitionAttentionRuleInputDto,
	UpsertRequisitionAttentionRulesDto,
} from "../dto/upsert-requisition-attention-rules.dto";

export type ResolvedAttentionRule = {
	key: RequisitionAttentionRuleKey;
	thresholdValue: number;
	thresholdUnit: `${RequisitionAttentionRuleUnit}`;
	isEnabled: boolean;
	isConfigured: boolean;
};

@Injectable()
export class RequisitionAttentionRulesService {
	constructor(private readonly prisma: PrismaService) {}

	async list(organizationId: string): Promise<ResolvedAttentionRule[]> {
		const rows = await this.prisma.requisitionAttentionRule.findMany({
			where: { organizationId },
			select: {
				key: true,
				thresholdValue: true,
				thresholdUnit: true,
				isEnabled: true,
			},
		});
		const byKey = new Map(rows.map((r) => [r.key, r]));
		return REQUISITION_ATTENTION_RULE_KEYS.map((key) => {
			const row = byKey.get(key);
			if (row) return { ...row, isConfigured: true };
			const def = REQUISITION_ATTENTION_RULE_DEFAULTS[key];
			return {
				key,
				thresholdValue: def.thresholdValue,
				thresholdUnit: def.thresholdUnit,
				isEnabled: def.isEnabled,
				isConfigured: false,
			};
		});
	}

	async resolveByKey(
		organizationId: string,
	): Promise<Record<RequisitionAttentionRuleKey, ResolvedAttentionRule>> {
		const rules = await this.list(organizationId);
		const out = {} as Record<
			RequisitionAttentionRuleKey,
			ResolvedAttentionRule
		>;
		for (const rule of rules) {
			out[rule.key] = rule;
		}
		return out;
	}

	async upsertMany(
		organizationId: string,
		dto: UpsertRequisitionAttentionRulesDto,
	): Promise<ResolvedAttentionRule[]> {
		this.assertValidUnits(dto.rules);
		await this.prisma.$transaction(
			dto.rules.map((rule) =>
				this.prisma.requisitionAttentionRule.upsert({
					where: {
						organizationId_key: { organizationId, key: rule.key },
					},
					update: {
						thresholdValue: rule.thresholdValue,
						thresholdUnit: rule.thresholdUnit,
						isEnabled: rule.isEnabled,
					},
					create: {
						organizationId,
						key: rule.key,
						thresholdValue: rule.thresholdValue,
						thresholdUnit: rule.thresholdUnit,
						isEnabled: rule.isEnabled,
					},
				}),
			),
		);
		return this.list(organizationId);
	}

	private assertValidUnits(rules: RequisitionAttentionRuleInputDto[]): void {
		for (const rule of rules) {
			const allowed = RULE_KEY_ALLOWED_UNITS[rule.key];
			if (!allowed.includes(rule.thresholdUnit)) {
				throw new BadRequestException(
					`Rule ${rule.key} does not allow unit ${rule.thresholdUnit}. Allowed: ${allowed.join(", ")}`,
				);
			}
		}
	}
}
