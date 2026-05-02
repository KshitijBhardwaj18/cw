import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import { Calendar, Check, Clock } from "lucide-react";
import Link from "next/link";
import type { CandidateTimecardListItem } from "@/types/candidate-timecard";
import { candidatePlacementTimecardDetailPath } from "@/utils/candidate-portal-routes";

const STATUS_BADGE: Record<
	CandidateTimecardListItem["status"],
	{ label: string; className: string; icon: typeof Check }
> = {
	approved: {
		label: "Approved",
		className:
			"border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/35 dark:text-emerald-300",
		icon: Check,
	},
	submitted: {
		label: "Submitted",
		className:
			"border-transparent bg-sky-100 text-sky-800 dark:bg-sky-900/35 dark:text-sky-300",
		icon: Clock,
	},
	draft: {
		label: "Draft",
		className:
			"border-transparent bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
		icon: Clock,
	},
};

export interface TimecardHistoryRowProps {
	item: CandidateTimecardListItem;
	placementId: string;
	/** Opens the time entry dialog for this row’s pay week (candidate portal). */
	onContinueEntry?: (weekEndingDate: string, timecardId: string) => void;
}

export function TimecardHistoryRow({
	item,
	placementId,
	onContinueEntry,
}: TimecardHistoryRowProps) {
	const badge = STATUS_BADGE[item.status];
	const StatusIcon = badge.icon;
	const detailHref = candidatePlacementTimecardDetailPath(placementId, item.id);

	return (
		<Card className="shadow-none">
			<CardContent className="pt-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="min-w-0 space-y-2">
						<p className="font-semibold leading-snug">{item.jobTitle}</p>
						<div className="text-muted-foreground flex flex-wrap gap-x-5 gap-y-1 text-sm">
							<span className="inline-flex items-center gap-1.5">
								<Calendar className="size-4 shrink-0 opacity-80" aria-hidden />
								Week Ending: {item.weekEndingDate}
							</span>
							<span className="inline-flex items-center gap-1.5">
								<Clock className="size-4 shrink-0 opacity-80" aria-hidden />
								{item.totalHours} hours
							</span>
						</div>
					</div>
					<Badge
						className={cn("shrink-0 gap-1 self-start sm:ml-4", badge.className)}
					>
						<StatusIcon className="size-3.5" aria-hidden />
						{badge.label}
					</Badge>
				</div>

				<div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
					<p className="text-muted-foreground text-sm">{item.footerNote}</p>
					<div className="flex shrink-0 justify-end sm:justify-start">
						{item.status === "draft" ? (
							<Button
								type="button"
								size="sm"
								onClick={() => onContinueEntry?.(item.weekEndingDate, item.id)}
							>
								Continue Entry
							</Button>
						) : (
							<Button variant="outline" size="sm" asChild>
								<Link href={detailHref}>View Details</Link>
							</Button>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
