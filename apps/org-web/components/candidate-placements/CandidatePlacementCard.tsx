import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { Calendar, Clock, Info, MapPin } from "lucide-react";
import Link from "next/link";
import type { CandidatePlacementListItem } from "@/types/candidate-placement";
import { candidatePlacementTimecardPath } from "@/utils/candidate-portal-routes";

const STATUS_BADGE: Record<
	CandidatePlacementListItem["kind"],
	{ label: string; className: string }
> = {
	active: {
		label: "Active",
		className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100/90",
	},
	upcoming: {
		label: "Upcoming",
		className: "bg-sky-100 text-sky-800 hover:bg-sky-100/90",
	},
	past: {
		label: "Completed",
		className: "bg-slate-100 text-slate-700 hover:bg-slate-100/90",
	},
};

export interface CandidatePlacementCardProps {
	placement: CandidatePlacementListItem;
	viewDetailsHref?: string;
}

export function CandidatePlacementCard({
	placement,
	viewDetailsHref = "#",
}: CandidatePlacementCardProps) {
	const badge = STATUS_BADGE[placement.kind];
	const showTimecard = placement.kind === "active";
	const showOnboardingBanner =
		placement.kind === "upcoming" &&
		typeof placement.onboardingPercent === "number";

	return (
		<div className="bg-card flex flex-col gap-4 rounded-lg border p-4 shadow-none">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0 space-y-1">
					<p className="font-semibold leading-snug">{placement.jobTitle}</p>
					<p className="text-muted-foreground text-sm">
						{placement.employerName}
					</p>
				</div>
				<Badge
					variant="secondary"
					className={cn("shrink-0 text-xs font-medium", badge.className)}
				>
					{badge.label}
				</Badge>
			</div>

			<div className="text-muted-foreground flex flex-wrap gap-x-6 gap-y-2 text-sm">
				<span className="inline-flex items-center gap-1.5">
					<MapPin className="size-4 shrink-0 opacity-80" aria-hidden />
					{placement.locationLabel}
				</span>
				<span className="inline-flex items-center gap-1.5">
					<Calendar className="size-4 shrink-0 opacity-80" aria-hidden />
					{placement.dateLabel}
				</span>
				{placement.shiftLabel ? (
					<span className="inline-flex items-center gap-1.5">
						<Clock className="size-4 shrink-0 opacity-80" aria-hidden />
						{placement.shiftLabel}
					</span>
				) : null}
			</div>

			{showOnboardingBanner ? (
				<div
					className="flex items-start gap-2 rounded-md border border-blue-200/80 bg-blue-50/80 px-3 py-2 text-sm text-blue-900"
					role="status"
				>
					<Info className="mt-0.5 size-4 shrink-0 text-blue-600" aria-hidden />
					<span className="font-medium">
						Complete your onboarding ({placement.onboardingPercent}% done)
					</span>
				</div>
			) : null}

			{placement.kind !== "past" ? (
				<div className="flex flex-wrap items-center justify-end gap-2 pt-1">
					{showTimecard ? (
						<Button type="button" variant="outline" size="sm" asChild>
							<Link href={candidatePlacementTimecardPath(placement.id)}>
								Submit Timecard
							</Link>
						</Button>
					) : null}
					{viewDetailsHref ? (
						<Button size="sm" asChild>
							<Link href={viewDetailsHref}>
								View Details
								<span aria-hidden className="ml-1">
									→
								</span>
							</Link>
						</Button>
					) : null}
				</div>
			) : null}
		</div>
	);
}
