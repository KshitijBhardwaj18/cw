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
import type { ClaimableShift } from "@/types/vendor-claim-shifts";

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
}: ShiftCardProps) {
	const isAvailable = type === "available";

	return (
		<Card>
			<CardHeader>
				<div className="space-y-3">
					<div className="flex items-center gap-3">
						<CardTitle className="text-lg">{shift.role}</CardTitle>
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
						<Badge variant="inactive">{shift.id}</Badge>
					</div>
					<div className="text-muted-foreground flex items-center gap-4 text-sm">
						<div className="flex items-center gap-1">
							<MapPin className="size-4" />
							{shift.facilityName}
						</div>
						<div className="flex items-center gap-1">
							<MapPin className="size-4" />
							{shift.location.city}, {shift.location.state}
						</div>
					</div>
				</div>
				<CardAction>
					{showPrimaryAction ? (
						<Button onClick={onAction}>
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
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
						<DetailItem label="Date" value={shift.date} icon={Calendar} />
						<DetailItem
							label="Shift Time"
							value={`${shift.startTime} - ${shift.endTime}`}
						/>
						<DetailItem label="Duration" value={shift.duration} />
						<DetailItem
							label="Bill Rate"
							value={shift.billRate}
							valueClassName="text-primary font-bold"
						/>
						<DetailItem
							label="Openings"
							value={`${shift.openings} available`}
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
