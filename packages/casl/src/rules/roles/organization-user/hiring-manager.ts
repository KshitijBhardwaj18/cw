import { COMMAND_CENTER_TAB_CONDITIONS } from "../../../constants/command-center";
import { SUBMISSION_TAB_CONDITIONS } from "../../../constants/submissions";
import { TALENT_COMMUNITY_TAB_CONDITIONS } from "../../../constants/talent-community";
import { Action } from "../../../types/actions";
import type { AppSubjects } from "../../../types/subjects";
import { type Can, CRU_ACTIONS, READ_UPDATE_ACTIONS } from "../../helpers";

const LIST = [Action.Read, Action.List] as const;
const RU = [Action.Read, Action.List, Action.Update] as const;

const ORG_LEADERSHIP_CRU_SUBJECTS = [
	"Requisition",
] as const satisfies readonly AppSubjects[];
const ORG_LEADERSHIP_READ_UPDATE_SUBJECTS = [
	"RequisitionApprovals",
] as const satisfies readonly AppSubjects[];
const ORG_LEADERSHIP_READ_SUBJECTS = [
	"PerDiemShift",
	"Grievance",
	"Candidate",
	"ComplianceListItem",
] as const satisfies readonly AppSubjects[];
const ORG_PORTAL_FILTER_LIST_SUBJECTS = [
	"OrganizationLocation",
	"OrganizationOccupation",
	"OrganizationSpecialty",
	"OrganizationVendor",
	"Department",
	"Member",
] as const;

export function defineOrganizationUserHiringManagerRules(can: Can) {
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
	can([...LIST], "PlacementComplianceItem");

	can([...RU], "Submission", SUBMISSION_TAB_CONDITIONS.qualified);
	can([...RU], "Submission", SUBMISSION_TAB_CONDITIONS.interviewScheduled);
	can([...RU], "Submission", SUBMISSION_TAB_CONDITIONS.offerExtended);
	can([...LIST], "Submission", SUBMISSION_TAB_CONDITIONS.rejected);

	can([...LIST], "TalentCommunity", TALENT_COMMUNITY_TAB_CONDITIONS.all);
	can([...LIST], "TalentCommunity", TALENT_COMMUNITY_TAB_CONDITIONS.invited);

	can([...LIST], "Credentials");
	can(READ_UPDATE_ACTIONS, "SpendAnalytics");
	can([...LIST], "Invoice");
	can(CRU_ACTIONS, ["Timekeeping", "Timesheet", "TimesheetDispute"]);
	can(
		[...LIST],
		[
			"MissingTimeCase",
			"TimekeepingSummary",
			"OrganizationPayCode",
			"OrganizationHoliday",
		],
	);
	can([...LIST], "ComplianceChecklist");
	can(CRU_ACTIONS, ["RequisitionTemplate", "ShiftTemplate"]);
	can([...LIST], "User");

	can(CRU_ACTIONS, [...ORG_LEADERSHIP_CRU_SUBJECTS]);
	can(READ_UPDATE_ACTIONS, [...ORG_LEADERSHIP_READ_UPDATE_SUBJECTS]);
	can([...LIST], [...ORG_LEADERSHIP_READ_SUBJECTS]);
	can([...LIST], [...ORG_PORTAL_FILTER_LIST_SUBJECTS]);
}
