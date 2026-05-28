"use client";

import { formatUsdPerHour } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Separator } from "@repo/ui/components/separator";
import {
	AlertTriangle,
	Briefcase,
	Building2,
	Calendar,
	Clock,
	DollarSign,
	MapPin,
	MoreHorizontal,
	Pencil,
	User,
	X,
} from "lucide-react";
import Link from "next/link";
import type { Shift } from "@/constants/shifts";
import {
	SHIFT_TYPE_CLASS,
	SHIFT_TYPE_LABEL,
	STATUS_BADGE_CLASS,
	STATUS_LABEL,
} from "@/constants/shifts";
import { useUserTimezone } from "@/hooks/use-user-timezone";

interface ShiftCardProps {
	shift: Shift;
	onViewDetails: (shift: Shift) => void;
	onCancelShift: (shift: Shift) => void;
	showActionsMenu?: boolean;
	showBottomDetails?: boolean;
}

export function ShiftCard({
	shift,
	onViewDetails,
	onCancelShift,
	showActionsMenu = true,
	showBottomDetails = true,
}: Readonly<ShiftCardProps>) {
	const { fmtCalendarDate, fmtDateTime } = useUserTimezone();
	const statusClass = STATUS_BADGE_CLASS[shift.status];
	const statusLabel = STATUS_LABEL[shift.status];
	const shiftTypeClass = SHIFT_TYPE_CLASS[shift.shiftType];
	const shiftTypeLabel = SHIFT_TYPE_LABEL[shift.shiftType];

	return (
		<Card className="py-1 transition-shadow hover:shadow-sm">
			<CardContent className="p-5">
				<div className="flex items-start justify-between gap-3">
					<div className="flex flex-wrap items-center gap-2">
						<h3 className="font-semibold text-base">{shift.title}</h3>
						<Badge className={statusClass}>{statusLabel}</Badge>
						{shift.hasConflict && (
							<Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
								<AlertTriangle className="size-3" />
								Conflict
							</Badge>
						)}
					</div>

					{showActionsMenu ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="size-8 shrink-0"
									aria-label="Shift actions"
								>
									<MoreHorizontal className="size-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem
									className="cursor-pointer"
									onSelect={() => onViewDetails(shift)}
								>
									View Details
								</DropdownMenuItem>
								{shift.status === "OPEN" && !shift.claimedBy && (
									<DropdownMenuItem className="cursor-pointer" asChild>
										<Link href={`/org/shifts/${shift.id}/edit`}>
											<Pencil className="size-4" />
											Edit Shift
										</Link>
									</DropdownMenuItem>
								)}
								{shift.status !== "COMPLETED" &&
									shift.status !== "CANCELLED" && (
										<>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												className="cursor-pointer text-destructive focus:text-destructive"
												onSelect={() => onCancelShift(shift)}
											>
												<X className="size-4" />
												Cancel Shift
											</DropdownMenuItem>
										</>
									)}
							</DropdownMenuContent>
						</DropdownMenu>
					) : null}
				</div>

				<div className="mt-2 flex flex-wrap items-center gap-3 text-muted-foreground text-sm">
					<span className="flex items-center gap-1">
						<Calendar className="size-3.5" />
						{fmtCalendarDate(shift.date)}
					</span>
					<span className="flex items-center gap-1">
						<Clock className="size-3.5" />
						{shift.timeRange}
					</span>
					<span className="flex items-center gap-1">
						<DollarSign className="size-3.5" />
						{formatUsdPerHour(shift.ratePerHour)}
					</span>
				</div>

				<div className="mt-4 grid grid-cols-1 gap-y-3 sm:grid-cols-2 md:grid-cols-4">
					<div>
						<p className="text-muted-foreground text-xs">Occupation</p>
						<p className="mt-0.5 flex items-center gap-1 text-sm font-medium">
							<Briefcase className="text-muted-foreground size-3.5 shrink-0" />
							{shift.occupation}
						</p>
						<p className="text-muted-foreground text-xs">{shift.specialty}</p>
					</div>

					<div>
						<p className="text-muted-foreground text-xs">Department</p>
						<p className="mt-0.5 flex items-center gap-1 text-sm font-medium">
							<Building2 className="text-muted-foreground size-3.5 shrink-0" />
							{shift.department}
						</p>
					</div>

					<div>
						<p className="text-muted-foreground text-xs">Location</p>
						<p className="mt-0.5 flex items-center gap-1 text-sm font-medium">
							<MapPin className="text-muted-foreground size-3.5 shrink-0" />
							{shift.location}
						</p>
					</div>

					<div>
						<p className="text-muted-foreground text-xs">Claimed By</p>
						<p
							className={`mt-0.5 flex items-center gap-1 text-sm ${shift.claimedBy ? "font-medium" : "text-muted-foreground italic"}`}
						>
							<User className="text-muted-foreground size-3.5 shrink-0" />
							{shift.claimedBy ?? "Not claimed"}
						</p>
						{shift.claimedAt && (
							<p className="text-muted-foreground text-xs">
								{fmtDateTime(shift.claimedAt)}
							</p>
						)}
					</div>
				</div>

				{showBottomDetails ? (
					<>
						<Separator className="my-4" />

						<div className="grid grid-cols-1 gap-y-2 sm:grid-cols-2 md:grid-cols-4">
							<div>
								<p className="text-muted-foreground text-xs">Vendor Rate</p>
								<p className="mt-0.5 flex items-center gap-1 text-sm font-medium">
									<DollarSign className="text-muted-foreground size-3.5 shrink-0" />
									{shift.vendorRatePerHour}/hour
								</p>
							</div>

							<div>
								<p className="text-muted-foreground text-xs">Shift Type</p>
								<p
									className={`mt-0.5 flex items-center gap-1 text-sm font-medium ${shiftTypeClass}`}
								>
									<Clock className="size-3.5 shrink-0" />
									{shiftTypeLabel}
								</p>
							</div>

							<div>
								<p className="text-muted-foreground text-xs">
									Total Shift Hours
								</p>
								<p className="mt-0.5 flex items-center gap-1 text-sm font-medium">
									<Clock className="text-muted-foreground size-3.5 shrink-0" />
									{shift.totalHours} hours
								</p>
							</div>

							<div>
								<p className="text-muted-foreground text-xs">Total Cost</p>
								<p className="mt-0.5 flex items-center gap-1 text-sm font-medium">
									<DollarSign className="text-muted-foreground size-3.5 shrink-0" />
									{shift.totalCost.toFixed(2)}
								</p>
							</div>
						</div>
					</>
				) : null}

				{shift.hasConflict && shift.conflictReason && (
					<div className="mt-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950/30">
						<AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400" />
						<div>
							<p className="text-sm font-semibold text-red-700 dark:text-red-400">
								{shift.conflictReason}
							</p>
							<p className="text-xs text-red-600 dark:text-red-500">
								This shift may create back-to-back day and night shift
								assignments. Review claiming rules before approval.
							</p>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
