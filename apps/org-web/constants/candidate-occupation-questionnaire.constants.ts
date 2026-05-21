export const OCCUPATION_QUESTIONNAIRE_EHR_OPTIONS = [
	{ value: "epic", label: "Epic" },
	{ value: "cerner", label: "Cerner / Oracle Health" },
	{ value: "meditech", label: "Meditech" },
	{ value: "athena", label: "Athenahealth" },
	{ value: "echart", label: "eClinicalWorks" },
	{ value: "allscripts", label: "Allscripts" },
	{ value: "nextgen", label: "NextGen" },
	{ value: "other_ehr", label: "Other" },
] as const;

export const OCCUPATION_QUESTIONNAIRE_CERTIFICATION_OPTIONS = [
	{ value: "bls", label: "BLS" },
	{ value: "acls", label: "ACLS" },
	{ value: "tncc", label: "TNCC" },
	{ value: "ccrn", label: "CCRN" },
	{ value: "cen", label: "CEN" },
	{ value: "pals", label: "PALS" },
	{ value: "nrp", label: "NRP" },
	{ value: "other_cert", label: "Other certification" },
] as const;
