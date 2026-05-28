"use client";

import { TimesheetEntryStatus } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import type { TimeApprovalEntry } from "@repo/ui/general/timekeeping/types";
import { cn } from "@repo/ui/lib/utils";
import { AlertTriangle, Calendar, Check, Clock, User } from "lucide-react";
import { TIMEKEEPING_POLICY_DEFAULTS } from "@/constants/timekeeping";
import { useUserTimezone } from "@/hooks/use-user-timezone";

interface TimeApprovalCardProps {
	entry: TimeApprovalEntry;
	onApprove: (entry: TimeApprovalEntry) => void;
	onDispute: (entry: TimeApprovalEntry) => void;
	className?: string;
	canMutateTimesheet?: boolean;
}

export function TimeApprovalCard({
	entry,
	onApprove,
	onDispute,
	className,
	canMutateTimesheet = true,
}: Readonly<TimeApprovalCardProps>) {
	const { fmtDateRange } = useUserTimezone();
	const {
		workerName,
		position,
		startDate,
		endDate,
		regularHours,
		overtimeHours,
		totalHours,
		status,
		pendingDays,
		isAutoApproved,
	} = entry;

	return (
		<Card
			className={cn(
				"overflow-hidden h-full flex flex-col justify-start transition-all duration-200 hover:shadow-sm border-border/60",
				isAutoApproved && "border-green-200",
				className,
			)}
		>
			<CardContent className="p-0 flex flex-col flex-1">
				{isAutoApproved && (
					<div className="flex items-center gap-2 bg-green-50 mb-4 mx-4 px-2 py-1.5 text-xs font-medium text-green-700 border border-green-100 rounded-lg">
						<Clock className="size-3.5" />
						<span>
							Auto-approved ({TIMEKEEPING_POLICY_DEFAULTS.autoApproveAfterDays}+
							days pending)
						</span>
					</div>
				)}

				<div className="px-4 flex flex-col flex-1 gap-4">
					<div className="flex items-start gap-3">
						<div className="rounded-full bg-muted flex items-center justify-center size-9 shrink-0 text-muted-foreground">
							<User className="size-4" />
						</div>
						<div className="min-w-0">
							<h4 className="text-sm font-semibold truncate leading-tight text-foreground">
								{workerName}
							</h4>
							<p className="text-muted-foreground text-sm truncate mt-0.5">
								{position}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2 text-muted-foreground">
						<Calendar className="size-3.5" />
						<span className="text-sm font-medium">
							{fmtDateRange(startDate, endDate)}
						</span>
					</div>

					<div className="grid grid-cols-1 gap-px bg-border/40 rounded-lg overflow-hidden border border-border/40 sm:grid-cols-2">
						<div className="bg-muted/10 p-2.5 space-y-0.5">
							<p className="text-muted-foreground text-xs font-semibold tracking-tight uppercase">
								Regular
							</p>
							<p className="text-sm font-semibold text-foreground">
								{regularHours}h
							</p>
						</div>
						<div className="bg-muted/10 p-2.5 space-y-0.5">
							<p className="text-muted-foreground text-xs font-semibold tracking-tight uppercase">
								Overtime
							</p>
							<p className="text-sm font-semibold text-orange-600">
								{overtimeHours}h
							</p>
						</div>
						<div className="col-span-1 bg-background p-2.5 flex items-center justify-between border-t border-border/40 sm:col-span-2">
							<p className="text-muted-foreground text-xs font-semibold uppercase tracking-tight">
								Total Hours
							</p>
							<p className="text-base font-semibold text-foreground">
								{totalHours}h
							</p>
						</div>
					</div>

					<div className="mt-auto pt-1 space-y-3">
						<div className="flex items-center justify-between">
							{status === TimesheetEntryStatus.PENDING && (
								<Badge
									variant="warning"
									className="rounded-full px-2.5 py-0.5 text-sm font-medium shadow-none bg-amber-50 text-amber-700 border-amber-100"
								>
									<Clock className="size-3.5 mr-1.5" />
									Pending ({pendingDays ?? 0} days)
								</Badge>
							)}
							{status === TimesheetEntryStatus.APPROVED && (
								<Badge
									variant="success"
									className="rounded-full px-2.5 py-0.5 text-sm font-medium shadow-none"
								>
									<Check className="size-3.5 mr-1.5" />
									Approved
								</Badge>
							)}
							{status === TimesheetEntryStatus.DISPUTED && (
								<Badge
									variant="error"
									className="rounded-full px-2.5 py-0.5 text-sm font-medium shadow-none"
								>
									<AlertTriangle className="size-3.5 mr-1.5" />
									Disputed
								</Badge>
							)}
						</div>

						{status === TimesheetEntryStatus.PENDING && canMutateTimesheet && (
							<div className="flex items-center gap-2">
								<Button
									variant="default"
									size="sm"
									onClick={() => onApprove(entry)}
									className="flex-1"
								>
									<Check className="size-4 mr-1.5" />
									Approve
								</Button>
								<Button
									variant="outline"
									size="sm"
									className="flex-1 border-destructive/20 text-destructive hover:bg-destructive/5 hover:border-destructive/30 hover:text-destructive transition-all"
									onClick={() => onDispute(entry)}
								>
									<AlertTriangle className="size-4 mr-1.5" />
									Dispute
								</Button>
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
