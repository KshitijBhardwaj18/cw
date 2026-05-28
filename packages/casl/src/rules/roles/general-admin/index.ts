import { UserRole } from "@repo/shared";
import {
	BILLING_CONFIG_SECTION_CONDITIONS,
	BILLING_TAB_CONDITIONS,
} from "../../../constants/billing";
import { Action } from "../../../types/actions";
import type { AppSubjects } from "../../../types/subjects";
import {
	type Can,
	CREATE_READ_LIST_UPDATE_ACTIONS,
	CREATE_READ_LIST_UPDATE_DELETE_ACTIONS,
	CREATE_UPDATE_DELETE_ASSIGN_ACTIONS,
	READ_LIST_ACTIONS,
	READ_LIST_CREATE_ACTIONS,
	READ_LIST_DELETE_ACTIONS,
	READ_LIST_UPDATE_DELETE_ACTIONS,
} from "../../helpers";

const ORG_PORTAL_CRUD_SUBJECTS = [
	"PerDiemShift",
	"Requisition",
	"RequisitionApprovals",
	"Grievance",
	"Candidate",
	"ComplianceListItem",
	"Project",
] as const satisfies readonly AppSubjects[];

const TIMEKEEPING_HIGH_CONTROL_SUBJECTS = [
	"Timesheet",
	"TimesheetDispute",
	"MissingTimeCase",
] as const satisfies readonly AppSubjects[];

const MSP_LINKED_ORG_EDITABLE_FIELDS = [
	"id",
	"mspId",
	"organizationId",
	"startDate",
	"renewalDate",
	"possibleCancellationDate",
	"addendumAgreement",
	"saasFeePercentage",
	"mspFeePercentage",
] as const;

export function defineGeneralAdminRules(can: Can) {
	can(READ_LIST_ACTIONS, ["Dashboard", "Organization", "User", "Metric"]);

	can(CREATE_UPDATE_DELETE_ASSIGN_ACTIONS, "User", {
		role: {
			notIn: [UserRole.SUPER_ADMIN, UserRole.GENERAL_ADMIN],
		},
	});

	can(CREATE_READ_LIST_UPDATE_ACTIONS, ["Vendor", "MSP"]);
	can(CREATE_READ_LIST_UPDATE_ACTIONS, "MSPLinkedOrg", [
		...MSP_LINKED_ORG_EDITABLE_FIELDS,
	]);

	can(READ_LIST_UPDATE_DELETE_ACTIONS, "Note", {
		type: { not: "BILLING" },
	});
	can(READ_LIST_DELETE_ACTIONS, "Document", {
		type: { not: "FINANCE" },
	});

	can(CREATE_READ_LIST_UPDATE_ACTIONS, [
		"ComplianceWalletTemplate",
		"Questionnaire",
	]);
	can(Action.Manage, "Question");

	can(CREATE_READ_LIST_UPDATE_DELETE_ACTIONS, [...ORG_PORTAL_CRUD_SUBJECTS]);
	can(CREATE_READ_LIST_UPDATE_DELETE_ACTIONS, "CommandCenter");
	can(CREATE_READ_LIST_UPDATE_DELETE_ACTIONS, "Placement");
	can(CREATE_READ_LIST_UPDATE_DELETE_ACTIONS, "PlacementComplianceItem");
	can(CREATE_READ_LIST_UPDATE_DELETE_ACTIONS, "Submission");
	can(CREATE_READ_LIST_UPDATE_DELETE_ACTIONS, [
		"TalentCommunity",
		"WorkforceLists",
		"ShiftRoutingSettings",
	]);
	can(CREATE_READ_LIST_UPDATE_DELETE_ACTIONS, "Credentials");
	can(CREATE_READ_LIST_UPDATE_DELETE_ACTIONS, [
		"Timekeeping",
		...TIMEKEEPING_HIGH_CONTROL_SUBJECTS,
		"TimekeepingSummary",
		"OrganizationHoliday",
	]);
	can(READ_LIST_CREATE_ACTIONS, "OrganizationPayCode");
	can(CREATE_READ_LIST_UPDATE_DELETE_ACTIONS, ["SpendAnalytics"]);
	can(CREATE_READ_LIST_UPDATE_ACTIONS, "Invoice");
	can(CREATE_READ_LIST_UPDATE_ACTIONS, "BillingConfig");
	can(CREATE_READ_LIST_UPDATE_ACTIONS, "OrganizationWorkforceBillingRate");
	can(
		CREATE_READ_LIST_UPDATE_ACTIONS,
		"Billing",
		BILLING_TAB_CONDITIONS["billing-configuration"],
	);
	can(
		CREATE_READ_LIST_UPDATE_ACTIONS,
		"Billing",
		BILLING_TAB_CONDITIONS["invoice-history"],
	);
	can(CREATE_READ_LIST_UPDATE_ACTIONS, "Billing", BILLING_TAB_CONDITIONS.rates);
	can(
		CREATE_READ_LIST_UPDATE_ACTIONS,
		"BillingConfig",
		BILLING_CONFIG_SECTION_CONDITIONS.general,
	);
	can(
		CREATE_READ_LIST_UPDATE_ACTIONS,
		"BillingConfig",
		BILLING_CONFIG_SECTION_CONDITIONS["invoice-preferences"],
	);
	can(
		CREATE_READ_LIST_UPDATE_ACTIONS,
		"BillingConfig",
		BILLING_CONFIG_SECTION_CONDITIONS.timekeeping,
	);
	can(
		CREATE_READ_LIST_UPDATE_ACTIONS,
		"BillingConfig",
		BILLING_CONFIG_SECTION_CONDITIONS["fee-structure"],
	);
	can(
		CREATE_READ_LIST_UPDATE_ACTIONS,
		"BillingConfig",
		BILLING_CONFIG_SECTION_CONDITIONS["financial-tables"],
	);
	can(CREATE_READ_LIST_UPDATE_DELETE_ACTIONS, [
		"ComplianceChecklist",
		"RequisitionTemplate",
		"ShiftTemplate",
	]);
	can(CREATE_READ_LIST_UPDATE_ACTIONS, "RequisitionAttentionRule");
	can(CREATE_READ_LIST_UPDATE_ACTIONS, "AgingRule");
}
