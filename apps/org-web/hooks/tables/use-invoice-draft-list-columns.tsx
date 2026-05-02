"use client";

import { formatCurrency } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo } from "react";
import {
	INVOICE_DRAFT_STATUS_LABEL,
	type InvoiceDraftStatus,
} from "@/constants/invoice-drafts";
import type { OrgInvoiceListRow } from "@/services/billing.service";
import { fmtPeriod } from "@/utils/format";

const TEXT_WIDE = "min-w-0 max-w-[16rem] px-2";
const BADGE = "min-w-0 px-2";
const PERIOD = "min-w-0 w-[10rem] max-w-[15rem] px-2";
const NUM_COMPACT = "w-14 min-w-14 px-2 text-right tabular-nums";
const LINE_ITEMS = "min-w-0 max-w-[10rem] px-2";
const CURRENCY =
	"min-w-[6.5rem] max-w-[8.5rem] px-2 text-right tabular-nums whitespace-nowrap";
const STATUS = "min-w-0 w-[9rem] max-w-[11rem] px-2";
const ACTIONS = "w-[6.75rem] min-w-[6.75rem] shrink-0 px-2";

function statusBadgeVariant(
	status: InvoiceDraftStatus,
): "error" | "info" | "inactive" {
	if (status === "PARTIALLY_DISPUTED") return "error";
	if (status === "READY_FOR_REVIEW") return "info";
	return "inactive";
}

export function useInvoiceDraftListColumns() {
	const projectLabel = useCallback((row: OrgInvoiceListRow): string => {
		const count = row.projectCount ?? 0;
		const name = row.projectName?.trim();
		if (!name && count <= 0) return "—";
		if (!name) return `${count} project${count === 1 ? "" : "s"}`;
		if (count <= 1) return name;
		return `${name} +${count - 1}`;
	}, []);

	const uiStatus = useCallback(
		(row: OrgInvoiceListRow): InvoiceDraftStatus =>
			(row.disputedAmount ?? 0) > 0 ? "PARTIALLY_DISPUTED" : "READY_FOR_REVIEW",
		[],
	);

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
						<p className="truncate font-medium text-sm">
							{row.original.vendor?.name ?? "—"}
						</p>
					</div>
				),
			},
			{
				id: "project",
				header: "Project",
				accessorFn: (r) => projectLabel(r),
				cell: ({ row }) => (
					<div className={BADGE}>
						<Badge variant="info" className="max-w-full truncate font-normal">
							{projectLabel(row.original)}
						</Badge>
					</div>
				),
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
					<div className={PERIOD}>
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
					<div className={NUM_COMPACT}>
						<span className="tabular-nums">
							{row.original.workersCount ?? 0}
						</span>
					</div>
				),
			},
			{
				id: "lineItems",
				header: "Line items",
				accessorFn: (r) => r.lineItemCount,
				cell: ({ row }) => {
					const lineItemCount = row.original.lineItemCount ?? 0;
					const disputedLineItemCount = row.original.disputedLineItemCount ?? 0;
					return (
						<div className={LINE_ITEMS}>
							<div className="flex flex-wrap items-center gap-1.5">
								<span className="tabular-nums">{lineItemCount}</span>
								{disputedLineItemCount > 0 ? (
									<Badge variant="error" className="text-[10px] font-medium">
										{disputedLineItemCount} disputed
									</Badge>
								) : null}
							</div>
						</div>
					);
				},
			},
			{
				id: "totalHours",
				header: () => (
					<span className="block w-full text-right">Total hours</span>
				),
				accessorFn: (r) => Math.round(r.totalHours ?? 0),
				cell: ({ row }) => (
					<div className={NUM_COMPACT}>
						<span className="tabular-nums">
							{Math.round(row.original.totalHours ?? 0)}
						</span>
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
				accessorFn: (r) => uiStatus(r),
				cell: ({ row }) => (
					<div className={STATUS}>
						<Badge
							variant={statusBadgeVariant(uiStatus(row.original))}
							className="max-w-full whitespace-normal text-left"
						>
							{INVOICE_DRAFT_STATUS_LABEL[uiStatus(row.original)]}
						</Badge>
					</div>
				),
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
								Review
							</Link>
						</Button>
					</div>
				),
			},
		],
		[projectLabel, uiStatus],
	);
}
