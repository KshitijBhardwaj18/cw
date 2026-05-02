import type { PrismaQuery } from "@casl/prisma";
import type { SubmissionStage } from "@repo/db";

export const SUBMISSION_SUBMITTED_STAGES: SubmissionStage[] = ["SUBMITTED"];

export const SUBMISSION_QUALIFIED_STAGES: SubmissionStage[] = [
	"QUALIFIED",
	"SHORTLISTED",
];

export const SUBMISSION_INTERVIEW_STAGES: SubmissionStage[] = [
	"INTERVIEW_SCHEDULED",
	"INTERVIEW_COMPLETED",
];

export const SUBMISSION_OFFER_STAGES: SubmissionStage[] = [
	"OFFERED",
	"ACCEPTED",
];

export const SUBMISSION_REJECTED_STAGES: SubmissionStage[] = [
	"REJECTED",
	"WITHDRAWN",
];

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
