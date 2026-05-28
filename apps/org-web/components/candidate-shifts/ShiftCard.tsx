"use client";

import { formatUsdPerHour, todayInOrgTimezone, zonedToUtc } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import {
	Briefcase,
	Building2,
	Calendar,
	Clock,
	Loader2,
	MapPin,
	Zap,
} from "lucide-react";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import type {
	CandidateShiftListItem,
	CandidateWorkerType,
} from "@/types/candidate-shifts";

interface ShiftCardProps {
	shift: CandidateShiftListItem;
	workerType: CandidateWorkerType;
	isInternalWorkforce?: boolean;
	onAction?: (
		shiftId: string,
		action: "claim" | "mark-interest" | "submit-timecard",
	) => void;
	onClick?: (shift: CandidateShiftListItem) => void;
	isActionLoading?: boolean;
}

export function ShiftCard({
	shift,
	workerType,
	isInternalWorkforce = false,
	onAction,
	onClick,
	isActionLoading,
}: Readonly<ShiftCardProps>) {
	const { fmtShortDate, fmtTime, tz } = useUserTimezone();
	const isMine = shift.isClaimed || shift.status === "IN_PROGRESS";
	const todayIsoDate = todayInOrgTimezone(tz);
	const shiftIsoDate = shift.date.slice(0, 10);
	const isPast = shiftIsoDate < todayIsoDate;
	const shiftTimeLabel = `${fmtTime(zonedToUtc(shift.date, shift.startTime, tz))} – ${fmtTime(zonedToUtc(shift.date, shift.endTime, tz))}`;
	const isExpired = shift.status === "EXPIRED";

	const handleAction = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!onAction) return;
		if (isMine) {
			onAction(shift.id, "submit-timecard");
		} else {
			onAction(shift.id, workerType === "vendor" ? "mark-interest" : "claim");
		}
	};

	const actionLabel = (() => {
		if (isMine) return "Submit Timecard";
		if (workerType === "vendor") return "Mark Interest";
		return "Claim Shift";
	})();

	const actionVariant = isMine ? "outline" : "default";

	const actionLoadingLabel = isMine
		? "Opening…"
		: workerType === "vendor"
			? "Marking…"
			: "Claiming…";

	return (
		<Card
			className={cn(
				"gap-4 transition-all duration-200",
				onClick && "cursor-pointer hover:border-primary/50 hover:shadow-md",
			)}
			onClick={() => onClick?.(shift)}
		>
			<CardHeader className="space-y-3">
				<div className="min-w-0 space-y-3">
					<div className="flex flex-wrap items-center gap-2">
						<CardTitle className="min-w-0 text-base font-semibold leading-snug sm:text-lg">
							{shift.title}
						</CardTitle>
						{shift.status === "IN_PROGRESS" && isMine && (
							<Badge variant="success">Claimed</Badge>
						)}
						{shift.status === "COMPLETED" && (
							<Badge variant="secondary">Completed</Badge>
						)}
						{shift.status === "OPEN" && !isMine && (
							<Badge variant="info">Open</Badge>
						)}
						{isExpired && <Badge variant="secondary">Expired</Badge>}
						{shift.isUrgent && (
							<Badge variant="error">
								<Zap className="size-3" />
								Urgent
							</Badge>
						)}
					</div>
					<CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-2 py-0 font-medium">
						<div className="flex items-center gap-1.5">
							<Calendar className="size-4 shrink-0" />
							{fmtShortDate(shift.date)}
						</div>
						<div className="flex items-center gap-1.5">
							<Clock className="size-4 shrink-0" />
							{shiftTimeLabel}
						</div>
						<Badge variant="success" className="shrink-0">
							{formatUsdPerHour(shift.ratePerHour)}
						</Badge>
					</CardDescription>
				</div>

				{shift.status !== "CANCELLED" &&
					shift.status !== "COMPLETED" &&
					!isExpired &&
					!(isMine && isInternalWorkforce) && (
						<CardAction>
							<Button
								size="sm"
								variant={actionVariant}
								className="w-full min-w-0 sm:w-auto"
								disabled={isActionLoading || (!isMine && isPast)}
								aria-busy={Boolean(isActionLoading)}
								onClick={handleAction}
							>
								{isActionLoading ? (
									<>
										<Loader2 className="size-4 animate-spin" aria-hidden />
										{actionLoadingLabel}
									</>
								) : (
									actionLabel
								)}
							</Button>
						</CardAction>
					)}
			</CardHeader>

			<CardContent className="space-y-4">
				<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
					<div className="space-y-1">
						<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
							Occupation
						</p>
						<div className="flex items-start gap-2">
							<Briefcase className="size-4 mt-1 text-muted-foreground" />
							<div>
								<p className="text-sm font-semibold text-foreground">
									{shift.occupation}
								</p>
								{shift.specialty && (
									<p className="text-xs text-muted-foreground">
										{shift.specialty}
									</p>
								)}
							</div>
						</div>
					</div>
					{shift.department && (
						<div className="space-y-1">
							<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
								Department
							</p>
							<div className="flex items-start gap-2">
								<Building2 className="size-4 mt-1 text-muted-foreground" />
								<p className="text-sm font-semibold text-foreground">
									{shift.department}
								</p>
							</div>
						</div>
					)}
					<div className="space-y-1">
						<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
							Location
						</p>
						<div className="flex items-start gap-2">
							<MapPin className="size-4 mt-1 text-muted-foreground" />
							<p className="text-sm font-semibold text-foreground">
								{shift.location}
							</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
