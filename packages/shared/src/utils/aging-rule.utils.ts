import {
	AgingRuleStageTransition,
	AgingRuleUnit,
	type CandidateAgingCardKey,
} from "../enums/aging-rule.enum";
import { SubmissionStage } from "../enums/submission.enum";

export type AgingRuleDefault = {
	thresholdValue: number;
	thresholdUnit: AgingRuleUnit;
	isEnabled: boolean;
};

export const AGING_RULE_DEFAULTS: Record<
	AgingRuleStageTransition,
	AgingRuleDefault
> = {
	[AgingRuleStageTransition.SUBMISSION_TO_QUALIFIED]: {
		thresholdValue: 1,
		thresholdUnit: AgingRuleUnit.DAYS,
		isEnabled: true,
	},
	[AgingRuleStageTransition.QUALIFIED_TO_SHORTLISTED]: {
		thresholdValue: 3,
		thresholdUnit: AgingRuleUnit.DAYS,
		isEnabled: true,
	},
	[AgingRuleStageTransition.SHORTLISTED_TO_INTERVIEW_SCHEDULED]: {
		thresholdValue: 7,
		thresholdUnit: AgingRuleUnit.DAYS,
		isEnabled: true,
	},
	[AgingRuleStageTransition.INTERVIEW_SCHEDULED_TO_INTERVIEW_COMPLETED]: {
		thresholdValue: 7,
		thresholdUnit: AgingRuleUnit.DAYS,
		isEnabled: true,
	},
	[AgingRuleStageTransition.INTERVIEW_COMPLETED_TO_OFFER_SENT]: {
		thresholdValue: 7,
		thresholdUnit: AgingRuleUnit.DAYS,
		isEnabled: true,
	},
	[AgingRuleStageTransition.OFFER_SENT_TO_OFFER_ACCEPTED]: {
		thresholdValue: 2,
		thresholdUnit: AgingRuleUnit.DAYS,
		isEnabled: true,
	},
	[AgingRuleStageTransition.OFFER_ACCEPTED_TO_ONBOARDING]: {
		thresholdValue: 5,
		thresholdUnit: AgingRuleUnit.DAYS,
		isEnabled: true,
	},
	[AgingRuleStageTransition.ONBOARDING_TO_STARTED]: {
		thresholdValue: 5,
		thresholdUnit: AgingRuleUnit.DAYS,
		isEnabled: true,
	},
	[AgingRuleStageTransition.SUBMITTED_TO_REJECTED]: {
		thresholdValue: 7,
		thresholdUnit: AgingRuleUnit.DAYS,
		isEnabled: true,
	},
	[AgingRuleStageTransition.OFFER_SENT_TO_OFFER_DECLINED]: {
		thresholdValue: 7,
		thresholdUnit: AgingRuleUnit.DAYS,
		isEnabled: true,
	},
};

/**
 * Active set of stage transitions exposed to the admin UI and command center.
 *
 * Per product spec, these transitions are intentionally excluded:
 * - `ONBOARDING_TO_STARTED` — placements start automatically.
 * - `SUBMITTED_TO_REJECTED` — terminal stage, no aging.
 * - `OFFER_SENT_TO_OFFER_DECLINED` — terminal stage, no aging.
 *
 * The enum still includes them so historical rows (if any) deserialise; just don't
 * iterate `Object.values(AgingRuleStageTransition)` anywhere — always use this array.
 */
export const AGING_RULE_STAGE_TRANSITIONS: AgingRuleStageTransition[] = [
	AgingRuleStageTransition.SUBMISSION_TO_QUALIFIED,
	AgingRuleStageTransition.QUALIFIED_TO_SHORTLISTED,
	AgingRuleStageTransition.SHORTLISTED_TO_INTERVIEW_SCHEDULED,
	AgingRuleStageTransition.INTERVIEW_SCHEDULED_TO_INTERVIEW_COMPLETED,
	AgingRuleStageTransition.INTERVIEW_COMPLETED_TO_OFFER_SENT,
	AgingRuleStageTransition.OFFER_SENT_TO_OFFER_ACCEPTED,
	AgingRuleStageTransition.OFFER_ACCEPTED_TO_ONBOARDING,
];

export const AGING_RULE_STAGE_TRANSITION_LABEL: Record<
	AgingRuleStageTransition,
	string
