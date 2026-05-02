import type { JobPostingPublishValues } from "@/schemas/job-posting-publish.schema";
import type { JobPostingSubmissionValues } from "@/schemas/job-posting-submission.schema";
import type { JobPostingFlowValues } from "@/types/job-posting-flow";

/** Shown when a wizard step fails full-form (Zod) validation on submit. */
export const JOB_POSTING_STEP_VALIDATION_TOAST =
	"Please check the form and fix any errors before continuing.";

export const JOB_POSTING_STEPS = [
	"Requisition Type",
	"Select Template",
	"Job Details",
	"Submission Settings",
	"Publish Settings",
	"Review & Confirm",
] as const;

export interface SubmissionRadioOption<TValue extends string> {
	id: string;
	value: TValue;
	label: string;
	description: string;
}

export const JOB_POSTING_SUBMISSION_TYPE_OPTIONS: Array<
	SubmissionRadioOption<JobPostingSubmissionValues["submissionType"]>
> = [
	{
		id: "submission-vc",
		value: "VENDOR_AND_CANDIDATE",
		label: "Vendor & Candidate",
		description:
			"Both vendors and candidates can submit applications for this job.",
	},
	{
		id: "submission-v",
		value: "VENDOR_ONLY",
		label: "Vendor Only",
		description: "Only vendors can submit candidates for this job.",
	},
	{
		id: "submission-c",
		value: "CANDIDATE_ONLY",
		label: "Candidate Only",
		description: "Only candidates can apply directly for this job.",
	},
];

export const JOB_POSTING_VENDOR_ACCESS_OPTIONS: Array<
	SubmissionRadioOption<JobPostingSubmissionValues["vendorAccess"]>
> = [
	{
		id: "vendor-all",
		value: "ALL_VENDORS",
		label: "All Vendors",
		description:
			"All active vendors in this organization can submit candidates.",
	},
	{
		id: "vendor-selected",
		value: "SELECTED_VENDORS",
		label: "Selected Vendors",
		description: "Choose specific vendors who can submit.",
	},
];

export const JOB_POSTING_PUBLISH_MODE_OPTIONS: Array<
	SubmissionRadioOption<JobPostingPublishValues["publishMode"]>
> = [
	{
		id: "publish-draft",
		value: "SAVE_AS_DRAFT",
		label: "Save as Draft",
		description:
			"Save this posting without publishing so you can review and update later.",
	},
	{
		id: "publish-now",
		value: "PUBLISH_IMMEDIATELY",
		label: "Publish Immediately",
		description:
			"Publish this posting right away and make it available to eligible users.",
	},
	{
		id: "publish-schedule",
		value: "SCHEDULE_PUBLISH_DATE",
		label: "Schedule Publish Date",
		description:
			"Choose a publish date and time to release this posting automatically.",
	},
];

export const DEFAULT_JOB_POSTING_VALUES: JobPostingFlowValues = {
	typeSelection: {
		type: "LONG_TERM_ORDER",
	},
	templateSelection: {
		templateId: "",
	},
	jobDetails: {
		requisitionName: "",
		location: "",
		department: "",
		unitName: "",
		occupation: "",
		specialty: "",
		shiftType: "NIGHTS",
		startDate: "",
		endDate: "",
		lengthWeeks: 1,
		startTime: "",
		endTime: "",
		shiftHours: 8,
		shiftsPerWeek: 1,
		hoursPerWeek: 0,
		billRate: 0,
		numberOfPositions: 1,
		incentiveType: "",
		incentiveAmount: undefined,
		interviewRequired: undefined,
		hiringManagerId: "",
		description: "",
		benefitsPerks: [],
		complianceTemplateId: "",
	},
	submissionSettings: {
		submissionType: "VENDOR_AND_CANDIDATE",
		vendorAccess: "ALL_VENDORS",
		notesForVendors: "",
		acceptanceCriteriaIds: [],
		selectedVendorIds: [],
	},
	publishSettings: {
		publishMode: "SAVE_AS_DRAFT",
		scheduledPublishDate: "",
		scheduledPublishTime: "",
	},
};
