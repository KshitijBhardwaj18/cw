/** Workflow type options for requisition template submission rules step */
export const REQUISITION_TEMPLATE_WORKFLOW_TYPE_OPTIONS = [
	{
		value: "VENDOR_CANDIDATE",
		label: "Vendor & Candidate",
		description:
			"Both vendors and candidates can submit applications for this job.",
	},
	{
		value: "VENDOR_ONLY",
		label: "Vendor Only",
		description: "Only vendors can submit candidates for this job.",
	},
	{
		value: "CANDIDATE_ONLY",
		label: "Candidate Only",
		description: "Only candidates can apply directly for this job.",
	},
] as const;

/** Approver role options when approval is required */
export const REQUISITION_TEMPLATE_APPROVER_ROLE_OPTIONS = [
	{ value: "EXECUTIVE", label: "Executive" },
	{ value: "HIRING_MANAGER", label: "Hiring Manager" },
	{ value: "OPERATIONS", label: "Operations" },
	{ value: "OPERATIONS_MANAGER", label: "Operations Manager" },
	{ value: "PROGRAM_MANAGER", label: "Program Manager" },
	{ value: "TECHNICAL_MANAGER", label: "Technical Manager" },
	{ value: "COMPLIANCE_MANAGER", label: "Compliance Manager" },
] as const;
