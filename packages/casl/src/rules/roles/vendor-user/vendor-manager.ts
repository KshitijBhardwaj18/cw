import { UserRole } from "@repo/shared";
import { Action } from "../../../types/actions";
import {
	type Can,
	CRU_ACTIONS,
	CRUD_ACTIONS,
	READ_UPDATE_ACTIONS,
} from "../../helpers";

export function defineVendorManagerRules(can: Can) {
	can(
		[Action.Read, Action.List],
		[
			"Dashboard",
			"Vendor",
			"OrganizationVendor",
			"Billing",
			"Invoice",
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

	can(CRU_ACTIONS, "Note");
	can([Action.Read, Action.List], "Document");
	can([Action.Create, Action.Update, Action.Delete], "Document", {
		type: { not: "FINANCE" },
	});

	can(Action.Manage, "User", { role: UserRole.VENDOR_USER });
	can(Action.Manage, "VendorUser");

	can([Action.Read, Action.List, Action.Update, Action.Delete], "Placement");

	can([Action.Read, Action.List], "Requisition");
	can([Action.Read, Action.List, Action.Create], "Submission");
	can([Action.Create, Action.Delete], "VendorUserSavedRequisition");
	can([Action.Read, Action.List, Action.Create, Action.Update], "Candidate");
	can([Action.Update], "Credentials");
	can([Action.Read, Action.List], "OrganizationOccupation");
	can([Action.Read, Action.List], "CandidateCompliance");
}
