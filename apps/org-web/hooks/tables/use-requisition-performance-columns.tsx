"use client";

import { enumToTitleText, shortId } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import type { RequisitionPerformanceTableItem } from "@/types/command-center";

export interface RequisitionPerformanceColumnsCallbacks {
	onViewDetails: (item: RequisitionPerformanceTableItem) => void;
}

export const useRequisitionPerformanceColumns = ({
	onViewDetails,
}: RequisitionPerformanceColumnsCallbacks) => {
	const columns = useMemo<ColumnDef<RequisitionPerformanceTableItem>[]>(
		() => [
			{
				accessorKey: "requisitionId",
				header: "Requisition ID",
				cell: ({ row }) => (
					<span
						className="text-primary font-medium"
						title={row.original.requisitionId}
					>
						{shortId(row.original.requisitionId)}
					</span>
				),
			},
			{
				accessorKey: "requisitionName",
				header: "Requisition Name",
			},
			{
				accessorKey: "checklistItem",
				header: "Checklist Item",
				cell: ({ row }) => (
					<span className="text-muted-foreground">
						{row.original.checklistItem}
					</span>
				),
			},
			{
				accessorKey: "daysOpen",
				header: "Days Open",
				cell: ({ row }) => (
					<Badge
						variant="secondary"
						className="rounded-none bg-red-100 text-red-700"
					>
						{row.original.daysOpen}
					</Badge>
				),
			},
			{
				accessorKey: "submissions",
				header: "Submissions",
				cell: ({ row }) => (
					<Badge
						variant="secondary"
						className="rounded-none bg-amber-100 text-amber-700"
					>
						{row.original.submissions}
					</Badge>
				),
			},
			{
				accessorKey: "status",
				header: "Status",
				cell: ({ row }) =>
					row.original.status ? enumToTitleText(row.original.status) : "—",
			},
			{
				id: "actions",
				header: "Actions",
				cell: ({ row }) => (
					<Button size="sm" onClick={() => onViewDetails(row.original)}>
						View Details
					</Button>
				),
			},
		],
		[onViewDetails],
	);

	return { columns };
};
