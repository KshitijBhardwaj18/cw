"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import {
	GRIEVANCE_STATUS_LABEL,
	GRIEVANCE_TYPE_LABEL,
	type GrievanceListRow,
	type GrievanceStatus,
	type GrievanceType,
} from "@/constants/grievances";
import { formatGrievanceDate } from "@/utils/grievances";

const COL = "max-w-[220px] min-w-0 px-2";

function typeBadgeVariant(type: GrievanceType): "warning" | "error" {
	return type === "BEHAVIORAL" ? "warning" : "error";
}

function statusBadgeVariant(
	status: GrievanceStatus,
): "warning" | "info" | "success" {
	if (status === "OPEN") return "warning";
	if (status === "IN_PROGRESS") return "info";
	return "success";
}

export function useGrievanceListColumns() {
	return useMemo<ColumnDef<GrievanceListRow>[]>(
		() => [
			{
				id: "type",
				header: "Grievance type",
				accessorFn: (r) => r.type,
				cell: ({ row }) => (
					<div className={COL}>
						<Badge variant={typeBadgeVariant(row.original.type)}>
							{GRIEVANCE_TYPE_LABEL[row.original.type]}
						</Badge>
					</div>
				),
			},
			{
				id: "workerName",
				header: "Worker name",
				accessorFn: (r) => r.workerName,
				cell: ({ row }) => (
					<div className={COL}>
						<p className="truncate font-medium text-sm">
							{row.original.workerName}
						</p>
					</div>
				),
			},
			{
				id: "placement",
				header: "Placement",
				accessorFn: (r) => r.placementLabel ?? "",
				cell: ({ row }) => (
					<div className={COL}>
						<p className="truncate text-sm">
							{row.original.placementLabel ?? "—"}
						</p>
					</div>
				),
			},
			{
				id: "status",
				header: "Status",
				accessorFn: (r) => r.status,
				cell: ({ row }) => (
					<div className={COL}>
						<Badge variant={statusBadgeVariant(row.original.status)}>
							{GRIEVANCE_STATUS_LABEL[row.original.status]}
						</Badge>
					</div>
				),
			},
			{
				id: "createdAt",
				header: "Created date",
				accessorFn: (r) => r.createdAt,
				cell: ({ row }) => (
					<div className={COL}>
						<span className="text-sm tabular-nums">
							{formatGrievanceDate(row.original.createdAt)}
						</span>
					</div>
				),
			},
			{
				id: "actions",
				header: () => (
					<span className="flex w-full justify-end pr-2">Action</span>
				),
				enableSorting: false,
				cell: ({ row }) => (
					<div className="flex justify-end pr-2">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="text-primary gap-1.5"
							asChild
						>
							<Link href={`/org/grievances/${row.original.id}`}>
								<Eye className="size-4 shrink-0" />
								View
							</Link>
						</Button>
					</div>
				),
			},
		],
		[],
	);
}
