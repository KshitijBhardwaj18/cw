import { SUBMISSION_STAGE_OPTIONS, SubmissionStage } from "@repo/shared";

export {
	ACTIVE_SUBMISSION_STAGES,
	SUBMISSION_STAGE_ALL_VALUES,
	SUBMISSION_STAGE_OPTIONS as SUBMISSION_STAGE_SELECT_OPTIONS,
	SubmissionStage,
} from "@repo/shared";

/**
 * String-union alias for `SubmissionStage` — kept for backward compat so existing
 * code that annotates `stage: SubmissionStageKey` or compares `stage === "SUBMITTED"`
 * keeps compiling without changes. New code should use `SubmissionStage` directly.
 */
export type SubmissionStageKey = `${SubmissionStage}`;

export type SubmissionAgingBucket = "OVERDUE" | "NEAR" | "WITHIN";

export interface SubmissionListRow {
	id: string;
	stage: SubmissionStageKey;
	agingBucket: SubmissionAgingBucket;
	/** Display: on-time vs at-risk (maps to aging UI). */
	slaLabel: "ON_TIME" | "OVERDUE" | "NEAR";
	candidateName: string;
	candidateEmail: string;
	jobTitle: string;
	facilityName: string;
	occupationLabel: string;
	departmentName: string;
	vendorName: string;
	hiringManagerName: string;
	hiringManagerDepartment: string;
	/** Prefer Submission.billingRate; falls back to Requisition.billRate in API. */
	billRate: number | null;
	/** Submission.stageEnteredAt */
	stageEnteredAt: string;
	agingDeadlineAt: string | null;
}

/**
 * Icon name for each submission stage (UI-only; lives in app, not shared package).
 * Labels come from `SUBMISSION_STAGE_OPTIONS` in `@repo/shared`.
 */
const STAGE_ICONS = {
	[SubmissionStage.SUBMITTED]: "file",
	[SubmissionStage.QUALIFIED]: "user",
	[SubmissionStage.SHORTLISTED]: "calendar",
	[SubmissionStage.INTERVIEW_SCHEDULED]: "calendarClock",
	[SubmissionStage.INTERVIEW_COMPLETED]: "check",
	[SubmissionStage.OFFERED]: "offer",
	[SubmissionStage.ACCEPTED]: "gift",
	[SubmissionStage.WITHDRAWN]: "withdraw",
	[SubmissionStage.REJECTED]: "reject",
} as const satisfies Record<
	SubmissionStage,
	| "file"
	| "user"
	| "calendar"
	| "calendarClock"
	| "check"
	| "offer"
	| "gift"
	| "withdraw"
	| "reject"
>;

export const SUBMISSION_STAGE_TABS = SUBMISSION_STAGE_OPTIONS.map((opt) => ({
	stage: opt.value as SubmissionStageKey,
	label: opt.label,
	icon: STAGE_ICONS[opt.value],
}));

export type SubmissionAgingFilter = "ALL" | SubmissionAgingBucket;

export type SubmissionAgingStatCardContent = {
	key: SubmissionAgingFilter;
	label: string;
	hint: string;
};

export const SUBMISSION_AGING_STAT_CARDS: SubmissionAgingStatCardContent[] = [
	{ key: "ALL", label: "Total", hint: "All in stage" },
	{ key: "OVERDUE", label: "Overdue", hint: "Past deadline" },
	{ key: "NEAR", label: "Near Deadline", hint: "<12h left" },
	{ key: "WITHIN", label: "Within Deadline", hint: "On track" },
];
