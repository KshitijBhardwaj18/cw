"use client";

import { useCandidateOrganizationId } from "@/hooks/candidate/use-candidate-organization-id";
import { useCandidatePlacementDetail } from "@/queries/candidate-placements.queries";

export function useCandidatePlacementDetailPage(placementId: string) {
	const {
		organizationId,
		isLoading: orgLoading,
		isReady,
	} = useCandidateOrganizationId();

	const detailQuery = useCandidatePlacementDetail(placementId, {
		enabled: Boolean(organizationId) && isReady,
	});

	return { organizationId, orgLoading, isReady, detailQuery };
}
