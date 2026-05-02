import type { SubmissionStageKey } from "@/constants/submissions";

/** Primary action to move a submission to the next funnel stage (job details table). */
export const JOB_SUBMISSION_PRIMARY_ADVANCE: Partial<
	Record<SubmissionStageKey, { label: string; next: SubmissionStageKey }>
> = {
	SUBMITTED: { label: "Qualified", next: "QUALIFIED" },
	QUALIFIED: { label: "Shortlist", next: "SHORTLISTED" },
	SHORTLISTED: { label: "Schedule interview", next: "INTERVIEW_SCHEDULED" },
	INTERVIEW_SCHEDULED: {
		label: "Interview complete",
		next: "INTERVIEW_COMPLETED",
	},
	INTERVIEW_COMPLETED: { label: "Make offer", next: "OFFERED" },
	OFFERED: { label: "Mark accepted", next: "ACCEPTED" },
};
