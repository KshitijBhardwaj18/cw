import { Action } from "../../../types/actions";
import {
	type Can,
	CRU_ACTIONS,
	CRUD_ACTIONS,
	READ_UPDATE_ACTIONS,
} from "../../helpers";

const LIST = [Action.Read, Action.List] as const;

export function defineVendorUserRules(can: Can) {
	can([...LIST], "Dashboard");
	can(
		[Action.Read, Action.List],
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

	can(CRUD_ACTIONS, "OrganizationVendor");
	can([Action.Read, Action.List], "Member");

	can(READ_UPDATE_ACTIONS, ["PerDiemShift", "Timesheet"]);

	can(CRU_ACTIONS, "Note", {
		type: { not: "BILLING" },
	});
	can(CRUD_ACTIONS, "Document", { type: { not: "FINANCE" } });

	can([Action.Read, Action.List, Action.Update, Action.Delete], "Placement");

	can([Action.Read, Action.List], "Requisition");
	can([Action.Read, Action.List, Action.Create], "Submission");
	can([Action.Create, Action.Delete], "VendorUserSavedRequisition");
	can([Action.Read, Action.List, Action.Create, Action.Update], "Candidate");
	can([Action.Update], "Credentials");
	can([Action.Read, Action.List], "OrganizationOccupation");
	can([Action.Read, Action.List], "CandidateCompliance");
}
