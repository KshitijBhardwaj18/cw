import { type Can, READ_LIST_ACTIONS } from "../../helpers";

/** Read-only operational portal: align with Vendor Portal AC (no mutations, no financials). */
export function defineVendorViewOnlyRules(can: Can) {
	can(READ_LIST_ACTIONS, "Dashboard");
	can(READ_LIST_ACTIONS, [
		"Vendor",
		"OrganizationVendor",
		"Billing",
		"Occupation",
		"Specialty",
		"ComplianceWalletTemplate",
		"Questionnaire",
		"Question",
	]);
	can(READ_LIST_ACTIONS, "Requisition");
	can(READ_LIST_ACTIONS, "Member");
	can(READ_LIST_ACTIONS, ["PerDiemShift", "Timesheet"]);
	can(READ_LIST_ACTIONS, "Document", { type: { not: "FINANCE" } });
	can(READ_LIST_ACTIONS, "Placement");
	can(READ_LIST_ACTIONS, "Submission");
	can(READ_LIST_ACTIONS, "Candidate");
	can(READ_LIST_ACTIONS, "OrganizationOccupation");
	can(READ_LIST_ACTIONS, "OrganizationLocation");
	can(READ_LIST_ACTIONS, "CandidateCompliance");
	can(READ_LIST_ACTIONS, "Note", { type: { not: "BILLING" } });
}
