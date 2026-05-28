import { getDeterministicId, SEED_PREFIX } from "../utils";
import { CANDIDATE_ID } from "./candidates";
import { REQUISITION_ID } from "./requisitions";

export const getSavedRequisitionsDataset = () => {
	return [
		{
			id: getDeterministicId(`${SEED_PREFIX}saved-quinn-1`),
			candidateId: CANDIDATE_ID.SAM_T_GLOBAL,
			requisitionId: REQUISITION_ID.MEDSURG,
		},
		{
			id: getDeterministicId(`${SEED_PREFIX}saved-quinn-2`),
			candidateId: CANDIDATE_ID.AMANDA_B_TALENT,
			requisitionId: REQUISITION_ID.LOW_SUB,
		},
		{
			id: getDeterministicId(`${SEED_PREFIX}saved-quinn-3`),
			candidateId: CANDIDATE_ID.MARCUS_V,
			requisitionId: REQUISITION_ID.LOW_SUB,
		},
		{
			id: getDeterministicId(`${SEED_PREFIX}saved-quinn-4`),
			candidateId: CANDIDATE_ID.SARAH_P,
			requisitionId: REQUISITION_ID.SLOW_FILL,
		},
	];
};
