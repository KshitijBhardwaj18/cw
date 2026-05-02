import { Action } from "../../../types/actions";
import type { Can } from "../../helpers";

const LIST = [Action.Read, Action.List] as const;

/** Read-only operational portal: align with Vendor Portal AC (no mutations, no financials). */
export function defineVendorViewOnlyRules(can: Can) {
	can([...LIST], "Dashboard");
	can(
		[...LIST],
		[
			"Vendor",
			"OrganizationVendor",
			"Billing",
			"Occupation",
			"Specialty",
			"ComplianceWalletTemplate",
			"Questionnaire",
			"Question",
		],
	);
	can([...LIST], "Requisition");
	can([...LIST], "Member");
	can([...LIST], ["PerDiemShift", "Timesheet"]);
	can([...LIST], "Document", { type: { not: "FINANCE" } });
	can([...LIST], "Placement");
	can([...LIST], "Submission");
	can([...LIST], "Candidate");
	can([...LIST], "OrganizationOccupation");
	can([...LIST], "CandidateCompliance");
	can([...LIST], "Note", { type: { not: "BILLING" } });
}
