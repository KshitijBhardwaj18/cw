"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { Progress } from "@repo/ui/components/progress";
import { MapPin, User } from "lucide-react";
import Link from "next/link";
import { PLACEMENT_STATUS_VARIANTS } from "@/constants/placement-status";
import { usePlacementCardActions } from "@/hooks/use-placement-card-actions";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import type { PlacementCardItem } from "@/types/placement";
import { EndPlacementDialog } from "./EndPlacementDialog";

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

function getComplianceClass(percent: number): string {
	if (percent >= 100)
		return "[&_[data-slot=progress-indicator]]:bg-emerald-500";
	if (percent >= 80) return "[&_[data-slot=progress-indicator]]:bg-amber-500";
	return "[&_[data-slot=progress-indicator]]:bg-red-500";
}

const ENDABLE_STATUSES = new Set(["ACTIVE", "UPCOMING", "ON_HOLD"]);

export interface PlacementCardProps {
	placement: PlacementCardItem;
	detailBasePath: string;
	showEndAction: boolean;
}

export function PlacementCard({
	placement,
	detailBasePath,
	showEndAction,
}: Readonly<PlacementCardProps>) {
	const { endDialogOpen, setEndDialogOpen, handleEndConfirm, isEndPending } =
		usePlacementCardActions(placement.id, placement.placementNumber);
	const { fmtShortDate } = useUserTimezone();

	const statusConfig =
		PLACEMENT_STATUS_VARIANTS[placement.status] ??
		PLACEMENT_STATUS_VARIANTS.UPCOMING;

	return (
		<Card className="overflow-hidden transition-shadow hover:shadow-md">
			<CardContent className="flex flex-col gap-4">
				<div className="flex items-start justify-between gap-2">
					<div className="flex min-w-0 items-center gap-3">
						<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary text-sm">
							{getInitials(placement.candidateName)}
						</div>
						<div className="min-w-0 flex-1">
							<p className="truncate font-semibold text-sm">
								{placement.candidateName}
							</p>
							<p className="text-muted-foreground text-xs">
								{placement.sourceType}
							</p>
						</div>
					</div>
					<Badge
						variant="secondary"
						className={`shrink-0 font-medium text-xs ${statusConfig.className}`}
					>
						{statusConfig.label}
					</Badge>
				</div>

				<div>
					<p className="text-muted-foreground text-xs">Role</p>
					<p className="font-medium text-sm">{placement.jobTitle ?? "—"}</p>
				</div>

				<div className="flex items-center gap-2 text-sm">
					<MapPin className="text-muted-foreground size-4 shrink-0" />
					<span>{placement.locationName ?? "—"}</span>
				</div>
				<div className="flex items-center gap-2 text-sm">
					<User className="text-muted-foreground size-4 shrink-0" />
					<span>{placement.hiringManagerName ?? "—"}</span>
				</div>

				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<div>
						<p className="text-muted-foreground text-xs">Start Date</p>
						<p className="font-medium text-sm">
							{fmtShortDate(placement.startDate)}
						</p>
					</div>
					<div>
						<p className="text-muted-foreground text-xs">End Date</p>
						<p className="font-medium text-sm">
							{fmtShortDate(placement.endDate)}
						</p>
					</div>
				</div>

				<div>
					<p className="text-muted-foreground mb-1.5 text-xs">
						Compliance: {placement.compliancePercent}%
					</p>
					<Progress
						value={Math.min(placement.compliancePercent, 100)}
						className={getComplianceClass(placement.compliancePercent)}
					/>
				</div>

				<div className="flex items-center justify-between gap-2 border-t pt-2">
					<Button variant="outline" size="sm" className="shrink-0" asChild>
						<Link href={`${detailBasePath}/${placement.id}`}>View Details</Link>
					</Button>
					{showEndAction && ENDABLE_STATUSES.has(placement.status) && (
						<Button
							variant="destructive"
							size="sm"
							className="shrink-0"
							onClick={() => setEndDialogOpen(true)}
						>
							End
						</Button>
					)}
				</div>
			</CardContent>

			<EndPlacementDialog
				open={endDialogOpen}
				onOpenChange={setEndDialogOpen}
				placementNumber={placement.placementNumber}
				onConfirm={handleEndConfirm}
				isPending={isEndPending}
			/>
		</Card>
	);
}
