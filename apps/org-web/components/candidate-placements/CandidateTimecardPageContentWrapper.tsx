"use client";

import { Button } from "@repo/ui/components/button";
import Link from "next/link";
import { CandidatePortalContentSkeleton } from "@/components/candidate-placements/CandidatePortalContentSkeleton";
import { TimecardPageContent } from "@/components/candidate-placements/TimecardPageContent";
import { CANDIDATE_PORTAL_COPY } from "@/constants/candidate-portal";
import { useCandidateTimecardPage } from "@/hooks/candidate/use-candidate-timecard-page";
import { candidatePlacementsListPath } from "@/utils/candidate-portal-routes";

export function CandidateTimecardPageContentWrapper({
	placementId,
}: Readonly<{
	placementId: string;
}>) {
	const { organizationId, orgLoading, isReady, timecardsQuery } =
		useCandidateTimecardPage(placementId);

	if (orgLoading || (organizationId && !isReady)) {
		return <CandidatePortalContentSkeleton />;
	}

	if (!organizationId) {
		return (
			<p className="text-muted-foreground py-12 text-center text-sm">
				{CANDIDATE_PORTAL_COPY.needOrganization}
			</p>
		);
	}

	if (timecardsQuery.isPending) {
		return <CandidatePortalContentSkeleton />;
	}

	if (timecardsQuery.isError || !timecardsQuery.data) {
		return (
			<div className="space-y-4">
				<Button variant="ghost" size="sm" asChild>
					<Link href={candidatePlacementsListPath()}>
						{CANDIDATE_PORTAL_COPY.backToPlacements}
					</Link>
				</Button>
				<p className="text-destructive text-sm">
					{timecardsQuery.error instanceof Error
						? timecardsQuery.error.message
						: CANDIDATE_PORTAL_COPY.couldNotLoadTimecards}
				</p>
			</div>
		);
	}

	return (
		<TimecardPageContent
			data={timecardsQuery.data}
			canMutate={Boolean(organizationId)}
		/>
	);
}
