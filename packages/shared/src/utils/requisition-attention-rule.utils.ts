import {
	RequisitionAttentionRuleKey,
	RequisitionAttentionRuleUnit,
} from "../enums/requisition-attention-rule.enum";

export type RequisitionAttentionRuleDefault = {
	thresholdValue: number;
	thresholdUnit: RequisitionAttentionRuleUnit;
	isEnabled: boolean;
};

export const REQUISITION_ATTENTION_RULE_DEFAULTS: Record<
	RequisitionAttentionRuleKey,
	RequisitionAttentionRuleDefault
> = {
	[RequisitionAttentionRuleKey.SLOW_TIME_TO_FILL]: {
		thresholdValue: 14,
		thresholdUnit: RequisitionAttentionRuleUnit.DAYS,
		isEnabled: true,
	},
	[RequisitionAttentionRuleKey.LOW_SUBMISSION_COUNT]: {
		thresholdValue: 3,
		thresholdUnit: RequisitionAttentionRuleUnit.COUNT,
		isEnabled: true,
	},
	[RequisitionAttentionRuleKey.NO_SUBMISSIONS]: {
		thresholdValue: 7,
		thresholdUnit: RequisitionAttentionRuleUnit.DAYS,
		isEnabled: true,
	},
};

export const REQUISITION_ATTENTION_RULE_KEYS = Object.values(
	RequisitionAttentionRuleKey,
) as RequisitionAttentionRuleKey[];

export const REQUISITION_ATTENTION_RULE_LABEL: Record<
	RequisitionAttentionRuleKey,
	string
> = {
	[RequisitionAttentionRuleKey.SLOW_TIME_TO_FILL]: "Slow Time to Fill",
	[RequisitionAttentionRuleKey.LOW_SUBMISSION_COUNT]: "Low Submission Count",
	[RequisitionAttentionRuleKey.NO_SUBMISSIONS]: "No Submissions",
};

export const RULE_KEY_ALLOWED_UNITS: Record<
	RequisitionAttentionRuleKey,
	`${RequisitionAttentionRuleUnit}`[]
> = {
	[RequisitionAttentionRuleKey.SLOW_TIME_TO_FILL]: [
		RequisitionAttentionRuleUnit.HOURS,
		RequisitionAttentionRuleUnit.DAYS,
	],
	[RequisitionAttentionRuleKey.LOW_SUBMISSION_COUNT]: [
		RequisitionAttentionRuleUnit.COUNT,
	],
	[RequisitionAttentionRuleKey.NO_SUBMISSIONS]: [
		RequisitionAttentionRuleUnit.HOURS,
		RequisitionAttentionRuleUnit.DAYS,
	],
};

export function attentionRuleThresholdToDays(
	value: number,
	unit: `${RequisitionAttentionRuleUnit}`,
): number {
	if (unit === RequisitionAttentionRuleUnit.HOURS) {
		return Math.max(1, Math.ceil(value / 24));
	}
	return Math.max(1, value);
}
