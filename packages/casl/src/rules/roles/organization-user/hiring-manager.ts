import { COMMAND_CENTER_TAB_CONDITIONS } from "../../../constants/command-center";
import { SUBMISSION_TAB_CONDITIONS } from "../../../constants/submissions";
import { TALENT_COMMUNITY_TAB_CONDITIONS } from "../../../constants/talent-community";
import type { AppSubjects } from "../../../types/subjects";
import {
	type Can,
	CREATE_READ_LIST_UPDATE_ACTIONS,
	READ_LIST_ACTIONS,
	READ_LIST_UPDATE_ACTIONS,
} from "../../helpers";

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
	can(READ_LIST_ACTIONS, "PlacementComplianceItem");

	can(
		READ_LIST_UPDATE_ACTIONS,
		"Submission",
		SUBMISSION_TAB_CONDITIONS.qualified,
	);
	can(
		READ_LIST_UPDATE_ACTIONS,
		"Submission",
		SUBMISSION_TAB_CONDITIONS.interviewScheduled,
	);
	can(
		READ_LIST_UPDATE_ACTIONS,
		"Submission",
		SUBMISSION_TAB_CONDITIONS.offerExtended,
	);
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

	can(READ_LIST_ACTIONS, "Credentials");
	can(READ_LIST_UPDATE_ACTIONS, "SpendAnalytics");
	can(READ_LIST_ACTIONS, "Invoice");
	can(CREATE_READ_LIST_UPDATE_ACTIONS, [
		"Timekeeping",
		"Timesheet",
		"TimesheetDispute",
	]);
	can(READ_LIST_ACTIONS, [
		"MissingTimeCase",
		"TimekeepingSummary",
		"OrganizationPayCode",
		"OrganizationHoliday",
	]);
	can(READ_LIST_ACTIONS, "ComplianceChecklist");
	can(CREATE_READ_LIST_UPDATE_ACTIONS, [
		"RequisitionTemplate",
		"ShiftTemplate",
	]);
	can(READ_LIST_ACTIONS, "User");

	can(CREATE_READ_LIST_UPDATE_ACTIONS, [...ORG_LEADERSHIP_CRU_SUBJECTS]);
	can(READ_LIST_UPDATE_ACTIONS, [...ORG_LEADERSHIP_READ_UPDATE_SUBJECTS]);
	can(READ_LIST_ACTIONS, [...ORG_LEADERSHIP_READ_SUBJECTS]);
	can(READ_LIST_ACTIONS, [...ORG_PORTAL_FILTER_LIST_SUBJECTS]);
}
