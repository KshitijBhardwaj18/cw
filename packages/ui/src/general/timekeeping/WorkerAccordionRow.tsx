"use client";

import { TimesheetEntryStatus } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { cn } from "@repo/ui/lib/utils";
import { AlertTriangle, ChevronRight, Monitor, Smartphone } from "lucide-react";
import { useState } from "react";
import { TIMEKEEPING_POLICY_DEFAULTS } from "./constants";
import { useWorkerTimeLogColumns } from "./hooks/use-worker-time-log-columns";
import type { TimeLog, WorkerTimekeeping } from "./types";

interface WorkerAccordionRowProps {
	worker: WorkerTimekeeping;
	onApproveLog: (log: TimeLog, worker: WorkerTimekeeping) => void;
	onDisputeLog: (log: TimeLog, worker: WorkerTimekeeping) => void;
	approvalActionsEnabled?: boolean;
}

const STATUS_BADGE_VARIANT: Record<
	TimesheetEntryStatus,
	"warning" | "success" | "error" | "secondary"
> = {
	[TimesheetEntryStatus.PENDING]: "warning",
	[TimesheetEntryStatus.APPROVED]: "success",
	[TimesheetEntryStatus.DISPUTED]: "error",
	[TimesheetEntryStatus.REJECTED]: "secondary",
	[TimesheetEntryStatus.DRAFT]: "secondary",
};

const STATUS_LABEL: Record<TimesheetEntryStatus, string> = {
	[TimesheetEntryStatus.PENDING]: "Pending Approval",
	[TimesheetEntryStatus.APPROVED]: "Approved",
	[TimesheetEntryStatus.DISPUTED]: "Disputed",
	[TimesheetEntryStatus.REJECTED]: "Rejected",
	[TimesheetEntryStatus.DRAFT]: "Draft",
};

export function WorkerAccordionRow({
	worker,
	onApproveLog,
	onDisputeLog,
	approvalActionsEnabled = true,
}: Readonly<WorkerAccordionRowProps>) {
	const [isOpen, setIsOpen] = useState(false);

	const { columns } = useWorkerTimeLogColumns({
		worker,
		onApproveLog,
		onDisputeLog,
		approvalActionsEnabled,
	});

	const SourceIcon = worker.source === "MOBILE_APP" ? Smartphone : Monitor;
	const sourceLabel = worker.source === "MOBILE_APP" ? "Mobile" : "Upload";

	return (
		<div className="border-border/50 border-b last:border-b-0">
			<Button
				type="button"
				variant="ghost"
				onClick={() => setIsOpen((prev) => !prev)}
				className="h-auto w-full justify-start rounded-none py-3 px-4 text-left font-normal bg-muted/10"
			>
				<span className="w-14 shrink-0" />
				<ChevronRight
					className={cn(
						"text-muted-foreground mr-2 size-4 shrink-0 transition-transform",
						isOpen && "rotate-90",
					)}
				/>
				<span className="min-w-0 flex-1 text-sm font-medium">
					{worker.name}
				</span>
				<div className="ml-2 flex items-center gap-2">
					<Badge variant="secondary" className="gap-1">
						<SourceIcon className="size-3" />
						{sourceLabel}
					</Badge>
					<Badge variant={STATUS_BADGE_VARIANT[worker.status]}>
						{STATUS_LABEL[worker.status]}
					</Badge>
				</div>
				<div className="text-muted-foreground ml-4 hidden shrink-0 text-sm sm:flex sm:items-center sm:gap-4">
					<span>
						Regular:{" "}
						<span className="text-foreground font-medium">
							{worker.regularHours}h
						</span>
					</span>
					<span>
						OT:{" "}
						<span className="text-foreground font-medium">
							{worker.overtimeHours}h
						</span>
					</span>
					<span>
						Total:{" "}
						<span className="text-foreground font-semibold">
							{worker.totalHours}h
						</span>
					</span>
				</div>
			</Button>

			{isOpen && (
				<div className="bg-muted/10 border-border/30 border-t pl-20 pr-4 py-4">
					<p className="text-muted-foreground mb-3 text-xs font-medium">
						Position: {worker.position}
					</p>
					<div className="overflow-x-auto">
						<CustomTable
							data={worker.timeLogs}
							columns={columns}
							enableSorting={false}
							className="border-0 rounded-none bg-transparent shadow-none"
						/>
					</div>

					<div className="border-border/50 mt-3 flex justify-between border-t pt-3 text-sm font-semibold">
						<div className="flex items-center gap-2">
							<span>Worker Totals:</span>
						</div>
						<div className="text-muted-foreground flex gap-4 text-sm">
							<span>
								Regular:{" "}
								<span className="text-foreground font-medium">
									{worker.regularHours}h
								</span>
							</span>
							<span>
								OT:{" "}
								<span className="text-foreground font-medium">
									{worker.overtimeHours}h
								</span>
							</span>
							<span>
								Total:{" "}
								<span className="text-foreground font-semibold">
									{worker.totalHours}h
								</span>
							</span>
						</div>
					</div>

					<div className="mt-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-900/30 dark:bg-amber-900/10">
						<AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
						<p className="text-sm text-amber-800 dark:text-amber-400">
							<span className="font-medium">
								Dispute window:{" "}
								{TIMEKEEPING_POLICY_DEFAULTS.submissionDeadlineDays} days from
								submitted date
							</span>{" "}
							• Timecards will be auto-approved after this window expires
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
