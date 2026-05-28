"use client";

import { formatUsdPerHour } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { Separator } from "@repo/ui/components/separator";
import {
	Briefcase,
	Building2,
	Calendar,
	Clock,
	MapPin,
	Pencil,
} from "lucide-react";
import Link from "next/link";
import type { Shift } from "@/constants/shifts";
import { STATUS_BADGE_CLASS, STATUS_LABEL } from "@/constants/shifts";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import { DetailSection } from "./DetailSection";

interface ShiftDetailDialogProps {
	shift: Shift | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCancelShift: (shift: Shift) => void;
}

export function ShiftDetailDialog({
	shift,
	open,
	onOpenChange,
	onCancelShift,
}: Readonly<ShiftDetailDialogProps>) {
	const { fmtCalendarDate, fmtDateTime } = useUserTimezone();

	if (!shift) return null;

	const statusClass = STATUS_BADGE_CLASS[shift.status];
	const statusLabel = STATUS_LABEL[shift.status];
	const isCancellable =
		shift.status !== "COMPLETED" && shift.status !== "CANCELLED";
	const isEditable = shift.status === "OPEN" && !shift.claimedBy;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-xl">{shift.title}</DialogTitle>
					<div className="mt-1">
						<Badge className={statusClass}>{statusLabel}</Badge>
					</div>
				</DialogHeader>

				<div className="space-y-5 py-2">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<DetailSection label="Date & Time">
							<p className="font-medium text-sm">
								<span className="flex items-center gap-1.5">
									<Calendar className="text-muted-foreground size-4 shrink-0" />
									{fmtCalendarDate(shift.date, "long")}
								</span>
							</p>
							<p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium">
								<Clock className="text-muted-foreground size-4 shrink-0" />
								{shift.timeRange}
							</p>
						</DetailSection>

						<DetailSection label="Shift Rate">
							<p className="text-xl font-bold">
								{formatUsdPerHour(shift.ratePerHour)}
							</p>
						</DetailSection>
					</div>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<DetailSection label="Occupation">
							<p className="flex items-center gap-1.5 text-sm font-medium">
								<Briefcase className="text-muted-foreground size-4 shrink-0" />
								{shift.occupation}
							</p>
							<p className="text-muted-foreground text-xs">{shift.specialty}</p>
						</DetailSection>

						<DetailSection label="Department">
							<p className="flex items-center gap-1.5 text-sm font-medium">
								<Building2 className="text-muted-foreground size-4 shrink-0" />
								{shift.department}
							</p>
						</DetailSection>
					</div>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<DetailSection label="Location">
							<p className="flex items-center gap-1.5 text-sm font-medium">
								<MapPin className="text-muted-foreground size-4 shrink-0" />
								{shift.location}
							</p>
						</DetailSection>
					</div>
				</div>

				<Separator />

				<p className="text-muted-foreground text-xs">
					Created by {shift.createdBy} on {fmtDateTime(shift.createdAt)}
				</p>

				<DialogFooter className="flex-col gap-2 sm:flex-row">
					{isEditable && (
						<Button variant="outline" asChild>
							<Link href={`/org/shifts/${shift.id}/edit`}>
								<Pencil className="size-4" />
								Edit Shift
							</Link>
						</Button>
					)}
					{isCancellable && (
						<Button
							variant="outline"
							className="text-destructive hover:text-destructive border-destructive/40 hover:border-destructive"
							onClick={() => {
								onCancelShift(shift);
								onOpenChange(false);
							}}
						>
							Cancel Shift
						</Button>
					)}
					<Button onClick={() => onOpenChange(false)}>Close</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
