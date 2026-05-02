"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Calendar, Clock, DollarSign, MapPin, Users } from "lucide-react";
import type { ClaimableShift } from "@/types/vendor-claim-shifts";

export interface ShiftItemProps extends ClaimableShift {
	onClaim: () => void;
	/** When false, Claim Shift is hidden (Vendor View Only). Default true. */
	showClaimButton?: boolean;
}

export function ShiftItem(props: ShiftItemProps) {
	const {
		role,
		urgency,
		facilityName,
		location,
		requirements,
		date,
		duration,
		billRate,
		openings,
		startTime,
		endTime,
		onClaim,
		showClaimButton = true,
	} = props;
	const [organization, department] = facilityName
		.split("-")
		.map((value) => value.trim());
	const locationLine = [location.city, location.state]
		.filter(Boolean)
		.join(", ");

	return (
		<div className="space-y-6 border-b p-6 last:border-0">
			<div className="space-y-4">
				<div className="flex items-center gap-3">
					<h4 className="font-semibold">{role}</h4>
					<Badge variant={urgency === "High" ? "error" : "info"}>
						{urgency} priority
					</Badge>
				</div>

				<div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
					<div className="flex items-center gap-1.5">
						<MapPin className="size-4" />
						<span>
							{organization} {department ? `– ${department}` : ""}
						</span>
					</div>
					<div className="flex items-center gap-1.5">
						<MapPin className="size-4" />
						<span>{locationLine || "Location TBD"}</span>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<span className="text-sm font-medium text-muted-foreground mr-2">
						Requirements:
					</span>
					{requirements.map((req) => (
						<Badge key={req} variant="secondary">
							{req}
						</Badge>
					))}
				</div>
			</div>

			<div className="h-px w-full bg-border/40" />

			<div className="flex items-end justify-between">
				<div className="grid grid-cols-2 gap-x-12 gap-y-4 md:grid-cols-5 md:gap-x-16">
					<div className="flex flex-col gap-1.5">
						<div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
							<Calendar className="size-3.5" /> Date
						</div>
						<div className="text-sm font-semibold">{date}</div>
					</div>
					<div className="flex flex-col gap-1.5">
						<div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
							<Clock className="size-3.5" /> Shift Time
						</div>
						<div className="text-sm font-semibold">
							{startTime} - {endTime}
						</div>
					</div>
					<div className="flex flex-col gap-1.5">
						<div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
							<Clock className="size-3.5" /> Duration
						</div>
						<div className="text-sm font-semibold">{duration}</div>
					</div>
					<div className="flex flex-col gap-1.5">
						<div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
							<DollarSign className="size-3.5" /> Bill Rate
						</div>
						<div className="text-sm font-semibold text-emerald-600">
							{billRate}
						</div>
					</div>
					<div className="flex flex-col gap-1.5">
						<div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
							<Users className="size-3.5" /> Openings
						</div>
						<div className="text-sm font-semibold">{String(openings)}</div>
					</div>
				</div>

				{showClaimButton ? (
					<Button onClick={onClaim}>Claim Shift</Button>
				) : null}
			</div>
		</div>
	);
}
