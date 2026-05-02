"use client";

import { formatCurrency } from "@repo/shared";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import type { SpendAnalyticsRow } from "@/services/billing.service";
import { fmtShortDate } from "@/utils/format";

const NUM = "px-2 text-right tabular-nums";
const TEXT = "min-w-0 max-w-[14rem] px-2 truncate";

export function useSpendAnalyticsListColumns() {
	return useMemo<ColumnDef<SpendAnalyticsRow>[]>(
		() => [
			{
				id: "period",
				header: "Period",
				cell: ({ row }) => (
					<div className={TEXT}>
						{fmtShortDate(row.original.periodStart)} –{" "}
						{fmtShortDate(row.original.periodEnd)}
					</div>
				),
			},
			{
				id: "periodType",
				header: "Type",
				accessorKey: "periodType",
				cell: ({ row }) => (
					<div className={TEXT}>{row.original.periodType}</div>
				),
			},
			{
				id: "department",
				header: "Department",
				cell: ({ row }) => (
					<div className={TEXT}>{row.original.department?.name ?? "—"}</div>
				),
			},
			{
				id: "vendor",
				header: "Vendor",
				cell: ({ row }) => (
					<div className={TEXT}>{row.original.vendor?.name ?? "—"}</div>
				),
			},
			{
				id: "project",
				header: "Project",
				cell: ({ row }) => (
					<div className={TEXT}>{row.original.project?.name ?? "—"}</div>
				),
			},
			{
				id: "totalSpend",
				header: () => <span className="block w-full text-right">Spend</span>,
				accessorKey: "totalSpend",
				cell: ({ row }) => (
					<div className={NUM}>{formatCurrency(row.original.totalSpend)}</div>
				),
			},
			{
				id: "totalHours",
				header: () => (
					<span className="block w-full text-right">Total hours</span>
				),
				accessorKey: "totalHours",
				cell: ({ row }) => (
					<div className={NUM}>
						{row.original.totalHours.toLocaleString(undefined, {
							maximumFractionDigits: 1,
						})}
					</div>
				),
			},
			{
				id: "placements",
				header: () => (
					<span className="block w-full text-right">Placements</span>
				),
				accessorKey: "activePlacements",
				cell: ({ row }) => (
					<div className={NUM}>{row.original.activePlacements}</div>
				),
			},
		],
		[],
	);
}
