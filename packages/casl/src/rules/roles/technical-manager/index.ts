import { COMMAND_CENTER_TAB_CONDITIONS } from "../../../constants/command-center";
import { Action } from "../../../types/actions";
import type { AppSubjects } from "../../../types/subjects";
import { type Can, CRU_ACTIONS } from "../../helpers";

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

export function defineTechnicalManagerRules(can: Can) {
	can([...LIST], ["Dashboard", "Organization", "MSP"]);

	can(CRU_ACTIONS, ["ComplianceWalletTemplate", "Questionnaire"]);
	can(Action.Manage, "Question");

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
