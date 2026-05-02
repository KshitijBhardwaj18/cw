import type { JobPostingDetailsValues } from "@/schemas/job-posting-details.schema";
import type { JobPostingPublishValues } from "@/schemas/job-posting-publish.schema";
import type { JobPostingSubmissionValues } from "@/schemas/job-posting-submission.schema";
import type { JobPostingTemplateSelectionValues } from "@/schemas/job-posting-template-selection.schema";
import type { JobPostingTypeSelectionValues } from "@/schemas/job-posting-type-selection.schema";

export type JobPostingFlowMode = "create" | "edit";

export interface JobPostingFlowValues {
	typeSelection: JobPostingTypeSelectionValues;
	templateSelection: JobPostingTemplateSelectionValues;
	jobDetails: JobPostingDetailsValues;
	submissionSettings: JobPostingSubmissionValues;
	publishSettings: JobPostingPublishValues;
}

export interface JobPostingTemplateListItem {
	id: string;
	title: string;
	type: JobPostingTypeSelectionValues["type"];
	occupation: string;
	specialty: string;
	location: string;
	departmentLabel: string;
	shiftSummary: string;
	billRateLabel: string;
	complianceTemplateName: string;
	lastUsedLabel: string;
	usedCount: number;
}
