import { UserRole } from "@repo/shared";
import { Action } from "../../../types/actions";
import type { AppSubjects } from "../../../types/subjects";
import { type Can, CRU_ACTIONS, CRUD_ACTIONS } from "../../helpers";

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

const TIMEKEEPING_READ_ONLY_GROUP_SUBJECTS = [
	"TimekeepingSummary",
	"OrganizationPayCode",
	"OrganizationHoliday",
] as const satisfies readonly AppSubjects[];

const TIMEKEEPING_ALL_SUBJECTS = [
	"Timekeeping",
	...TIMEKEEPING_HIGH_CONTROL_SUBJECTS,
	...TIMEKEEPING_READ_ONLY_GROUP_SUBJECTS,
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
	can(
		[Action.Read, Action.List],
		["Dashboard", "Organization", "User", "Metric"],
	);

	can([Action.Create, Action.Update, Action.Delete, Action.Assign], "User", {
		role: {
			notIn: [UserRole.SUPER_ADMIN, UserRole.GENERAL_ADMIN],
		},
	});

	can(CRU_ACTIONS, ["Vendor", "MSP"]);
	can(CRU_ACTIONS, "MSPLinkedOrg", [...MSP_LINKED_ORG_EDITABLE_FIELDS]);

	can([Action.Read, Action.List, Action.Update, Action.Delete], "Note", {
		type: { not: "BILLING" },
	});
	can([Action.Read, Action.List, Action.Delete], "Document", {
		type: { not: "FINANCE" },
	});

	can(CRU_ACTIONS, ["ComplianceWalletTemplate", "Questionnaire"]);
	can(Action.Manage, "Question");

	can(CRUD_ACTIONS, [...ORG_PORTAL_CRUD_SUBJECTS]);
	can(CRUD_ACTIONS, "CommandCenter");
	can(
		[Action.Create, Action.Read, Action.List, Action.Update, Action.Delete],
		"Placement",
	);
	can(
		[Action.Create, Action.Read, Action.List, Action.Update, Action.Delete],
		"PlacementComplianceItem",
	);
	can(
		[Action.Create, Action.Read, Action.List, Action.Update, Action.Delete],
		"Submission",
	);
	can(CRUD_ACTIONS, [
		"TalentCommunity",
		"WorkforceLists",
		"ShiftRoutingSettings",
	]);
	can(CRUD_ACTIONS, "Credentials");
	can(CRUD_ACTIONS, [...TIMEKEEPING_ALL_SUBJECTS]);
	can(CRUD_ACTIONS, ["SpendAnalytics", "Invoice"]);
	can(CRUD_ACTIONS, [
		"ComplianceChecklist",
		"RequisitionTemplate",
		"ShiftTemplate",
		"Billing",
	]);
}
