"use client";

import { useCandidateOrganizationId } from "@/hooks/candidate/use-candidate-organization-id";
import { useCandidatePlacementsList } from "@/queries/candidate-placements.queries";

export function useCandidatePortalPlacementsList() {
	const {
		organizationId,
		isLoading: orgLoading,
		isReady,
	} = useCandidateOrganizationId();

	const listQuery = useCandidatePlacementsList({
		enabled: Boolean(organizationId) && isReady,
	});

	return {
		organizationId,
		orgLoading,
		listQuery,
	};
}
