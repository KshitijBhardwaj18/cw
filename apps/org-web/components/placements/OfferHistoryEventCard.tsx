"use client";

import { Badge } from "@repo/ui/components/badge";
import { Card, CardContent } from "@repo/ui/components/card";
import type {
	OfferHistoryEvent,
	OfferHistoryEventType,
} from "@/constants/placement-offer-history";
import { OFFER_EVENT_BADGE_CONFIG } from "@/constants/placement-offer-history";

const ACTIVE_BADGE_CLASS = "bg-emerald-100 text-emerald-800";

interface OfferHistoryEventCardProps {
	event: OfferHistoryEvent;
}

export function OfferHistoryEventCard({ event }: OfferHistoryEventCardProps) {
	const eventConfig = OFFER_EVENT_BADGE_CONFIG[
		event.eventType as OfferHistoryEventType
	] ?? {
		label: String(event.eventType).replace(/_/g, " "),
		className: "bg-slate-100 text-slate-700",
	};
	const performedByLabel = event.performedByRole
		? `${event.performedBy} (${event.performedByRole})`
		: event.performedBy;

	return (
		<Card className="border">
			<CardContent>
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="flex flex-wrap items-center gap-2">
						<Badge
							variant="secondary"
							className={`text-xs font-medium ${eventConfig.className}`}
						>
							{eventConfig.label}
						</Badge>
						<Badge
							variant="secondary"
							className={`text-xs font-medium ${ACTIVE_BADGE_CLASS}`}
						>
							Active
						</Badge>
					</div>
					<div className="text-right">
						<p className="text-sm font-medium">{event.performedAt}</p>
						{event.performedAtTime && (
							<p className="text-sm text-muted-foreground">
								{event.performedAtTime}
								{event.timezone ? ` ${event.timezone}` : ""}
							</p>
						)}
					</div>
				</div>
				<div className="mt-2 space-y-1">
					<p className="font-medium">{event.description}</p>
					{event.details && (
						<p className="text-sm text-muted-foreground">{event.details}</p>
					)}
					<p className="text-sm text-muted-foreground">
						Performed by: {performedByLabel}
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
