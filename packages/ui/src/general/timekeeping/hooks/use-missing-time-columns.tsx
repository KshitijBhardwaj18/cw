"use client";

import { formatDateOrPlaceholder } from "@repo/shared";
import { Badge, type BadgeVariants } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@repo/ui/components/tooltip";
import type { ColumnDef } from "@tanstack/react-table";
import { Bell, Eye } from "lucide-react";
import { useMemo } from "react";
import {
	TIMEKEEPING_POLICY_DEFAULTS,
	WORKER_TYPE_BADGE_VARIANT,
} from "../constants";
import type { MissingTimeEntry } from "../types";

export interface MissingTimeColumnsParams {
	onView: (log: MissingTimeEntry) => void;
	onRemind: (log: MissingTimeEntry) => void;
	deadlineDays?: number;
	enableRemind?: boolean;
}

const STATUS_BADGE_VARIANT: Record<string, BadgeVariants> = {
	Overdue: "error",
	Pending: "warning",
};

function formatMissingTimeCell(value: string): string {
	if (!value.trim()) {
		return "—";
	}
	if (value === "Never") {
		return "Never";
	}
	return formatDateOrPlaceholder(value, { placeholder: "—" });
}

export function useMissingTimeColumns({
	onView,
	onRemind,
	deadlineDays = TIMEKEEPING_POLICY_DEFAULTS.submissionDeadlineDays,
	enableRemind = true,
}: MissingTimeColumnsParams) {
	const columns = useMemo<ColumnDef<MissingTimeEntry>[]>(
		() => [
			{
				accessorKey: "status",
				header: "STATUS",
				cell: ({ row }) => (
					<Badge variant={STATUS_BADGE_VARIANT[row.original.status]}>
						{row.original.status}
					</Badge>
				),
			},
			{
				accessorKey: "workerName",
				header: "WORKER",
				cell: ({ row }) => (
					<div className="flex flex-col gap-1">
						<span className="text-foreground text-sm font-semibold">
							{row.original.workerName}
						</span>
						<Badge variant={WORKER_TYPE_BADGE_VARIANT[row.original.workerType]}>
							{row.original.workerType}
						</Badge>
					</div>
				),
			},
			{
				id: "location_dept",
				header: "LOCATION / DEPT",
				cell: ({ row }) => (
					<div className="flex flex-col">
						<span className="text-foreground text-sm font-medium">
							{row.original.location}
						</span>
						<span className="text-muted-foreground text-xs">
							{row.original.department}
						</span>
					</div>
				),
			},
			{
				accessorKey: "position",
				header: "POSITION",
				cell: ({ row }) => (
					<div className="text-muted-foreground text-sm">
						{row.original.position}
					</div>
				),
			},
			{
				accessorKey: "missingDates",
				header: "MISSING DATES",
				cell: ({ row }) => (
					<div className="flex flex-col gap-2">
						<div className="flex flex-wrap gap-1">
							{row.original.missingDates.map((date) => (
								<Badge key={date} variant="warning">
									{formatMissingTimeCell(date)}
								</Badge>
							))}
						</div>
						<span className="text-muted-foreground text-xs">
							{row.original.missingDates.length} days missing
						</span>
					</div>
				),
			},
			{
				accessorKey: "lastSubmitted",
				header: "LAST SUBMITTED",
				cell: ({ row }) => (
					<div className="text-muted-foreground text-sm">
						{formatMissingTimeCell(row.original.lastSubmitted)}
					</div>
				),
			},
			{
				accessorKey: "daysOverdue",
				header: "DAYS OVERDUE",
				cell: ({ row }) => {
					const days = row.original.daysOverdue;
					const isOverdue = days > deadlineDays;
					return (
						<div className="flex flex-col items-center justify-center gap-1">
							<Badge variant={isOverdue ? "error" : "warning"}>
								{days} {days === 1 ? "day" : "days"}
							</Badge>
							{isOverdue && (
								<span className="text-destructive text-xs font-medium transition-all">
									Exceeds {deadlineDays}d limit
								</span>
							)}
						</div>
					);
				},
			},
			{
				id: "actions",
				header: "ACTIONS",
				headerClassName: "text-right",
				cell: ({ row }) => (
					<div className="flex items-center justify-end gap-2">
						{enableRemind ? (
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="size-8 text-primary hover:bg-primary/5 hover:text-primary transition-all active:scale-95"
										onClick={() => onRemind(row.original)}
									>
										<Bell className="size-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>Send Reminder</TooltipContent>
							</Tooltip>
						) : null}
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="size-8 text-muted-foreground hover:text-foreground transition-all hover:bg-muted"
									onClick={() => onView(row.original)}
								>
									<Eye className="size-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>View Worker</TooltipContent>
						</Tooltip>
					</div>
				),
			},
		],
		[onView, onRemind, deadlineDays, enableRemind],
	);

	return { columns };
}
