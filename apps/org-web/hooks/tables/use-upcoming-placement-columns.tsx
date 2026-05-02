"use client";

import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Progress } from "@repo/ui/components/progress";
import { cn } from "@repo/ui/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import {
	BriefcaseBusiness,
	CircleAlert,
	CircleCheck,
	Clock3,
	MapPin,
} from "lucide-react";
import { useMemo } from "react";
import {
	UPCOMING_PLACEMENT_COMPLIANCE_BADGE_CLASS,
	UPCOMING_PLACEMENT_COMPLIANCE_LABEL,
	UPCOMING_PLACEMENT_PROGRESS_BAR_CLASS,
} from "@/constants/credentials";
import type { UpcomingPlacementTableItem } from "@/types/credentials";

export interface UpcomingPlacementColumnsCallbacks {
	onViewDetails: (item: UpcomingPlacementTableItem) => void;
}

export const useUpcomingPlacementColumns = ({
	onViewDetails,
}: UpcomingPlacementColumnsCallbacks) => {
	const columns = useMemo<ColumnDef<UpcomingPlacementTableItem>[]>(
		() => [
			{
				id: "candidate",
				header: "Candidate",
				cell: ({ row }) => (
					<div className="flex items-center gap-3">
						<Avatar className="size-10 bg-primary">
							<AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
								{row.original.candidateInitials}
							</AvatarFallback>
						</Avatar>
						<span className="font-medium">{row.original.candidateName}</span>
					</div>
				),
			},
			{
				id: "job-title",
				header: "Job Title",
				cell: ({ row }) => (
					<div className="flex items-center gap-2">
						<BriefcaseBusiness className="text-muted-foreground size-3.5 shrink-0" />
						<span>{row.original.jobTitle}</span>
					</div>
				),
			},
			{
				id: "location",
				header: "Location",
				cell: ({ row }) => (
					<div className="text-muted-foreground flex items-center gap-2">
						<MapPin className="size-3.5 shrink-0" />
						<span>{row.original.location}</span>
					</div>
				),
			},
			{
				id: "start-date",
				header: "Start Date",
				cell: ({ row }) => (
					<div className="space-y-0.5">
						<p>{row.original.startDate}</p>
						<p className="text-muted-foreground text-xs">
							{row.original.startMeta}
						</p>
					</div>
				),
			},
			{
				id: "compliance",
				header: "Compliance",
				cell: ({ row }) => {
					const isComplete = row.original.complianceStatus === "COMPLETE";
					const isInProgress = row.original.complianceStatus === "IN_PROGRESS";

					const Icon = isComplete
						? CircleCheck
						: isInProgress
							? Clock3
							: CircleAlert;

					return (
						<Badge
							variant="secondary"
							className={cn(
								"rounded-full",
								UPCOMING_PLACEMENT_COMPLIANCE_BADGE_CLASS[
									row.original.complianceStatus
								],
							)}
						>
							<Icon className="mr-1 size-3.5" />
							{
								UPCOMING_PLACEMENT_COMPLIANCE_LABEL[
									row.original.complianceStatus
								]
							}
						</Badge>
					);
				},
			},
			{
				id: "progress",
				header: "Progress",
				cell: ({ row }) => {
					const percentage =
						row.original.progressTotal > 0
							? Math.round(
									(row.original.progressCompleted /
										row.original.progressTotal) *
										100,
								)
							: 0;

					return (
						<div className="min-w-42.5 space-y-2">
							<Progress
								value={percentage}
								className={cn(
									"bg-muted h-2",
									UPCOMING_PLACEMENT_PROGRESS_BAR_CLASS[
										row.original.complianceStatus
									],
								)}
							/>
							<p className="text-muted-foreground text-xs">
								{row.original.progressCompleted}/{row.original.progressTotal}{" "}
								items
							</p>
							{row.original.missingItems ? (
								<p className="text-xs text-red-600">
									Missing: {row.original.missingItems}
								</p>
							) : null}
						</div>
					);
				},
			},
			{
				id: "actions",
				header: "Actions",
				cell: ({ row }) => (
					<Button
						variant="outline"
						size="sm"
						onClick={() => onViewDetails(row.original)}
					>
						View Details
					</Button>
				),
			},
		],
		[onViewDetails],
	);

	return { columns };
};
