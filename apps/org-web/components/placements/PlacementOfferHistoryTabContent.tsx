"use client";

import { usePlacementOfferHistorySuspense } from "@/queries/placements.queries";
import { OfferAcceptanceSummaryCard } from "./OfferAcceptanceSummaryCard";
import { OfferHistoryEventCard } from "./OfferHistoryEventCard";

interface PlacementOfferHistoryTabContentProps {
	placementId: string;
}

export function PlacementOfferHistoryTabContent({
	placementId,
}: Readonly<PlacementOfferHistoryTabContentProps>) {
	const { data } = usePlacementOfferHistorySuspense(placementId);

	const { summary, events } = data ?? { summary: null, events: [] };

	return (
		<div className="space-y-6">
			<h2 className="text-xl font-semibold">Offer History & Changes</h2>
			{events.length === 0 ? (
				<p className="text-muted-foreground py-8 text-center text-sm">
					No offer events yet.
				</p>
			) : (
				<>
					{summary && <OfferAcceptanceSummaryCard summary={summary} />}
					<div className="space-y-4">
						{events.map((event) => (
							<OfferHistoryEventCard key={event.id} event={event} />
						))}
					</div>
				</>
			)}
		</div>
	);
}
