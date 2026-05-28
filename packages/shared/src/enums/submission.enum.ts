/** Mirrors the Prisma `SubmissionStage` enum. Keep values in sync with schema.prisma. */
export enum SubmissionStage {
	SUBMITTED = "SUBMITTED",
	QUALIFIED = "QUALIFIED",
	SHORTLISTED = "SHORTLISTED",
	INTERVIEW_SCHEDULED = "INTERVIEW_SCHEDULED",
	INTERVIEW_COMPLETED = "INTERVIEW_COMPLETED",
	OFFERED = "OFFERED",
	ACCEPTED = "ACCEPTED",
	WITHDRAWN = "WITHDRAWN",
	REJECTED = "REJECTED",
}

export const SUBMISSION_STAGE_OPTIONS = [
	{ value: SubmissionStage.SUBMITTED, label: "Submitted" },
	{ value: SubmissionStage.QUALIFIED, label: "Qualified" },
	{ value: SubmissionStage.SHORTLISTED, label: "Shortlisted" },
	{ value: SubmissionStage.INTERVIEW_SCHEDULED, label: "Interview Scheduled" },
	{ value: SubmissionStage.INTERVIEW_COMPLETED, label: "Interview Completed" },
	{ value: SubmissionStage.OFFERED, label: "Offer" },
	{ value: SubmissionStage.ACCEPTED, label: "Accepted" },
	{ value: SubmissionStage.WITHDRAWN, label: "Withdrawn" },
	{ value: SubmissionStage.REJECTED, label: "Rejected" },
] as const satisfies readonly { value: SubmissionStage; label: string }[];

/** Pipeline stages that are not yet terminal (excludes WITHDRAWN and REJECTED). */
export const ACTIVE_SUBMISSION_STAGES = [
	SubmissionStage.SUBMITTED,
	SubmissionStage.QUALIFIED,
	SubmissionStage.SHORTLISTED,
	SubmissionStage.INTERVIEW_SCHEDULED,
	SubmissionStage.INTERVIEW_COMPLETED,
	SubmissionStage.OFFERED,
	SubmissionStage.ACCEPTED,
] as const satisfies readonly SubmissionStage[];

/** All stages — use for SLA iteration, aggregates, and Prisma `{ in: [...] }` (cast to `@repo/db` SubmissionStage). */
export const SUBMISSION_STAGE_ALL_VALUES = [
	SubmissionStage.SUBMITTED,
	SubmissionStage.QUALIFIED,
	SubmissionStage.SHORTLISTED,
	SubmissionStage.INTERVIEW_SCHEDULED,
	SubmissionStage.INTERVIEW_COMPLETED,
	SubmissionStage.OFFERED,
	SubmissionStage.ACCEPTED,
	SubmissionStage.WITHDRAWN,
	SubmissionStage.REJECTED,
] as const satisfies readonly SubmissionStage[];

/** Tab / permission buckets for submission pipelines (align with `@repo/casl` conditions). */
export const SUBMISSION_TAB_SUBMITTED_STAGES = [
	SubmissionStage.SUBMITTED,
] as const satisfies readonly SubmissionStage[];

export const SUBMISSION_TAB_QUALIFIED_STAGES = [
	SubmissionStage.QUALIFIED,
	SubmissionStage.SHORTLISTED,
] as const satisfies readonly SubmissionStage[];

export const SUBMISSION_TAB_INTERVIEW_STAGES = [
	SubmissionStage.INTERVIEW_SCHEDULED,
	SubmissionStage.INTERVIEW_COMPLETED,
] as const satisfies readonly SubmissionStage[];

export const SUBMISSION_TAB_OFFER_STAGES = [
	SubmissionStage.OFFERED,
	SubmissionStage.ACCEPTED,
] as const satisfies readonly SubmissionStage[];

export const SUBMISSION_TAB_REJECTED_STAGES = [
	SubmissionStage.REJECTED,
	SubmissionStage.WITHDRAWN,
] as const satisfies readonly SubmissionStage[];
