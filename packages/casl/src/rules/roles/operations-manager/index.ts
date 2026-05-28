import { COMMAND_CENTER_TAB_CONDITIONS } from "../../../constants/command-center";
import type { AppSubjects } from "../../../types/subjects";
import {
	type Can,
	CREATE_READ_LIST_UPDATE_ACTIONS,
	READ_LIST_ACTIONS,
	READ_LIST_UPDATE_ACTIONS,
	READ_LIST_UPDATE_DELETE_ACTIONS,
} from "../../helpers";

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

export function defineOperationsManagerRules(can: Can) {
	can(READ_LIST_ACTIONS, ["Dashboard", "Organization", "MSP"]);
	can(READ_LIST_ACTIONS, "MSPLinkedOrg", [
		"id",
		"mspId",
		"organizationId",
		"startDate",
		"renewalDate",
		"possibleCancellationDate",
	] as const);

	can(READ_LIST_UPDATE_DELETE_ACTIONS, "Note", {
		type: { not: "BILLING" },
	});

	can(
		READ_LIST_ACTIONS,
		"CommandCenter",
		COMMAND_CENTER_TAB_CONDITIONS.metrics,
	);
	can(READ_LIST_ACTIONS, "CommandCenter", COMMAND_CENTER_TAB_CONDITIONS.shifts);
	can(
		READ_LIST_ACTIONS,
		"CommandCenter",
		COMMAND_CENTER_TAB_CONDITIONS["operations-management"],
	);
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

	can(READ_LIST_ACTIONS, "Placement");
	can(READ_LIST_ACTIONS, [...TIMEKEEPING_ALL_SUBJECTS]);
	can(READ_LIST_ACTIONS, "Invoice");

	can(READ_LIST_ACTIONS, ["Requisition", "Grievance"]);

	can(READ_LIST_ACTIONS, "Submission");

	can(READ_LIST_UPDATE_ACTIONS, "User");
	can(READ_LIST_ACTIONS, "Department");
	can(CREATE_READ_LIST_UPDATE_ACTIONS, "Member");
}
