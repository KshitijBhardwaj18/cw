import { CANDIDATE_ID } from "./candidates";
import { TAG_ID } from "./tags";

export const getCandidateTagsDataset = () => {
	const links = [
		{
			candidateId: CANDIDATE_ID.SARAH_J_TALENT,
			tagIds: [TAG_ID.ICU, TAG_ID.CRITICAL_CARE],
		},
		{
			candidateId: CANDIDATE_ID.JAMES_W_INVITED,
			tagIds: [TAG_ID.EMERGENCY, TAG_ID.TRAUMA],
		},
		{
			candidateId: CANDIDATE_ID.LISA_T_INVITED,
			tagIds: [TAG_ID.LEADERSHIP, TAG_ID.ICU],
		},
		{
			candidateId: CANDIDATE_ID.MICHAEL,
			tagIds: [TAG_ID.REHAB, TAG_ID.ORTHOPEDIC],
		},
		{
			candidateId: CANDIDATE_ID.DAVID,
			tagIds: [TAG_ID.ER, TAG_ID.FLOAT_POOL],
		},
		{
			candidateId: CANDIDATE_ID.AMANDA_BROOKS_LEADERSHIP,
			tagIds: [TAG_ID.SURGERY, TAG_ID.LEADERSHIP],
		},
	];

	return links;
};
