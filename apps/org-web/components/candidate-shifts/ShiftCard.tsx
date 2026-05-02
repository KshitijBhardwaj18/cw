"use client";

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
import { format, parseISO } from "date-fns";
import {
	Briefcase,
	Building2,
	Calendar,
	Clock,
	Loader2,
	MapPin,
	Zap,
} from "lucide-react";
import type {
	CandidateShiftListItem,
	CandidateWorkerType,
} from "@/types/candidate-shifts";

interface ShiftCardProps {
	shift: CandidateShiftListItem;
	workerType: CandidateWorkerType;
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
	onAction,
	onClick,
	isActionLoading,
}: ShiftCardProps) {
	const isMine = shift.isClaimed || shift.status !== "OPEN";

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
			<CardHeader>
				<div className="flex items-center gap-2 flex-wrap">
					<CardTitle className="text-lg">{shift.title}</CardTitle>
					{shift.status === "IN_PROGRESS" && isMine && (
						<Badge variant="success">Claimed</Badge>
					)}
					{shift.status === "COMPLETED" && (
						<Badge variant="secondary">Completed</Badge>
					)}
					{shift.status === "OPEN" && !isMine && (
						<Badge variant="info">Open</Badge>
					)}
					{shift.isUrgent && (
						<Badge variant="error">
							<Zap className="size-3" />
							Urgent
						</Badge>
					)}
				</div>
				<CardDescription className="flex flex-wrap items-center gap-4 font-medium py-1">
					<div className="flex items-center gap-1.5">
						<Calendar className="size-4" />
						{format(parseISO(shift.date), "EEE, MMM d, yyyy")}
					</div>
					<div className="flex items-center gap-1.5">
						<Clock className="size-4" />
						{shift.startTime} – {shift.endTime}
					</div>
					<Badge variant="success">${shift.ratePerHour}/hr</Badge>
				</CardDescription>

				<CardAction>
					{shift.status !== "CANCELLED" && shift.status !== "COMPLETED" && (
						<Button
							size="sm"
							variant={actionVariant}
							disabled={isActionLoading}
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
					)}
				</CardAction>
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
