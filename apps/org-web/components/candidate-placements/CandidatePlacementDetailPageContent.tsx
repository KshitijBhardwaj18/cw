"use client";

import { Button } from "@repo/ui/components/button";
import Link from "next/link";
import { CandidatePortalContentSkeleton } from "@/components/candidate-placements/CandidatePortalContentSkeleton";
import { PlacementDetailView } from "@/components/candidate-placements/PlacementDetailView";
import { CANDIDATE_PORTAL_COPY } from "@/constants/candidate-portal";
import { useCandidatePlacementDetailPage } from "@/hooks/candidate/use-candidate-placement-detail-page";
import { candidatePlacementsListPath } from "@/utils/candidate-portal-routes";

export function CandidatePlacementDetailPageContent({
	placementId,
}: Readonly<{
	placementId: string;
}>) {
	const { organizationId, orgLoading, isReady, detailQuery } =
		useCandidatePlacementDetailPage(placementId);

	if (!placementId) {
		return (
			<p className="text-muted-foreground text-sm">
				{CANDIDATE_PORTAL_COPY.invalidPlacementLink}
			</p>
		);
	}

	if (orgLoading || (organizationId && !isReady)) {
		return <CandidatePortalContentSkeleton variant="compact" />;
	}

	if (!organizationId) {
		return (
			<p className="text-muted-foreground text-sm">
				{CANDIDATE_PORTAL_COPY.needOrganization}
			</p>
		);
	}

	if (detailQuery.isPending) {
		return <CandidatePortalContentSkeleton variant="compact" />;
	}

	if (detailQuery.isError || !detailQuery.data) {
		return (
			<div className="space-y-4">
				<Button variant="outline" size="sm" asChild>
					<Link href={candidatePlacementsListPath()}>
						{CANDIDATE_PORTAL_COPY.backToPlacements}
					</Link>
				</Button>
				<p className="text-destructive text-sm">
					{detailQuery.error instanceof Error
						? detailQuery.error.message
						: CANDIDATE_PORTAL_COPY.couldNotLoadPlacement}
				</p>
			</div>
		);
	}

	return (
		<PlacementDetailView detail={detailQuery.data} placementId={placementId} />
	);
}
