export const MSP_INDUSTRY_OPTIONS = [
	{ value: "HEALTHCARE", label: "Healthcare" },
	{ value: "TECHNOLOGY", label: "Technology" },
	{ value: "FINANCE", label: "Finance" },
	{ value: "MANUFACTURING", label: "Manufacturing" },
	{ value: "RETAIL", label: "Retail" },
	{ value: "OTHER", label: "Other" },
] as const;

export const MSP_ORGANIZATION_TYPE_OPTIONS = [
	{
		value: "ORGANIZATION_STAFFING_OFFICE",
		label: "Organization Staffing Office",
	},
	{ value: "CORPORATE_OFFICE", label: "Corporate Office" },
	{ value: "BRANCH_OFFICE", label: "Branch Office" },
	{ value: "REMOTE_OFFICE", label: "Remote Office" },
] as const;
