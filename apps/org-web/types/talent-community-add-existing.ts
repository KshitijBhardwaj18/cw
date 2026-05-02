import type { CandidateWorkforceType } from "@repo/shared";

/** Prisma `CandidateSource` */
export type CandidateSourceValue = "DIRECT" | "VENDOR" | "PREVIOUS_WORKER";

/** Prisma `SubmissionStage` plus inactive when candidate is not active */
export type AddExistingTalentStatusValue =
	| "INACTIVE"
	| "SUBMITTED"
	| "QUALIFIED"
	| "SHORTLISTED"
	| "INTERVIEW_SCHEDULED"
	| "INTERVIEW_COMPLETED"
	| "OFFERED"
	| "ACCEPTED"
	| "WITHDRAWN"
	| "REJECTED";

export interface AddExistingTalentCandidateRow {
	id: string;
	name: string;
	email: string;
	/** `Candidate.workforceGroup` — org-defined label */
	workforceGroup: string;
	workforceType: CandidateWorkforceType | null;
	occupation: string;
	specialty: string;
	source: CandidateSourceValue;
	status: AddExistingTalentStatusValue;
}
