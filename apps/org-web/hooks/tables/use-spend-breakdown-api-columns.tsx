"use client";

import { formatCurrency } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import type { SpendAnalyticsRow } from "@/services/billing.service";

export function useSpendBreakdownApiColumns() {
	const { fmtShortDate } = useUserTimezone();
	return useMemo<ColumnDef<SpendAnalyticsRow>[]>(
		() => [
			{
				id: "period",
				header: "Period",
				cell: ({ row }) => (
					<span className="text-sm tabular-nums">
						{fmtShortDate(row.original.periodStart)} –{" "}
						{fmtShortDate(row.original.periodEnd)}
					</span>
				),
			},
			{
				id: "vendor",
				header: "Vendor",
				cell: ({ row }) => (
					<span className="max-w-[200px] truncate">
						{row.original.vendor?.name ?? "—"}
					</span>
				),
			},
			{
				id: "department",
				header: "Department",
				cell: ({ row }) => <span>{row.original.department?.name ?? "—"}</span>,
			},
			{
				id: "project",
				header: "Project",
				cell: ({ row }) => (
					<span className="max-w-[200px] truncate">
						{row.original.project?.name ?? "—"}
					</span>
				),
			},
			{
				id: "type",
				header: "Period type",
				cell: ({ row }) => (
					<Badge variant="inactive" className="font-normal">
						{row.original.periodType}
					</Badge>
				),
			},
			{
				id: "totalSpend",
				header: () => <span className="block w-full text-right">Spend</span>,
				accessorKey: "totalSpend",
				cell: ({ row }) => (
					<div className="text-right font-medium tabular-nums text-violet-700 dark:text-violet-300">
						{formatCurrency(row.original.totalSpend)}
					</div>
				),
			},
			{
				id: "hours",
				header: () => (
					<span className="block w-full text-right">Total hours</span>
				),
				accessorKey: "totalHours",
				cell: ({ row }) => (
					<div className="text-right tabular-nums">
						{row.original.totalHours.toLocaleString(undefined, {
							maximumFractionDigits: 0,
						})}
					</div>
				),
			},
		],
		[fmtShortDate],
	);
}
