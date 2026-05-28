import type { PrismaQuery } from "@casl/prisma";
import type { SubmissionStage } from "@repo/db";
import {
	SUBMISSION_TAB_INTERVIEW_STAGES,
	SUBMISSION_TAB_OFFER_STAGES,
	SUBMISSION_TAB_QUALIFIED_STAGES,
	SUBMISSION_TAB_REJECTED_STAGES,
	SUBMISSION_TAB_SUBMITTED_STAGES,
} from "@repo/shared";

/** Shared enums mirror Prisma — spread + cast preserves `@repo/db` typing for CASL queries. */
export const SUBMISSION_SUBMITTED_STAGES = [
	...SUBMISSION_TAB_SUBMITTED_STAGES,
] as SubmissionStage[];

export const SUBMISSION_QUALIFIED_STAGES = [
	...SUBMISSION_TAB_QUALIFIED_STAGES,
] as SubmissionStage[];

export const SUBMISSION_INTERVIEW_STAGES = [
	...SUBMISSION_TAB_INTERVIEW_STAGES,
] as SubmissionStage[];

export const SUBMISSION_OFFER_STAGES = [
	...SUBMISSION_TAB_OFFER_STAGES,
] as SubmissionStage[];

export const SUBMISSION_REJECTED_STAGES = [
	...SUBMISSION_TAB_REJECTED_STAGES,
] as SubmissionStage[];

export const SUBMISSION_TAB_CONDITIONS = {
	submitted: { stage: { in: SUBMISSION_SUBMITTED_STAGES } },
	qualified: { stage: { in: SUBMISSION_QUALIFIED_STAGES } },
	interviewScheduled: { stage: { in: SUBMISSION_INTERVIEW_STAGES } },
	offerExtended: { stage: { in: SUBMISSION_OFFER_STAGES } },
	rejected: { stage: { in: SUBMISSION_REJECTED_STAGES } },
} as const satisfies Record<string, PrismaQuery>;

export type SubmissionTabKey = keyof typeof SUBMISSION_TAB_CONDITIONS;

export const SUBMISSION_STAGE_TAB_KEY: Record<
	SubmissionStage,
	SubmissionTabKey
> = {
	SUBMITTED: "submitted",
	QUALIFIED: "qualified",
	SHORTLISTED: "qualified",
	INTERVIEW_SCHEDULED: "interviewScheduled",
	INTERVIEW_COMPLETED: "interviewScheduled",
	OFFERED: "offerExtended",
	ACCEPTED: "offerExtended",
	REJECTED: "rejected",
	WITHDRAWN: "rejected",
};
