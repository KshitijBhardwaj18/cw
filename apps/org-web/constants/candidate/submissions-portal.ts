export const CANDIDATE_LIST_PORTAL_COPY = {
	emptyList: "No applications found.",
	listLoadError: "Could not load applications.",
	withdrawTitle: "Withdraw Application",
	withdrawDescription:
		"Are you sure you want to withdraw your application for this position?",
	acceptTitle: "Accept Offer",
	acceptDescription:
		"Are you sure you want to accept the offer for this position?",
} as const;

export const CANDIDATE_PORTAL_LABELS = {
	pageBack: "Back to Applications",
	timelineHeading: "Application Timeline",
	candidateInformation: "Candidate Information",
	candidateNameLabel: "Name",
	candidateOccupationLabel: "Occupation",
	candidateSpecialtyLabel: "Specialty",
	questionnaire: "Questionnaire Answers",
	summaryNote: "Summary Note",
	compliance: "Compliance Status",
	timeOff: "Requested Time Off",
	timeOffEmpty: "None requested.",
	uploadDocumentsCta: "Upload Document",
	withdrawApplication: "Withdraw Application",
	withdrawConfirmDescription:
		"Are you sure you want to withdraw your application for this position?",
	acceptOffer: "Accept Offer",
	documentWalletHref: "/document-wallet",
	summarySubmitted: "Submitted",
	summaryLastUpdate: "Last Update",
	summaryPayRate: "Pay Rate",
	detailAppliedPrefix: "Applied",
} as const;

export type CandidatePortalLabels = typeof CANDIDATE_PORTAL_LABELS;
export type CandidateListPortalCopy = typeof CANDIDATE_LIST_PORTAL_COPY;

export const CANDIDATE_SUBMISSION_TOAST = {
	withdrawSuccess: "Application withdrawn.",
	withdrawError: "Could not withdraw.",
	acceptSuccess: "Offer accepted.",
	acceptError: "Could not accept offer.",
} as const;

export const CANDIDATE_SUBMISSION_DETAIL_FALLBACK = {
	invalidLink: "Invalid application link.",
	loadError: "Could not load this application.",
	back: "Back",
} as const;
