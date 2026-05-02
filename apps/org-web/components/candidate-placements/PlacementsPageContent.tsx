"use client";

import { CANDIDATE_PORTAL_COPY } from "@/constants/candidate-portal";
import { useCandidatePortalPlacementsList } from "@/hooks/candidate/use-candidate-portal-placements-list";
import { candidatePlacementDetailPath } from "@/utils/candidate-portal-routes";
import { CandidatePlacementCard } from "./CandidatePlacementCard";
import { CandidatePlacementsSectionCard } from "./CandidatePlacementsSectionCard";
import { CandidatePlacementsSectionEmpty } from "./CandidatePlacementsSectionEmpty";
import { CandidatePortalContentSkeleton } from "./CandidatePortalContentSkeleton";

export function PlacementsPageContent() {
	const { organizationId, orgLoading, listQuery } =
		useCandidatePortalPlacementsList();

	if (orgLoading || (organizationId && listQuery.isPending)) {
		return <CandidatePortalContentSkeleton />;
	}

	if (!organizationId) {
		return (
			<p className="text-muted-foreground py-12 text-center text-sm">
				{CANDIDATE_PORTAL_COPY.needOrganization}
			</p>
		);
	}

	if (listQuery.isError) {
		return (
			<p className="text-destructive text-sm">
				{listQuery.error instanceof Error
					? listQuery.error.message
					: CANDIDATE_PORTAL_COPY.couldNotLoadPlacementsList}
			</p>
		);
	}

	if (!listQuery.data) {
		return (
			<p className="text-destructive text-sm">
				{CANDIDATE_PORTAL_COPY.couldNotLoadPlacementsList}
			</p>
		);
	}

	const data = listQuery.data;

	return (
		<div className="space-y-6">
			<CandidatePlacementsSectionCard title="Active Placements">
				{data.active.length === 0 ? (
					<CandidatePlacementsSectionEmpty
						title={CANDIDATE_PORTAL_COPY.placementsSectionActiveEmptyTitle}
						description={
							CANDIDATE_PORTAL_COPY.placementsSectionActiveEmptyDescription
						}
					/>
				) : (
					data.active.map((p) => (
						<CandidatePlacementCard
							key={p.id}
							placement={p}
							viewDetailsHref={candidatePlacementDetailPath(p.id)}
						/>
					))
				)}
			</CandidatePlacementsSectionCard>

			<CandidatePlacementsSectionCard title="Upcoming Placements">
				{data.upcoming.length === 0 ? (
					<CandidatePlacementsSectionEmpty
						title={CANDIDATE_PORTAL_COPY.placementsSectionUpcomingEmptyTitle}
						description={
							CANDIDATE_PORTAL_COPY.placementsSectionUpcomingEmptyDescription
						}
					/>
				) : (
					data.upcoming.map((p) => (
						<CandidatePlacementCard
							key={p.id}
							placement={p}
							viewDetailsHref={candidatePlacementDetailPath(p.id)}
						/>
					))
				)}
			</CandidatePlacementsSectionCard>

			<CandidatePlacementsSectionCard title="Past Placements">
				{data.past.length === 0 ? (
					<CandidatePlacementsSectionEmpty
						title={CANDIDATE_PORTAL_COPY.placementsSectionPastEmptyTitle}
						description={
							CANDIDATE_PORTAL_COPY.placementsSectionPastEmptyDescription
						}
					/>
				) : (
					data.past.map((p) => (
						<CandidatePlacementCard key={p.id} placement={p} />
					))
				)}
			</CandidatePlacementsSectionCard>
		</div>
	);
}
