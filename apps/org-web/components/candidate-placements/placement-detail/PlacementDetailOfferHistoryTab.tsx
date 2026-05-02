"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import { OfferAcceptanceSummaryCard } from "@/components/placements/OfferAcceptanceSummaryCard";
import { OfferHistoryEventCard } from "@/components/placements/OfferHistoryEventCard";
import { useCandidatePlacementOfferHistory } from "@/queries/candidate-placements.queries";

export function PlacementDetailOfferHistoryTab({
	placementId,
}: {
	placementId: string;
}) {
	const { data, isPending, isError, error } = useCandidatePlacementOfferHistory(
		placementId,
		true,
	);

	if (isPending) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-32 w-full rounded-lg" />
				<Skeleton className="h-24 w-full rounded-lg" />
			</div>
		);
	}

	if (isError) {
		return (
			<p className="text-destructive text-sm">
				{error instanceof Error
					? error.message
					: "Could not load offer history."}
			</p>
		);
	}

	const { summary, events } = data ?? { summary: null, events: [] };

	return (
		<div className="space-y-6">
			<h2 className="text-xl font-semibold">Offer History & Changes</h2>

			{summary && <OfferAcceptanceSummaryCard summary={summary} />}

			{events.length === 0 ? (
				<Card className="bg-muted/30 shadow-none">
					<CardHeader>
						<CardTitle className="text-base font-semibold">Activity</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground text-sm">
							No offer events yet.
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-4">
					{events.map((event) => (
						<OfferHistoryEventCard key={event.id} event={event} />
					))}
				</div>
			)}
		</div>
	);
}
