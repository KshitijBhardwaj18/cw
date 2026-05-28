"use client";

import { formatDateRange, TimesheetEntryStatus } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2 } from "lucide-react";
import { useMemo } from "react";
import { PAY_CODE_BADGE_VARIANT } from "../constants";
import type { TimeLog, WorkerTimekeeping } from "../types";

export interface WorkerTimeLogColumnsParams {
	worker: WorkerTimekeeping;
	onApproveLog: (log: TimeLog, worker: WorkerTimekeeping) => void;
	onDisputeLog: (log: TimeLog, worker: WorkerTimekeeping) => void;
	approvalActionsEnabled?: boolean;
}

export function useWorkerTimeLogColumns({
	worker,
	onApproveLog,
	onDisputeLog,
	approvalActionsEnabled = true,
}: WorkerTimeLogColumnsParams) {
	const columns = useMemo<ColumnDef<TimeLog>[]>(
		() => [
			{
				id: "date",
				accessorKey: "startDate",
				header: "Date",
				cell: ({ row }) => (
					<span className="font-medium">
						{formatDateRange(row.original.startDate, row.original.endDate)}
					</span>
				),
			},
			{
				id: "payCode",
				accessorKey: "payCode",
				header: "Pay Code",
				cell: ({ row }) => (
					<Badge
						variant={PAY_CODE_BADGE_VARIANT[row.original.payCode] ?? "outline"}
					>
						{row.original.payCode}
					</Badge>
				),
			},
			{
				id: "startTime",
				accessorKey: "startTime",
				header: "Start Time",
				cell: ({ row }) => (
					<span className="text-muted-foreground">
						{row.original.startTime}
					</span>
				),
			},
			{
				id: "endTime",
				accessorKey: "endTime",
				header: "End Time",
				cell: ({ row }) => (
					<span className="text-muted-foreground">{row.original.endTime}</span>
				),
			},
			{
				id: "totalHours",
				accessorKey: "totalHours",
				header: "Total Hours",
				cell: ({ row }) => {
					const log = row.original;
					return (
						<div className="flex flex-col">
							<span className="font-medium">{log.totalHours}h</span>
							{log.approvalSource && (
								<span
									className={cn(
										"flex items-center gap-0.5 text-xs",
										log.approvalSource === "Auto"
											? "text-primary"
											: "text-green-600 dark:text-green-400",
									)}
								>
									<CheckCircle2 className="size-3" />
									{log.approvalSource}
								</span>
							)}
						</div>
					);
				},
			},
			{
				id: "note",
				accessorKey: "note",
				header: "Note",
				cell: ({ row }) => (
					<span className="text-muted-foreground italic">
						{row.original.note ? (
							<span className="text-foreground not-italic">
								{row.original.note}
							</span>
						) : (
							"-"
						)}
					</span>
				),
			},
			{
				id: "action",
				header: () => <div className="text-right">Action</div>,
				cell: ({ row }) => {
					const log = row.original;
					return (
						<div className="text-right">
							{log.status === TimesheetEntryStatus.APPROVED ? (
								<Badge variant="success">Approved</Badge>
							) : log.status === TimesheetEntryStatus.DISPUTED ? (
								<Badge variant="destructive">Disputed</Badge>
							) : approvalActionsEnabled ? (
								<div className="flex items-center justify-end gap-2">
									<Button
										type="button"
										variant="default"
										size="sm"
										className="h-auto p-1 px-2 text-sm"
										onClick={() => onApproveLog(log, worker)}
									>
										Approve
									</Button>
									<Button
										type="button"
										variant="outline"
										size="sm"
										className="text-destructive h-auto p-1 px-2 text-sm"
										onClick={() => onDisputeLog(log, worker)}
									>
										Dispute
									</Button>
								</div>
							) : (
								<span className="text-muted-foreground text-sm">—</span>
							)}
						</div>
					);
				},
			},
		],
		[worker, onApproveLog, onDisputeLog, approvalActionsEnabled],
	);

	return { columns };
}
