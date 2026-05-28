"use client";

import { formatCurrency, shortId } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import type { ColumnDef } from "@tanstack/react-table";
import { X } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef } from "react";
import type { SpendBreakdownRow } from "@/constants/spend-analytics";

export type UseSpendBreakdownColumnsOptions = {
	onCancelRequest: (row: SpendBreakdownRow) => void;
	canCancel?: boolean;
};

export function useSpendBreakdownColumns(
	options: UseSpendBreakdownColumnsOptions,
): ColumnDef<SpendBreakdownRow>[] {
	const { onCancelRequest, canCancel = true } = options;
	const onCancelRequestRef = useRef(onCancelRequest);
	onCancelRequestRef.current = onCancelRequest;

	return useMemo(
		() => [
			{
				id: "requisitionId",
				header: "Requisition ID",
				accessorKey: "requisitionId",
				cell: ({ row }) => (
					<Link
						href={`/org/jobs/${row.original.requisitionId}`}
						className="text-left font-medium text-primary hover:underline text-wrap line-clamp-1"
						title={row.original.requisitionId}
					>
						{shortId(row.original.requisitionId)}
					</Link>
				),
			},
			{
				id: "requisitionName",
				header: "Requisition Name",
				accessorKey: "requisitionName",
				cell: ({ row }) => (
					<span className="max-w-[280px] truncate">
						{row.original.requisitionName}
					</span>
				),
			},
			{
				id: "department",
				header: "Department",
				accessorKey: "department",
			},
			{
				id: "costCenter",
				header: "Cost Center",
				accessorKey: "costCenter",
				cell: ({ row }) => (
					<Badge variant="inactive" className="font-mono">
						{row.original.costCenter}
					</Badge>
				),
			},
			{
				id: "type",
				header: "Type",
				accessorKey: "type",
				cell: ({ row }) =>
					row.original.type === "OPEN" ? (
						<Badge variant="violet">Open</Badge>
					) : (
						<Badge variant="warning">Committed</Badge>
					),
			},
			{
				id: "openSpend",
				header: "Open Spend",
				accessorKey: "openSpend",
				cell: ({ row }) =>
					row.original.openSpend != null ? (
						<span className="font-semibold text-violet-700 tabular-nums dark:text-violet-300">
							{formatCurrency(row.original.openSpend)}
						</span>
					) : (
						<span className="text-muted-foreground">—</span>
					),
			},
			{
				id: "committedSpend",
				header: "Committed Spend",
				accessorKey: "committedSpend",
				cell: ({ row }) =>
					row.original.committedSpend != null ? (
						<span className="font-semibold text-amber-800 tabular-nums dark:text-amber-300">
							{formatCurrency(row.original.committedSpend)}
						</span>
					) : (
						<span className="text-muted-foreground">—</span>
					),
			},
			{
				id: "actions",
				header: "Actions",
				enableSorting: false,
				cell: ({ row }) =>
					canCancel && row.original.type === "OPEN" ? (
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="border-destructive/40 text-destructive hover:bg-destructive/5"
							onClick={() => onCancelRequestRef.current(row.original)}
						>
							<X className="size-3.5" aria-hidden />
							Cancel
						</Button>
					) : (
						<span className="text-muted-foreground">—</span>
					),
			},
		],
		[canCancel],
	);
}
