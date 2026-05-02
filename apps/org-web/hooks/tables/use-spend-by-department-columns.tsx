"use client";

import { formatCurrency } from "@repo/shared";
import type { ColumnDef } from "@tanstack/react-table";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import type { DepartmentSpendRow } from "@/utils/spend-analytics-aggregations";

export function useSpendByDepartmentColumns() {
	return useMemo<ColumnDef<DepartmentSpendRow>[]>(
		() => [
			{
				id: "departmentLabel",
				header: "Department",
				accessorKey: "departmentLabel",
				cell: ({ row }) => (
					<span className="max-w-[280px] font-medium">
						{row.original.departmentLabel}
					</span>
				),
			},
			{
				id: "totalSpend",
				header: "Spend",
				accessorKey: "totalSpend",
				cell: ({ row }) => (
					<span className="font-semibold text-primary tabular-nums dark:text-emerald-300">
						{formatCurrency(row.original.totalSpend)}
					</span>
				),
			},
			{
				id: "pctOfTotal",
				header: "% of total spend",
				accessorKey: "pctOfTotal",
				cell: ({ row }) => (
					<span className="tabular-nums">
						{row.original.pctOfTotal.toFixed(1)}%
					</span>
				),
			},
			{
				id: "trend",
				header: "Share",
				accessorKey: "pctOfTotal",
				cell: ({ row }) =>
					row.original.pctOfTotal >= 25 ? (
						<span className="inline-flex items-center gap-1.5 font-medium text-amber-800 dark:text-amber-300">
							<TrendingUp className="size-4 shrink-0" aria-hidden />
							High share
						</span>
					) : (
						<span className="text-muted-foreground inline-flex items-center gap-1.5 font-medium">
							<TrendingDown className="size-4 shrink-0" aria-hidden />
							Lower share
						</span>
					),
			},
		],
		[],
	);
}
