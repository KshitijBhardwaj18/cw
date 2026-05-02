"use client";

import { formatCurrency } from "@repo/shared";
import type { ColumnDef } from "@tanstack/react-table";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import type { SavingsByCostCenterRow } from "@/constants/spend-analytics";

export type UseSavingsAnalysisColumnsOptions = {
	/** Denominator for "% of total savings" (e.g. organization YTD total). */
	pctDenominator: number;
};

export function useSavingsAnalysisColumns(
	options: UseSavingsAnalysisColumnsOptions,
): ColumnDef<SavingsByCostCenterRow>[] {
	const { pctDenominator } = options;

	return useMemo(
		() => [
			{
				id: "costCenterLabel",
				header: "Cost Center",
				accessorKey: "costCenterLabel",
				cell: ({ row }) => (
					<span className="max-w-[280px]">{row.original.costCenterLabel}</span>
				),
			},
			{
				id: "savingsAmount",
				header: "Savings Amount",
				accessorKey: "savingsAmount",
				cell: ({ row }) => (
					<span className="font-semibold text-emerald-700 tabular-nums dark:text-emerald-300">
						{formatCurrency(row.original.savingsAmount)}
					</span>
				),
			},
			{
				id: "pctOfTotal",
				header: "% of Total Savings",
				accessorFn: (row) =>
					pctDenominator > 0 ? (row.savingsAmount / pctDenominator) * 100 : 0,
				cell: ({ row }) => {
					const pct = row.getValue<number>("pctOfTotal");
					return <span className="tabular-nums">{pct.toFixed(1)}%</span>;
				},
			},
			{
				id: "trend",
				header: "Trend",
				accessorKey: "trend",
				cell: ({ row }) =>
					row.original.trend === "high-impact" ? (
						<span className="inline-flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-300">
							<TrendingUp className="size-4 shrink-0" aria-hidden />
							High Impact
						</span>
					) : (
						<span className="text-muted-foreground inline-flex items-center gap-1.5 font-medium">
							<TrendingDown className="size-4 shrink-0" aria-hidden />
							Moderate
						</span>
					),
			},
		],
		[pctDenominator],
	);
}