> = {
	[AgingRuleStageTransition.SUBMISSION_TO_QUALIFIED]: "Submission → Qualified",
	[AgingRuleStageTransition.QUALIFIED_TO_SHORTLISTED]:
		"Qualified → Shortlisted",
	[AgingRuleStageTransition.SHORTLISTED_TO_INTERVIEW_SCHEDULED]:
		"Shortlisted → Interview Scheduled",
	[AgingRuleStageTransition.INTERVIEW_SCHEDULED_TO_INTERVIEW_COMPLETED]:
		"Interview Scheduled → Interview Completed",
	[AgingRuleStageTransition.INTERVIEW_COMPLETED_TO_OFFER_SENT]:
		"Interview Completed → Offer Sent",
	[AgingRuleStageTransition.OFFER_SENT_TO_OFFER_ACCEPTED]:
		"Offer Sent → Offer Accepted",
	[AgingRuleStageTransition.OFFER_ACCEPTED_TO_ONBOARDING]:
		"Offer Accepted → Onboarding",
	[AgingRuleStageTransition.ONBOARDING_TO_STARTED]: "Onboarding → Started",
	[AgingRuleStageTransition.SUBMITTED_TO_REJECTED]: "Submitted → Rejected",
	[AgingRuleStageTransition.OFFER_SENT_TO_OFFER_DECLINED]:
		"Offer Sent → Offer Declined",
};

export const STAGE_TRANSITION_TO_CARD: Partial<
	Record<AgingRuleStageTransition, CandidateAgingCardKey>
> = {
	[AgingRuleStageTransition.SUBMISSION_TO_QUALIFIED]: "overdue-submissions",
	[AgingRuleStageTransition.QUALIFIED_TO_SHORTLISTED]: "aging-qualified",
	[AgingRuleStageTransition.SHORTLISTED_TO_INTERVIEW_SCHEDULED]:
		"aging-shortlisted",
	[AgingRuleStageTransition.INTERVIEW_SCHEDULED_TO_INTERVIEW_COMPLETED]:
		"interview-delayed",
	[AgingRuleStageTransition.INTERVIEW_COMPLETED_TO_OFFER_SENT]: "offer-pending",
	[AgingRuleStageTransition.OFFER_SENT_TO_OFFER_ACCEPTED]: "overdue-offers",
	[AgingRuleStageTransition.OFFER_ACCEPTED_TO_ONBOARDING]: "delayed-onboarding",
};

export const CARD_TO_STAGE_TRANSITIONS: Record<
	CandidateAgingCardKey,
	AgingRuleStageTransition[]
> = {
	"overdue-submissions": [AgingRuleStageTransition.SUBMISSION_TO_QUALIFIED],
	"aging-qualified": [AgingRuleStageTransition.QUALIFIED_TO_SHORTLISTED],
	"aging-shortlisted": [
		AgingRuleStageTransition.SHORTLISTED_TO_INTERVIEW_SCHEDULED,
	],
	"interview-delayed": [
		AgingRuleStageTransition.INTERVIEW_SCHEDULED_TO_INTERVIEW_COMPLETED,
	],
	"offer-pending": [AgingRuleStageTransition.INTERVIEW_COMPLETED_TO_OFFER_SENT],
	"overdue-offers": [AgingRuleStageTransition.OFFER_SENT_TO_OFFER_ACCEPTED],
	"delayed-onboarding": [AgingRuleStageTransition.OFFER_ACCEPTED_TO_ONBOARDING],
};

export const AGING_RULE_ALLOWED_UNITS: `${AgingRuleUnit}`[] = [
	AgingRuleUnit.HOURS,
	AgingRuleUnit.DAYS,
];

export function agingRuleThresholdToDays(
	value: number,
	unit: `${AgingRuleUnit}`,
): number {
	if (unit === AgingRuleUnit.HOURS) {
		return Math.max(1, Math.ceil(value / 24));
	}
	return Math.max(1, value);
}

export function agingRuleUnitLabel(unit: `${AgingRuleUnit}`): string {
	return unit.toLowerCase();
}

export const SUBMISSION_STAGE_TO_TRANSITION: Record<
	`${SubmissionStage}`,
	AgingRuleStageTransition | null
> = {
	[SubmissionStage.SUBMITTED]: AgingRuleStageTransition.SUBMISSION_TO_QUALIFIED,
	[SubmissionStage.QUALIFIED]:
		AgingRuleStageTransition.QUALIFIED_TO_SHORTLISTED,
	[SubmissionStage.SHORTLISTED]:
		AgingRuleStageTransition.SHORTLISTED_TO_INTERVIEW_SCHEDULED,
	[SubmissionStage.INTERVIEW_SCHEDULED]:
		AgingRuleStageTransition.INTERVIEW_SCHEDULED_TO_INTERVIEW_COMPLETED,
	[SubmissionStage.INTERVIEW_COMPLETED]:
		AgingRuleStageTransition.INTERVIEW_COMPLETED_TO_OFFER_SENT,
	[SubmissionStage.OFFERED]:
		AgingRuleStageTransition.OFFER_SENT_TO_OFFER_ACCEPTED,
	[SubmissionStage.ACCEPTED]: null,
	[SubmissionStage.WITHDRAWN]: null,
	[SubmissionStage.REJECTED]: null,
};

export function agingRuleThresholdToHours(
	value: number,
	unit: `${AgingRuleUnit}`,
): number {
	if (unit === AgingRuleUnit.DAYS) {
		return Math.max(1, value) * 24;
	}
	return Math.max(1, value);
}
