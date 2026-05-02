import { COMMAND_CENTER_TAB_CONDITIONS } from "../../../constants/command-center";
import { SUBMISSION_TAB_CONDITIONS } from "../../../constants/submissions";
import { TALENT_COMMUNITY_TAB_CONDITIONS } from "../../../constants/talent-community";
import { Action } from "../../../types/actions";
import type { AppSubjects } from "../../../types/subjects";
import type { Can } from "../../helpers";

const LIST = [Action.Read, Action.List] as const;

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
	can([...LIST], "CommandCenter", COMMAND_CENTER_TAB_CONDITIONS.metrics);
	can([...LIST], "CommandCenter", COMMAND_CENTER_TAB_CONDITIONS.shifts);
	can([...LIST], "CommandCenter", COMMAND_CENTER_TAB_CONDITIONS.performance);
	can(
		[...LIST],
		"CommandCenter",
		COMMAND_CENTER_TAB_CONDITIONS["hiring-funnel"],
	);
	can(
		[...LIST],
		"CommandCenter",
		COMMAND_CENTER_TAB_CONDITIONS["active-workforce"],
	);

	can([...LIST], "Placement");

	can([...LIST], "Submission", SUBMISSION_TAB_CONDITIONS.qualified);
	can([...LIST], "Submission", SUBMISSION_TAB_CONDITIONS.interviewScheduled);
	can([...LIST], "Submission", SUBMISSION_TAB_CONDITIONS.offerExtended);
	can([...LIST], "Submission", SUBMISSION_TAB_CONDITIONS.rejected);

	can([...LIST], "TalentCommunity", TALENT_COMMUNITY_TAB_CONDITIONS.all);
	can([...LIST], "TalentCommunity", TALENT_COMMUNITY_TAB_CONDITIONS.invited);

	can([...LIST], [...TIMEKEEPING_ALL_SUBJECTS]);
	can([...LIST], ["SpendAnalytics", "Invoice"]);
	can(
		[...LIST],
		[
			"ComplianceChecklist",
			"ComplianceListItem",
			"RequisitionTemplate",
			"ShiftTemplate",
			"Billing",
			"BillingConfig",
			"User",
		],
	);
	can([...LIST], ["Specialty"]);

	can([...LIST], [...ORG_OPERATIONS_READ_SUBJECTS]);
	can([...LIST], [...ORG_PORTAL_FILTER_LIST_SUBJECTS]);
}
