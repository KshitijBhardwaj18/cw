"use client";

import { formatDate } from "@repo/shared";
import { Badge, type BadgeVariants } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@repo/ui/components/tooltip";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, FileText, XCircle } from "lucide-react";
import { useMemo } from "react";
import type { DisputeLogEntry } from "../types";

export interface DisputeLogColumnsParams {
	onResolve: (log: DisputeLogEntry) => void;
	onReject: (log: DisputeLogEntry) => void;
	onView: (log: DisputeLogEntry) => void;
	canMutateDisputes?: boolean;
}

export function useDisputeLogColumns({
	onResolve,
	onReject,
	onView,
	canMutateDisputes = true,
}: DisputeLogColumnsParams) {
	const columns = useMemo<ColumnDef<DisputeLogEntry>[]>(
		() => [
			{
				accessorKey: "workerName",
				header: "WORKER",
				cell: ({ row }) => (
					<div className="text-sm font-medium text-foreground">
						{row.original.workerName}
					</div>
				),
			},
			{
				accessorKey: "date",
				header: "DATE",
				cell: ({ row }) => (
					<div className="text-sm text-muted-foreground">
						{formatDate(row.original.date)}
					</div>
				),
			},
			{
				accessorKey: "payCode",
				header: "PAY CODE",
				cell: ({ row }) => {
					const code = row.original.payCode;
					const isOT = code === "OT" || code === "Double Time";
					return <Badge variant={isOT ? "info" : "secondary"}>{code}</Badge>;
				},
			},
			{
				accessorKey: "hours",
				header: "HOURS",
				cell: ({ row }) => (
					<div className="text-sm text-foreground">{row.original.hours}</div>
				),
			},
			{
				accessorKey: "disputeReason",
				header: "DISPUTE REASON",
				cell: ({ row }) => (
					<div className="flex max-w-[300px] flex-col gap-1">
						<span className="text-sm text-foreground">
							{row.original.disputeReason}
						</span>
						{row.original.resolution && (
							<span className="text-xs italic text-muted-foreground">
								Resolution: {row.original.resolution}
							</span>
						)}
					</div>
				),
			},
			{
				accessorKey: "submittedBy",
				header: "SUBMITTED BY",
				cell: ({ row }) => {
					const submitter = row.original.submittedBy;
					return (
						<div className="flex flex-col">
							<span className="text-sm text-foreground">{submitter.name}</span>
							<span className="mt-0.5 text-xs text-muted-foreground">
								({submitter.role})
							</span>
							<span className="mt-0.5 text-xs text-muted-foreground">
								{formatDate(submitter.timestamp, "PPp")}
							</span>
							{row.original.resolvedAt && (
								<span className="mt-0.5 text-xs text-muted-foreground">
									Resolved: {formatDate(row.original.resolvedAt, "PPp")}
								</span>
							)}
						</div>
					);
				},
			},
			{
				accessorKey: "status",
				header: "STATUS",
				cell: ({ row }) => {
					const status = row.original.status;
					const statusStyles: Record<string, BadgeVariants> = {
						Open: "error",
						Resolved: "success",
						Rejected: "secondary",
					};

					return <Badge variant={statusStyles[status]}>{status}</Badge>;
				},
			},
			{
				id: "actions",
				header: "ACTIONS",
				headerClassName: "text-right",
				cell: ({ row }) => {
					if (row.original.status !== "Open") {
						return (
							<div className="flex items-center justify-end">
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="size-8 text-muted-foreground hover:text-foreground"
											onClick={() => onView(row.original)}
										>
											<FileText className="size-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>View details</TooltipContent>
								</Tooltip>
							</div>
						);
					}

					if (!canMutateDisputes) {
						return (
							<div className="flex items-center justify-end">
								<span className="text-muted-foreground text-sm">—</span>
							</div>
						);
					}

					return (
						<div className="flex items-center justify-end gap-2">
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="size-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
										onClick={() => onResolve(row.original)}
									>
										<CheckCircle2 className="size-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>Resolve Dispute</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
										onClick={() => onReject(row.original)}
									>
										<XCircle className="size-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>Reject Dispute</TooltipContent>
							</Tooltip>
						</div>
					);
				},
			},
		],
		[onReject, onResolve, onView, canMutateDisputes],
	);

	return { columns };
}
