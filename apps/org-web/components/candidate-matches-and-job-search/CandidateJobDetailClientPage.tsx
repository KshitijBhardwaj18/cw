"use client";

import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { Skeleton } from "@repo/ui/components/skeleton";
import { PageBackLink } from "@repo/ui/general/PageBackLink";
import { useCandidateOrganizationId } from "@/hooks/candidate/use-candidate-organization-id";
import { useCandidateMatchDetail } from "@/queries/candidate-matches.queries";
import { CandidateJobDetailPageContent } from "./CandidateJobDetailPageContent";

function DetailSkeleton() {
	return (
		<div className="space-y-6">
			<PageBackLink href="/matches">Back to Jobs &amp; Matches</PageBackLink>
			<div className="rounded-lg border bg-card p-6 space-y-4">
				<Skeleton className="h-8 w-3/4" />
				<Skeleton className="h-5 w-1/3" />
				<Skeleton className="h-24 w-full" />
			</div>
			{Array.from({ length: 3 }).map((_, i) => (
				<div key={i} className="rounded-lg border bg-card p-6 space-y-3">
					<Skeleton className="h-5 w-1/4" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-3/4" />
				</div>
			))}
		</div>
	);
}

export function CandidateJobDetailClientPage({
	requisitionId,
}: {
	requisitionId: string;
}) {
	const { organizationId } = useCandidateOrganizationId();
	const { data, isPending, isError } = useCandidateMatchDetail(requisitionId, {
		enabled: Boolean(organizationId),
	});

	if (isPending) return <DetailSkeleton />;

	if (isError || !data) {
		return (
			<div className="space-y-4">
				<PageBackLink href="/matches">Back to Jobs &amp; Matches</PageBackLink>
				<Empty>
					<EmptyHeader>
						<EmptyTitle>Job not found</EmptyTitle>
						<EmptyDescription>
							This job may have been removed or is no longer available.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			</div>
		);
	}

	return (
		<CandidateJobDetailPageContent job={data} organizationId={organizationId} />
	);
}
