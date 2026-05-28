import { COMMAND_CENTER_TAB_CONDITIONS } from "../../../constants/command-center";
import { SUBMISSION_TAB_CONDITIONS } from "../../../constants/submissions";
import { TALENT_COMMUNITY_TAB_CONDITIONS } from "../../../constants/talent-community";
import type { AppSubjects } from "../../../types/subjects";
import { type Can, READ_LIST_ACTIONS } from "../../helpers";

const ORG_OPERATIONS_READ_SUBJECTS = [
	"PerDiemShift",
	"Requisition",
	"Grievance",
	"Candidate",
] as const satisfies readonly AppSubjects[];

const ORG_PORTAL_FILTER_LIST_SUBJECTS = [
	"OrganizationLocation",
	"OrganizationOccupation",
	"OrganizationSpecialty",
	"OrganizationVendor",
	"Department",
	"Member",
] as const;

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

export function defineOrganizationUserOperationsRules(can: Can) {
	can(
		READ_LIST_ACTIONS,
		"CommandCenter",
		COMMAND_CENTER_TAB_CONDITIONS.metrics,
	);
	can(READ_LIST_ACTIONS, "CommandCenter", COMMAND_CENTER_TAB_CONDITIONS.shifts);
	can(
		READ_LIST_ACTIONS,
		"CommandCenter",
		COMMAND_CENTER_TAB_CONDITIONS.performance,
	);
	can(
		READ_LIST_ACTIONS,
		"CommandCenter",
		COMMAND_CENTER_TAB_CONDITIONS["hiring-funnel"],
	);
	can(
		READ_LIST_ACTIONS,
		"CommandCenter",
		COMMAND_CENTER_TAB_CONDITIONS["active-workforce"],
	);

	can(READ_LIST_ACTIONS, "Placement");

	can(READ_LIST_ACTIONS, "Submission", SUBMISSION_TAB_CONDITIONS.qualified);
	can(
		READ_LIST_ACTIONS,
		"Submission",
		SUBMISSION_TAB_CONDITIONS.interviewScheduled,
	);
	can(READ_LIST_ACTIONS, "Submission", SUBMISSION_TAB_CONDITIONS.offerExtended);
	can(READ_LIST_ACTIONS, "Submission", SUBMISSION_TAB_CONDITIONS.rejected);

	can(
		READ_LIST_ACTIONS,
		"TalentCommunity",
		TALENT_COMMUNITY_TAB_CONDITIONS.all,
	);
	can(
		READ_LIST_ACTIONS,
		"TalentCommunity",
		TALENT_COMMUNITY_TAB_CONDITIONS.invited,
	);

	can(READ_LIST_ACTIONS, [...TIMEKEEPING_ALL_SUBJECTS]);
	can(READ_LIST_ACTIONS, ["SpendAnalytics", "Invoice"]);
	can(READ_LIST_ACTIONS, [
		"ComplianceChecklist",
		"ComplianceListItem",
		"RequisitionTemplate",
		"ShiftTemplate",
		"Billing",
		"BillingConfig",
		"User",
	]);
	can(READ_LIST_ACTIONS, ["Specialty"]);

	can(READ_LIST_ACTIONS, [...ORG_OPERATIONS_READ_SUBJECTS]);
	can(READ_LIST_ACTIONS, [...ORG_PORTAL_FILTER_LIST_SUBJECTS]);
}
