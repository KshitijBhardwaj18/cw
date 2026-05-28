import {
	type Can,
	CREATE_DELETE_ACTIONS,
	CREATE_READ_LIST_UPDATE_ACTIONS,
	READ_LIST_ACTIONS,
	READ_LIST_UPDATE_ACTIONS,
	READ_LIST_UPDATE_CREATE_ACTIONS,
} from "../../helpers";

export function defineCandidateUserRules(can: Can) {
	can(READ_LIST_ACTIONS, [
		"Occupation",
		"Specialty",
		"Requisition",
		"OrganizationOccupation",
		"OrganizationSpecialty",
		"OrganizationLocation",
	]);
	can(READ_LIST_ACTIONS, "Placement");
	can(CREATE_READ_LIST_UPDATE_ACTIONS, ["Organization", "CandidateSubmission"]);
	can(READ_LIST_UPDATE_ACTIONS, "Candidate");
	can(READ_LIST_UPDATE_ACTIONS, "CandidateCompliance");
	can(CREATE_DELETE_ACTIONS, "CandidateSavedRequisition");
	can(READ_LIST_UPDATE_CREATE_ACTIONS, "Timesheet");
	can(READ_LIST_UPDATE_ACTIONS, "PerDiemShift");
}
