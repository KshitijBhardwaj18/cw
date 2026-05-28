import { UserRole } from "@repo/shared";
import { Action } from "../../../types/actions";
import {
	type Can,
	CREATE_DELETE_ACTIONS,
	CREATE_READ_LIST_UPDATE_ACTIONS,
	CREATE_READ_LIST_UPDATE_DELETE_ACTIONS,
	CREATE_UPDATE_DELETE_ACTIONS,
	READ_LIST_ACTIONS,
	READ_LIST_CREATE_ACTIONS,
	READ_LIST_UPDATE_ACTIONS,
	READ_LIST_UPDATE_CREATE_ACTIONS,
	READ_LIST_UPDATE_DELETE_ACTIONS,
	UPDATE_ACTIONS,
} from "../../helpers";

export function defineVendorManagerRules(can: Can) {
	can(READ_LIST_ACTIONS, [
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
	]);

	can(CREATE_READ_LIST_UPDATE_DELETE_ACTIONS, "OrganizationVendor");
	can(READ_LIST_ACTIONS, "Member");

	can(READ_LIST_UPDATE_ACTIONS, "PerDiemShift");
	can(READ_LIST_UPDATE_CREATE_ACTIONS, "Timesheet");

	can(CREATE_READ_LIST_UPDATE_ACTIONS, "Note");
	can(READ_LIST_ACTIONS, "Document");
	can(CREATE_UPDATE_DELETE_ACTIONS, "Document", {
		type: { not: "FINANCE" },
	});

	can(Action.Manage, "User", { role: UserRole.VENDOR_USER });
	can(Action.Manage, "VendorUser");

	can(READ_LIST_UPDATE_DELETE_ACTIONS, "Placement");

	can(READ_LIST_ACTIONS, "Requisition");
	can(READ_LIST_CREATE_ACTIONS, "Submission");
	can(CREATE_DELETE_ACTIONS, "VendorUserSavedRequisition");
	can(READ_LIST_UPDATE_CREATE_ACTIONS, "Candidate");
	can(UPDATE_ACTIONS, "Credentials");
	can(READ_LIST_ACTIONS, "OrganizationOccupation");
	can(READ_LIST_ACTIONS, "OrganizationLocation");
	can(READ_LIST_ACTIONS, "Department");
	can(CREATE_READ_LIST_UPDATE_ACTIONS, "CandidateCompliance");
	can(Action.Manage, "CandidateSubmission");
}
