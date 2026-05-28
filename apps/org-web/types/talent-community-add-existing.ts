import type {
	CandidateSource,
	CandidateWorkforceType,
	SubmissionStage,
} from "@repo/shared";

/** Prisma `SubmissionStage` plus inactive when candidate has no active submission. */
export type AddExistingTalentStatusValue = "INACTIVE" | SubmissionStage;

export interface AddExistingTalentCandidateRow {
	id: string;
	name: string;
	email: string;
	/** `Candidate.workforceGroup` — org-defined label */
	workforceGroup: string;
	workforceType: CandidateWorkforceType | null;
	occupation: string;
	specialty: string;
	source: CandidateSource;
	status: AddExistingTalentStatusValue;
}
