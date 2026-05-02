"use client";

import { useCandidateOrganizationId } from "@/hooks/candidate/use-candidate-organization-id";
import { useCandidateTimecardDetail } from "@/queries/candidate-placements.queries";

export function useCandidateTimecardDetailPage(
	placementId: string,
	timecardId: string,
) {
	const {
		organizationId,
		isLoading: orgLoading,
		isReady,
	} = useCandidateOrganizationId();

	const detailQuery = useCandidateTimecardDetail(
		placementId,
		timecardId,
		Boolean(organizationId && isReady),
	);

	return { organizationId, orgLoading, isReady, detailQuery };
}
