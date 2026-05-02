"use client";

import { useCandidateOrganizationId } from "@/hooks/candidate/use-candidate-organization-id";
import { useCandidatePlacementTimecards } from "@/queries/candidate-placements.queries";

export function useCandidateTimecardPage(placementId: string) {
	const {
		organizationId,
		isLoading: orgLoading,
		isReady,
	} = useCandidateOrganizationId();

	const timecardsQuery = useCandidatePlacementTimecards(
		placementId,
		Boolean(organizationId && isReady),
	);

	return { organizationId, orgLoading, isReady, timecardsQuery };
}
