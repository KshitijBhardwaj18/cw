import { getDeterministicId, SEED_PREFIX } from "../utils";
import { CANDIDATE_ID } from "./candidates";

export const WORKFORCE_LIST_ID = {
	ICU_SPECIALISTS: getDeterministicId(`${SEED_PREFIX}list-icu-specialists`),
	AGENCY_WORKERS: getDeterministicId(`${SEED_PREFIX}list-agency-workers`),
	LEADERSHIP_TEAM: getDeterministicId(`${SEED_PREFIX}list-leadership-team`),
} as const;

export const getWorkforceListsDataset = (organizationId: string) => {
	const lists = [
		{
			id: WORKFORCE_LIST_ID.ICU_SPECIALISTS,
			organizationId,
			name: "ICU Specialists",
			description: "Nurses specialized in intensive care unit operations",
			members: [
				{ candidateId: CANDIDATE_ID.SARAH_J_TALENT },
				{ candidateId: CANDIDATE_ID.JAMES_W_INVITED },
				{ candidateId: CANDIDATE_ID.LISA_T_INVITED },
			],
		},
		{
			id: WORKFORCE_LIST_ID.AGENCY_WORKERS,
			organizationId,
			name: "Agency Workers",
			description: "All temporary staff from external agencies",
			members: [
				{ candidateId: CANDIDATE_ID.MICHAEL },
				{ candidateId: CANDIDATE_ID.DAVID },
			],
		},
		{
			id: WORKFORCE_LIST_ID.LEADERSHIP_TEAM,
			organizationId,
			name: "Leadership Team",
			description: "Directors, managers, and team leads",
			members: [
				{ candidateId: CANDIDATE_ID.LISA_T_INVITED },
				{ candidateId: CANDIDATE_ID.AMANDA_BROOKS_LEADERSHIP },
			],
		},
	];

	return lists;
};
