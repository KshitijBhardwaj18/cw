export const QUESTIONNAIRE_COLUMN_KEYS = {
	questionText: "questionText",
	type: "type",
	required: "required",
	tagging: "tagging",
	submissionReadiness: "includeInSubmission",
	actions: "actions",
} as const;

export const QUESTIONNAIRE_COLUMN_HEADERS = {
	questionText: "Question",
	type: "Type",
	required: "Required",
	tagging: "Tagged",
	submissionReadiness: "Submission Readiness",
	actions: "Actions",
} as const;
