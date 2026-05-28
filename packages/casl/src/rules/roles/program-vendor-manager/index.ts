import {
	BILLING_CONFIG_SECTION_CONDITIONS,
	BILLING_TAB_CONDITIONS,
} from "../../../constants/billing";
import { SUBMISSION_TAB_CONDITIONS } from "../../../constants/submissions";
import type { AppSubjects } from "../../../types/subjects";
import {
	type Can,
	type Cannot,
	CREATE_READ_LIST_UPDATE_ACTIONS,
	READ_LIST_ACTIONS,
	READ_LIST_CREATE_ACTIONS,
	READ_LIST_UPDATE_ACTIONS,
} from "../../helpers";

const PORTAL_MANAGER_CRU_SUBJECTS = [
	"PerDiemShift",
	"Requisition",
	"Grievance",
	"Candidate",
	"ComplianceListItem",
] as const satisfies readonly AppSubjects[];

const TIMEKEEPING_HIGH_CONTROL_SUBJECTS = [
	"Timesheet",
	"TimesheetDispute",
	"MissingTimeCase",
] as const satisfies readonly AppSubjects[];

const TIMEKEEPING_READ_ONLY_GROUP_SUBJECTS = [
	"TimekeepingSummary",
	"OrganizationPayCode",
	"OrganizationHoliday",
] as const satisfies readonly AppSubjects[];

export function defineProgramVendorManagerRules(can: Can, cannot: Cannot) {
	can(READ_LIST_ACTIONS, "ComplianceWalletTemplate");

	can(READ_LIST_UPDATE_ACTIONS, "CommandCenter");

	can(READ_LIST_UPDATE_ACTIONS, "Placement");
	can(CREATE_READ_LIST_UPDATE_ACTIONS, "PlacementComplianceItem");

	can(CREATE_READ_LIST_UPDATE_ACTIONS, "Credentials");

	can(READ_LIST_CREATE_ACTIONS, "ComplianceChecklist");
	can(CREATE_READ_LIST_UPDATE_ACTIONS, [
		"RequisitionTemplate",
		"ShiftTemplate",
	]);
	can(
		READ_LIST_ACTIONS,
		"Billing",
		BILLING_TAB_CONDITIONS["billing-configuration"],
	);
	can(READ_LIST_ACTIONS, "BillingConfig");
	cannot(
		READ_LIST_ACTIONS,
		"BillingConfig",
		BILLING_CONFIG_SECTION_CONDITIONS.general,
	);
	cannot(
		READ_LIST_ACTIONS,
		"BillingConfig",
		BILLING_CONFIG_SECTION_CONDITIONS["invoice-preferences"],
	);
	cannot(
		READ_LIST_ACTIONS,
		"BillingConfig",
		BILLING_CONFIG_SECTION_CONDITIONS["fee-structure"],
	);
	can(READ_LIST_ACTIONS, ["OrganizationPayCode", "OrganizationHoliday"]);
	can(CREATE_READ_LIST_UPDATE_ACTIONS, "User");

	can(CREATE_READ_LIST_UPDATE_ACTIONS, [...PORTAL_MANAGER_CRU_SUBJECTS]);
	can(READ_LIST_UPDATE_ACTIONS, "RequisitionApprovals");
	can(READ_LIST_ACTIONS, ["Organization"]);

	can(
		READ_LIST_UPDATE_ACTIONS,
		"Submission",
		SUBMISSION_TAB_CONDITIONS.submitted,
	);
	can(READ_LIST_ACTIONS, "Submission", SUBMISSION_TAB_CONDITIONS.qualified);
	can(
		READ_LIST_ACTIONS,
		"Submission",
		SUBMISSION_TAB_CONDITIONS.interviewScheduled,
	);
	can(READ_LIST_ACTIONS, "Submission", SUBMISSION_TAB_CONDITIONS.offerExtended);
	can(READ_LIST_ACTIONS, "Submission", SUBMISSION_TAB_CONDITIONS.rejected);

	can(CREATE_READ_LIST_UPDATE_ACTIONS, [
		"TalentCommunity",
		"WorkforceLists",
		"ShiftRoutingSettings",
	]);

	can(CREATE_READ_LIST_UPDATE_ACTIONS, [
		"Timekeeping",
		...TIMEKEEPING_HIGH_CONTROL_SUBJECTS,
	]);
	can(READ_LIST_ACTIONS, [...TIMEKEEPING_READ_ONLY_GROUP_SUBJECTS]);

	can(READ_LIST_ACTIONS, ["SpendAnalytics", "Invoice"]);

	can(READ_LIST_ACTIONS, "Department");
	can(CREATE_READ_LIST_UPDATE_ACTIONS, "Member");
}
