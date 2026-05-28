import { UserRole } from "@repo/shared";
import { Action } from "../../../types/actions";
import {
	type Can,
	CREATE_DELETE_ACTIONS,
	CREATE_READ_LIST_UPDATE_ACTIONS,
	CREATE_READ_LIST_UPDATE_DELETE_ACTIONS,
	READ_ACTIONS,
	READ_LIST_ACTIONS,
	READ_LIST_CREATE_ACTIONS,
	READ_LIST_UPDATE_ACTIONS,
	READ_LIST_UPDATE_CREATE_ACTIONS,
	READ_LIST_UPDATE_DELETE_ACTIONS,
	UPDATE_ACTIONS,
} from "../../helpers";

export function defineVendorUserRules(can: Can) {
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

	can(CREATE_READ_LIST_UPDATE_DELETE_ACTIONS, "OrganizationVendor");
	can(READ_LIST_ACTIONS, "Member");

	can(READ_LIST_UPDATE_ACTIONS, ["PerDiemShift", "Timesheet"]);

	can(CREATE_READ_LIST_UPDATE_ACTIONS, "Note", {
		type: { not: "BILLING" },
	});
	can(CREATE_READ_LIST_UPDATE_DELETE_ACTIONS, "Document", {
		type: { not: "FINANCE" },
	});

	can(READ_LIST_UPDATE_DELETE_ACTIONS, "Placement");
	can(READ_ACTIONS, "User", { role: UserRole.VENDOR_USER });
	can(CREATE_READ_LIST_UPDATE_ACTIONS, "CandidateCompliance");
	can(Action.Manage, "CandidateSubmission");

	can(READ_LIST_ACTIONS, "Requisition");
	can(READ_LIST_CREATE_ACTIONS, "Submission");
	can(CREATE_DELETE_ACTIONS, "VendorUserSavedRequisition");
	can(READ_LIST_UPDATE_CREATE_ACTIONS, "Candidate");
	can(UPDATE_ACTIONS, "Credentials");
	can(READ_LIST_ACTIONS, "OrganizationOccupation");
	can(READ_LIST_ACTIONS, "OrganizationLocation");
	can(READ_LIST_ACTIONS, "Department");
}
