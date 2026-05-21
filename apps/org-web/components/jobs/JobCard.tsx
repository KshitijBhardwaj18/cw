"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import {
	BriefcaseBusiness,
	CalendarDays,
	Clock3,
	Eye,
	FileEdit,
	MapPin,
	UserRound,
} from "lucide-react";
import type { OrgJobCardItem, OrgJobDisplayStatus } from "@/types/org-job";

const STATUS_BADGE_STYLES: Record<OrgJobDisplayStatus, string> = {
	OPEN: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
	OFFER_ACCEPTED:
		"bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
	FILLED:
		"bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-300",
	DRAFT:
		"bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
	CLOSED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const STATUS_LABELS: Record<OrgJobDisplayStatus, string> = {
	OPEN: "Open",
	OFFER_ACCEPTED: "Offer Accepted",
	FILLED: "Filled",
	DRAFT: "Draft",
	CLOSED: "Closed",
};

interface JobCardProps {
	job: OrgJobCardItem;
	onView?: (id: string) => void;
	onEdit?: (id: string) => void;
	showView?: boolean;
	showEdit?: boolean;
}

export function JobCard({
	job,
	onView,
	onEdit,
	showView = true,
	showEdit = true,
}: JobCardProps) {
	return (
		<Card className="h-full overflow-hidden border py-1 transition-shadow hover:shadow-sm">
			<CardContent className="flex h-full flex-col gap-4 p-5">
				<div className="flex items-start justify-between gap-3">
					<h3 className="min-w-0 pr-2 font-semibold text-base leading-tight truncate">
						{job.title}
					</h3>
					<Badge
						className={`shrink-0 px-3 py-1 text-xs font-medium ${STATUS_BADGE_STYLES[job.status]}`}
					>
						{STATUS_LABELS[job.status]}
					</Badge>
				</div>

				<div className="border bg-background px-3 py-2">
					<div className="flex min-w-0 items-center gap-2">
						<MapPin className="text-muted-foreground size-3.5 shrink-0" />
						<p className="text-muted-foreground text-sm leading-snug truncate">
							{job.location}
						</p>
					</div>
				</div>

				<div className="space-y-4">
					<div className="flex min-w-0 items-center gap-2 text-sm">
						<Clock3 className="text-muted-foreground size-3.5 shrink-0" />
						<p className="text-sm font-medium text-foreground truncate">
							{job.durationLabel}
						</p>
					</div>

					<div className="flex min-w-0 items-center gap-2 text-sm">
						<BriefcaseBusiness className="text-muted-foreground size-3.5 shrink-0" />
						<p className="text-sm font-medium text-foreground truncate">
							{job.shiftLabel}
						</p>
					</div>

					<div className="flex min-w-0 items-start gap-2">
						<UserRound className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
						<div className="min-w-0">
							<p className="text-muted-foreground text-xs">Hiring Manager</p>
							<p className="mt-0.5 font-medium text-sm leading-tight truncate">
								{job.hiringManager}
							</p>
						</div>
					</div>

					<div className="flex items-start gap-2">
						<CalendarDays className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
						<div>
							<p className="text-muted-foreground text-xs">Expected Start</p>
							<p className="mt-0.5 font-medium text-sm leading-tight">
								{job.expectedStartDate}
							</p>
						</div>
					</div>
				</div>

				{(showView || showEdit) && (
					<div
						className={`mt-auto grid gap-3 pt-1 ${showView && showEdit ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}
					>
						{showView ? (
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="font-medium"
								onClick={() => onView?.(job.id)}
							>
								<Eye className="size-4" data-icon="inline-start" />
								View
							</Button>
						) : null}
						{showEdit ? (
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="font-medium"
								onClick={() => onEdit?.(job.id)}
							>
								<FileEdit className="size-4" data-icon="inline-start" />
								Edit
							</Button>
						) : null}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
