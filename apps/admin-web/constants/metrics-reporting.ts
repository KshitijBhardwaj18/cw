import {
	AGING_RULE_STAGE_TRANSITION_LABEL,
	AGING_RULE_STAGE_TRANSITIONS,
	type AgingRuleStageTransition,
	type CandidateAgingCardKey,
	STAGE_TRANSITION_TO_CARD,
} from "@repo/shared";

/** KPI row shown in Metrics & Reporting (populated from `useOrganizationMetrics`). */
export type OrgMetricKpi = {
	id: string;
	name: string;
	goalDisplay: string;
	currentDisplay: string;
	trend: "up" | "down" | "flat";
	enabled: boolean;
	/** Raw goal shown in the edit dialog input (before suffix). */
	goalEditValue: string;
	goalInputSuffix: string;
	/** Helper under the input in Edit Goal dialog. */
	goalHelperText: string;
};

export type AgingRuleIndicatorKey = CandidateAgingCardKey;

export type AgingRuleRow = {
	id: string;
	stageValue: `${AgingRuleStageTransition}`;
	stageLabel: string;
	overdueAfter: number;
	unit: "Days" | "Hours";
	indicator: AgingRuleIndicatorKey;
	enabled: boolean;
};

export const STAGE_TRANSITION_OPTIONS: {
	value: `${AgingRuleStageTransition}` | "";
	label: string;
}[] = [
	{ value: "", label: "Select a stage" },
	...AGING_RULE_STAGE_TRANSITIONS.map((t) => ({
		value: t,
		label: AGING_RULE_STAGE_TRANSITION_LABEL[t],
	})),
];

export const AGING_RULE_UNIT_OPTIONS = [
	{ value: "Days", label: "Days" },
	{ value: "Hours", label: "Hours" },
] as const;

export const ACTIVE_AGING_RULE_TRANSITION_COUNT =
	AGING_RULE_STAGE_TRANSITIONS.length;

export function indicatorForTransition(
	stage: `${AgingRuleStageTransition}`,
): AgingRuleIndicatorKey {
	const card = STAGE_TRANSITION_TO_CARD[stage as AgingRuleStageTransition];
	return card ?? "overdue-submissions";
}
