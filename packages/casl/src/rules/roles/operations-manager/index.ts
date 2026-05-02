import { COMMAND_CENTER_TAB_CONDITIONS } from "../../../constants/command-center";
import { Action } from "../../../types/actions";
import type { AppSubjects } from "../../../types/subjects";
import type { Can } from "../../helpers";

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

const LIST = [Action.Read, Action.List] as const;

export function defineOperationsManagerRules(can: Can) {
	can([...LIST], ["Dashboard", "Organization", "MSP"]);
	can([Action.Update], "MSP");
	can([...LIST], "MSPLinkedOrg", [
		"id",
		"mspId",
		"organizationId",
		"startDate",
		"renewalDate",
		"possibleCancellationDate",
	] as const);

	can([Action.Read, Action.List, Action.Update, Action.Delete], "Note", {
		type: { not: "BILLING" },
	});

	can([...LIST], "CommandCenter", COMMAND_CENTER_TAB_CONDITIONS.metrics);
	can([...LIST], "CommandCenter", COMMAND_CENTER_TAB_CONDITIONS.shifts);
	can(
		[...LIST],
		"CommandCenter",
		COMMAND_CENTER_TAB_CONDITIONS["operations-management"],
	);
	can([...LIST], "CommandCenter", COMMAND_CENTER_TAB_CONDITIONS.performance);
	can(
		[...LIST],
		"CommandCenter",
		COMMAND_CENTER_TAB_CONDITIONS["hiring-funnel"],
	);

	can([...LIST], "Placement");
	can([...LIST], [...TIMEKEEPING_ALL_SUBJECTS]);
	can([...LIST], "Invoice");
	can([...LIST], "Billing");

	can([...LIST], ["Requisition", "Grievance"]);

	can([...LIST], "Submission");
}
