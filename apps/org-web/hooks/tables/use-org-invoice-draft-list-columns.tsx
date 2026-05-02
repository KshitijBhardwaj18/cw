"use client";

import { formatCurrency } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import type { DbInvoiceStatus } from "@repo/ui/general/billing/types";
import { DB_TO_UI_STATUS } from "@repo/ui/general/billing/types";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo } from "react";
import type { OrgInvoiceListRow } from "@/services/billing.service";
import { fmtPeriod } from "@/utils/format";

const TEXT_WIDE = "min-w-0 max-w-[16rem] px-2";
const CURRENCY =
	"min-w-[6.5rem] max-w-[8.5rem] px-2 text-right tabular-nums whitespace-nowrap";
const NUM_COMPACT = "w-16 min-w-16 px-2 text-right tabular-nums";
const ACTIONS = "w-[6.75rem] min-w-[6.75rem] shrink-0 px-2";

function statusBadgeVariant(
	status: DbInvoiceStatus,
): "error" | "info" | "inactive" | "success" {
	if (status === "CANCELLED") return "inactive";
	if (status === "SUBMITTED") return "info";
	if (status === "PAID") return "success";
	if (status === "OVERDUE") return "error";
	return "inactive";
}

export function useOrgInvoiceDraftListColumns() {
	const projectLabel = useCallback((row: OrgInvoiceListRow): string => {
		const count = row.projectCount ?? 0;
		const name = row.projectName?.trim();
		if (!name && count <= 0) return "—";
		if (!name) return `${count} project${count === 1 ? "" : "s"}`;
		if (count <= 1) return name;
		return `${name} +${count - 1}`;
	}, []);

	return useMemo<ColumnDef<OrgInvoiceListRow>[]>(
		() => [
			{
				id: "invoiceNumber",
				header: "Invoice number",
				accessorFn: (r) => r.invoiceNumber,
				cell: ({ row }) => (
					<div className={TEXT_WIDE}>
						<p className="truncate font-mono text-sm">
							{row.original.invoiceNumber}
						</p>
					</div>
				),
			},
			{
				id: "vendor",
				header: "Vendor",
				accessorFn: (r) => r.vendor?.name ?? "",
				cell: ({ row }) => (
					<div className={TEXT_WIDE}>
						<p className="truncate text-sm">
							{row.original.vendor?.name ?? "—"}
						</p>
					</div>
				),
			},
			{
				id: "project",
				header: "Project",
				accessorFn: (r) => projectLabel(r),
				cell: ({ row }) => {
					const label = projectLabel(row.original);
					if (label === "—") {
						return <span className="text-muted-foreground text-sm">—</span>;
					}
					return (
						<Badge variant="info" className="max-w-full truncate font-normal">
							{label}
						</Badge>
					);
				},
			},
			{
				id: "period",
				header: "Period",
				accessorFn: (r) =>
					fmtPeriod(
						r.periodStartDate ?? undefined,
						r.periodEndDate ?? undefined,
					),
				cell: ({ row }) => (
					<div className={TEXT_WIDE}>
						<span className="text-sm tabular-nums">
							{fmtPeriod(
								row.original.periodStartDate ?? undefined,
								row.original.periodEndDate ?? undefined,
							)}
						</span>
					</div>
				),
			},
			{
				id: "workers",
				header: () => <span className="block w-full text-right">Workers</span>,
				accessorFn: (r) => r.workersCount ?? 0,
				cell: ({ row }) => (
					<div className={NUM_COMPACT}>{row.original.workersCount ?? 0}</div>
				),
			},
			{
				id: "lineItems",
				header: "Line items",
				accessorFn: (r) => r.lineItemCount,
				cell: ({ row }) => (
					<div className="text-right tabular-nums">
						{row.original.lineItemCount}
					</div>
				),
			},
			{
				id: "totalHours",
				header: () => (
					<span className="block w-full text-right">Total hours</span>
				),
				accessorFn: (r) => r.totalHours ?? 0,
				cell: ({ row }) => (
					<div className={NUM_COMPACT}>
						{Math.round(row.original.totalHours ?? 0)}
					</div>
				),
			},
			{
				id: "totalAmount",
				header: () => (
					<span className="block w-full text-right">Total amount</span>
				),
				accessorFn: (r) => r.totalAmount,
				cell: ({ row }) => (
					<div className={CURRENCY}>
						<span className="tabular-nums">
							{formatCurrency(row.original.totalAmount)}
						</span>
					</div>
				),
			},
			{
				id: "disputed",
				header: () => <span className="block w-full text-right">Disputed</span>,
				accessorFn: (r) => r.disputedAmount ?? 0,
				cell: ({ row }) => {
					const amt = row.original.disputedAmount ?? 0;
					return (
						<div className={CURRENCY}>
							{amt > 0 ? (
								<span className="font-medium text-red-600 tabular-nums dark:text-red-400">
									{formatCurrency(amt)}
								</span>
							) : (
								<span className="text-muted-foreground">—</span>
							)}
						</div>
					);
				},
			},
			{
				id: "status",
				header: "Status",
				accessorFn: (r) => r.status,
				cell: ({ row }) => {
					const s = row.original.status as DbInvoiceStatus;
					const label = DB_TO_UI_STATUS[s] ?? s;
					return (
						<Badge variant={statusBadgeVariant(s)} className="max-w-full">
							{label}
						</Badge>
					);
				},
			},
			{
				id: "actions",
				header: () => (
					<span className="flex w-full justify-end pr-2">Actions</span>
				),
				enableSorting: false,
				cell: ({ row }) => (
					<div className={`flex justify-end ${ACTIONS}`}>
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="gap-1.5"
							asChild
						>
							<Link href={`/org/invoice-drafts/${row.original.id}`}>
								<Eye className="size-4 shrink-0" />
								View
							</Link>
						</Button>
					</div>
				),
			},
		],
		[projectLabel],
	);
}
