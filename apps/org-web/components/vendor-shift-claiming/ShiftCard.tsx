"use client";

import { shortId } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { DetailItem } from "@repo/ui/components/detail-item";
import { Calendar, MapPin, Pencil, Send } from "lucide-react";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import type { ClaimableShift } from "@/types/vendor-claim-shifts";
import { formatVendorShiftBoundaryTime } from "@/utils/time-entry";

interface ShiftCardProps {
	shift: ClaimableShift;
	onAction?: () => void;
	type: "available" | "assigned";
	/** Claim / Edit Timecard — hidden for Vendor View Only. Default true. */
	showPrimaryAction?: boolean;
}

export function ShiftCard({
	shift,
	onAction,
	type,
	showPrimaryAction = true,
}: Readonly<ShiftCardProps>) {
	const { fmtCalendarDate } = useUserTimezone();
	const isAvailable = type === "available";
	const dateLabel = fmtCalendarDate(shift.date);
	const clockLabel = `${formatVendorShiftBoundaryTime(shift.startTime)} – ${formatVendorShiftBoundaryTime(shift.endTime)}`;

	return (
		<Card>
			<CardHeader>
				<div className="min-w-0 space-y-3">
					<div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
						<CardTitle className="min-w-0 wrap-break-word text-lg">
							{shift.role}
						</CardTitle>
						<Badge
							variant={
								shift.urgency === "High"
									? "error"
									: shift.urgency === "Medium"
										? "warning"
										: "info"
							}
						>
							{shift.urgency} Urgency
						</Badge>
						<Badge variant="inactive" title={shift.id}>
							{shortId(shift.id)}
						</Badge>
					</div>
					<div className="text-muted-foreground flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-sm">
						<div className="flex min-w-0 max-w-full items-center gap-1">
							<MapPin className="size-4 shrink-0" />
							<span className="min-w-0 wrap-break-word">
								{shift.facilityName}
							</span>
						</div>
						<div className="flex min-w-0 max-w-full items-center gap-1">
							<MapPin className="size-4 shrink-0" />
							<span className="min-w-0 wrap-break-word">
								{shift.location.city}, {shift.location.state}
							</span>
						</div>
					</div>
				</div>
				<CardAction>
					{showPrimaryAction ? (
						<Button className="w-full min-w-0 sm:w-auto" onClick={onAction}>
							{isAvailable ? (
								<Send data-icon="inline-start" className="size-4" />
							) : (
								<Pencil data-icon="inline-start" className="size-4" />
							)}
							{isAvailable ? "Claim Shift" : "Edit Timecard"}
						</Button>
					) : null}
				</CardAction>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex flex-wrap gap-2">
					<span className="text-muted-foreground text-sm">Requirements:</span>
					{shift.requirements.map((req) => (
						<Badge key={req} variant="secondary">
							{req}
						</Badge>
					))}
				</div>
				<div className="border-t pt-4">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
						<DetailItem label="Date" value={dateLabel} icon={Calendar} />
						<DetailItem label="Shift Time" value={clockLabel} />
						<DetailItem label="Duration" value={shift.duration} />
						<DetailItem
							label="Bill Rate"
							value={shift.billRate}
							valueClassName="text-primary font-bold"
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
