"use client";

import {
	coerceYmdOrIsoToUtcInstant,
	getRequisitionStatusLabel,
	getRequisitionStatusVariant,
} from "@repo/shared";
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
import { LockableActionButton } from "@/components/general/LockableActionButton";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import type { OrgJobCardItem } from "@/types/org-job";
import {
	isJobActionLocked,
	jobActionLockedReason,
} from "@/utils/job-status-actions";

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
}: Readonly<JobCardProps>) {
	const editLocked = isJobActionLocked(job.status);
	const editLockReason = jobActionLockedReason(job.status);
	const { fmtShortDate } = useUserTimezone();
	const expectedStartSource = (
		job.expectedStartDateIso ||
		job.expectedStartDate ||
		""
	).trim();
	const expectedStartInstant = coerceYmdOrIsoToUtcInstant(expectedStartSource);
	const expectedStartDisplay = expectedStartInstant
		? fmtShortDate(expectedStartInstant)
		: "—";

	return (
		<Card className="h-full overflow-hidden border py-1 transition-shadow hover:shadow-sm">
			<CardContent className="flex h-full flex-col gap-4 p-5">
				<div className="flex items-start justify-between gap-3">
					<h3 className="min-w-0 pr-2 font-semibold text-base leading-tight truncate">
						{job.title}
					</h3>
					<Badge
						variant={getRequisitionStatusVariant(job.status)}
						className="shrink-0 px-3 py-1 text-xs font-medium"
					>
						{getRequisitionStatusLabel(job.status)}
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
								{expectedStartDisplay}
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
							<LockableActionButton
								locked={editLocked}
								lockReason={editLockReason}
								onClick={() => onEdit?.(job.id)}
								className="font-medium"
								variant="outline"
								size="sm"
							>
								<FileEdit className="size-4" data-icon="inline-start" />
								Edit
							</LockableActionButton>
						) : null}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
