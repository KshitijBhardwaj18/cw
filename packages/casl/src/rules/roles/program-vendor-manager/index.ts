import { SUBMISSION_TAB_CONDITIONS } from "../../../constants/submissions";
import { Action } from "../../../types/actions";
import type { AppSubjects } from "../../../types/subjects";
import {
	type Can,
	CRU_ACTIONS,
	READ_CREATE_ACTIONS,
	READ_UPDATE_ACTIONS,
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

const LIST = [Action.Read, Action.List] as const;
const RU = [Action.Read, Action.List, Action.Update] as const;

export function defineProgramVendorManagerRules(can: Can) {
	can([...LIST], "ComplianceWalletTemplate");

	can(READ_UPDATE_ACTIONS, "CommandCenter");

	can([Action.Read, Action.List, Action.Update], "Placement");
	can(CRU_ACTIONS, "PlacementComplianceItem");

	can(CRU_ACTIONS, "Credentials");

	can(READ_CREATE_ACTIONS, "ComplianceChecklist");
	can(CRU_ACTIONS, ["RequisitionTemplate", "ShiftTemplate"]);
	can([...LIST], "Billing");
	can(CRU_ACTIONS, "User");

	can(CRU_ACTIONS, [...PORTAL_MANAGER_CRU_SUBJECTS]);
	can(READ_UPDATE_ACTIONS, "RequisitionApprovals");
	can([...LIST], ["Organization"]);

	can([...RU], "Submission", SUBMISSION_TAB_CONDITIONS.submitted);
	can([...LIST], "Submission", SUBMISSION_TAB_CONDITIONS.qualified);
	can([...LIST], "Submission", SUBMISSION_TAB_CONDITIONS.interviewScheduled);
	can([...LIST], "Submission", SUBMISSION_TAB_CONDITIONS.offerExtended);
	can([...LIST], "Submission", SUBMISSION_TAB_CONDITIONS.rejected);

	can(CRU_ACTIONS, [
		"TalentCommunity",
		"WorkforceLists",
		"ShiftRoutingSettings",
	]);

	can(CRU_ACTIONS, ["Timekeeping", ...TIMEKEEPING_HIGH_CONTROL_SUBJECTS]);
	can([...LIST], [...TIMEKEEPING_READ_ONLY_GROUP_SUBJECTS]);

	can([...LIST], ["SpendAnalytics", "Invoice"]);
}
