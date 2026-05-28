import { SubmissionStage } from "@repo/shared";
import type { SubmissionStageKey } from "@/constants/submissions";

/** Primary action details for moving a submission to the next funnel stage. */
export interface SubmissionPrimaryAdvanceAction {
	label: string;
	next: SubmissionStageKey;
}

const DEFAULT_ADVANCE: Partial<
	Record<SubmissionStageKey, SubmissionPrimaryAdvanceAction>
> = {
	[SubmissionStage.SUBMITTED]: {
		label: "Qualified",
		next: SubmissionStage.QUALIFIED,
	},
	[SubmissionStage.QUALIFIED]: {
		label: "Shortlist",
		next: SubmissionStage.SHORTLISTED,
	},
	[SubmissionStage.SHORTLISTED]: {
		label: "Schedule interview",
		next: SubmissionStage.INTERVIEW_SCHEDULED,
	},
	[SubmissionStage.INTERVIEW_SCHEDULED]: {
		label: "Interview complete",
		next: SubmissionStage.INTERVIEW_COMPLETED,
	},
	[SubmissionStage.INTERVIEW_COMPLETED]: {
		label: "Make offer",
		next: SubmissionStage.OFFERED,
	},
	[SubmissionStage.OFFERED]: {
		label: "Mark accepted",
		next: SubmissionStage.ACCEPTED,
	},
};

/**
 * Returns the primary advancement action for a submission stage,
 * accounting for job-specific configurations like interview requirements.
 */
export function getSubmissionPrimaryAdvance(
	stage: SubmissionStageKey,
	isInterviewRequired: boolean = true,
): SubmissionPrimaryAdvanceAction | undefined {
	if (!isInterviewRequired && stage === SubmissionStage.SHORTLISTED) {
		return {
			label: "Make offer",
			next: SubmissionStage.OFFERED,
		};
	}
	return DEFAULT_ADVANCE[stage];
}
