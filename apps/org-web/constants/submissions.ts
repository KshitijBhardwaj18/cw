export type SubmissionStageKey =
	| "SUBMITTED"
	| "QUALIFIED"
	| "SHORTLISTED"
	| "INTERVIEW_SCHEDULED"
	| "INTERVIEW_COMPLETED"
	| "OFFERED"
	| "ACCEPTED"
	| "WITHDRAWN"
	| "REJECTED";

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

export const SUBMISSION_STAGE_TABS: {
	stage: SubmissionStageKey;
	label: string;
	icon:
		| "file"
		| "user"
		| "calendar"
		| "calendarClock"
		| "check"
		| "offer"
		| "gift"
		| "withdraw"
		| "reject";
}[] = [
	{ stage: "SUBMITTED", label: "Submitted", icon: "file" },
	{ stage: "QUALIFIED", label: "Qualified", icon: "user" },
	{ stage: "SHORTLISTED", label: "Shortlisted", icon: "calendar" },
	{
		stage: "INTERVIEW_SCHEDULED",
		label: "Interview Scheduled",
		icon: "calendarClock",
	},
	{
		stage: "INTERVIEW_COMPLETED",
		label: "Interview Completed",
		icon: "check",
	},
	{ stage: "OFFERED", label: "Offer", icon: "offer" },
	{ stage: "ACCEPTED", label: "Accepted", icon: "gift" },
	{ stage: "WITHDRAWN", label: "Withdrawn", icon: "withdraw" },
	{ stage: "REJECTED", label: "Rejected", icon: "reject" },
];

/** Select / dropdown options for hiring stage (value + label). */
export const SUBMISSION_STAGE_SELECT_OPTIONS: {
	value: SubmissionStageKey;
	label: string;
}[] = SUBMISSION_STAGE_TABS.map((t) => ({
	value: t.stage,
	label: t.label,
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
