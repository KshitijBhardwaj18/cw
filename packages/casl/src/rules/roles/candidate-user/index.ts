import { Action } from "../../../types/actions";
import { type Can, CRU_ACTIONS, READ_UPDATE_ACTIONS } from "../../helpers";

export function defineCandidateUserRules(can: Can) {
	can(
		[Action.Read, Action.List],
		[
			"Occupation",
			"Specialty",
			"Requisition",
			"OrganizationOccupation",
			"OrganizationSpecialty",
			"OrganizationLocation",
		],
	);
	can([Action.Read, Action.List], "Placement");
	can(CRU_ACTIONS, ["Organization", "CandidateSubmission"]);
	can(READ_UPDATE_ACTIONS, "Candidate");
	can(READ_UPDATE_ACTIONS, "CandidateCompliance");
	can([Action.Create, Action.Delete], "CandidateSavedRequisition");
	can([Action.Read, Action.List, Action.Update, Action.Create], "Timesheet");
	can([Action.Read, Action.List, Action.Update], "PerDiemShift");
}
