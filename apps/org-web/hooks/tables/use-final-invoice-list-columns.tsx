"use client";

import { formatCurrency } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import type { ColumnDef } from "@tanstack/react-table";
import {
	CheckCircle2,
	Clock,
	Download,
	Eye,
	Send,
	XCircle,
} from "lucide-react";
import { useMemo } from "react";
import { FINAL_INVOICE_STATUS_LABEL } from "@/constants/final-invoices";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import type {
	FinalInvoiceListRow,
	FinalInvoiceStatus,
} from "@/services/billing.service";

const TEXT = "min-w-0 max-w-[14rem] px-2";
const PERIOD = "min-w-0 w-[10rem] max-w-[15rem] px-2";
const DATE = "min-w-0 w-[7.5rem] px-2 tabular-nums";
const CURRENCY =
	"min-w-[6.5rem] max-w-[8.5rem] px-2 text-right tabular-nums whitespace-nowrap font-semibold";
const STATUS = "min-w-0 w-[12rem] max-w-[14rem] px-2";
const ACTIONS = "min-w-[18rem] px-2";

function statusBadgeVariant(
	status: FinalInvoiceStatus,
): "error" | "info" | "success" {
	if (status === "OVERDUE") return "error";
	if (status === "PENDING_PAYMENT") return "info";
	return "success";
}

export type FinalInvoiceListColumnHandlers = {
	onView: (row: FinalInvoiceListRow) => void;
	onRoute: (row: FinalInvoiceListRow) => void;
	onDownload: (row: FinalInvoiceListRow) => void;
	canRoute?: boolean;
};

export function useFinalInvoiceListColumns(
	handlers: FinalInvoiceListColumnHandlers,
) {
	const { onView, onRoute, onDownload, canRoute = true } = handlers;
	const { fmtShortDate, fmtDateRange } = useUserTimezone();

	return useMemo<ColumnDef<FinalInvoiceListRow>[]>(
		() => [
			{
				id: "invoiceNumber",
				header: "Invoice number",
				accessorFn: (r) => r.invoiceNumber,
				cell: ({ row }) => (
					<div className={TEXT}>
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
					<div className={TEXT}>
						<p className="truncate font-medium text-sm">
							{row.original.vendor?.name ?? "Unassigned"}
						</p>
					</div>
				),
			},
			{
				id: "period",
				header: "Period",
				accessorFn: (r) =>
					`${r.periodStartDate ?? ""}|${r.periodEndDate ?? ""}`,
				cell: ({ row }) => (
					<div className={PERIOD}>
						<span className="text-sm tabular-nums">
							{row.original.periodStartDate && row.original.periodEndDate
								? fmtDateRange(
										row.original.periodStartDate,
										row.original.periodEndDate,
									)
								: "—"}
						</span>
					</div>
				),
			},
			{
				id: "issueDate",
				header: "Issue date",
				accessorFn: (r) => r.invoiceDate,
				cell: ({ row }) => (
					<div className={DATE}>
						<span className="text-sm">
							{fmtShortDate(row.original.invoiceDate)}
						</span>
					</div>
				),
			},
			{
				id: "dueDate",
				header: "Due date",
				accessorFn: (r) => r.dueDate,
				cell: ({ row }) => (
					<div className={DATE}>
						<span className="text-sm">
							{fmtShortDate(row.original.dueDate)}
						</span>
					</div>
				),
			},
			{
				id: "amount",
				header: () => <span className="block w-full text-right">Amount</span>,
				accessorFn: (r) => r.totalAmount,
				cell: ({ row }) => (
					<div className={CURRENCY}>
						{formatCurrency(row.original.totalAmount)}
					</div>
				),
			},
			{
				id: "status",
				header: "Status",
				accessorFn: (r) => r.finalStatus,
				cell: ({ row }) => {
					const { finalStatus } = row.original;
					const variant = statusBadgeVariant(finalStatus);
					const icon =
						finalStatus === "PAID" ? (
							<CheckCircle2 className="size-3" />
						) : finalStatus === "PENDING_PAYMENT" ? (
							<Clock className="size-3" />
						) : (
							<XCircle className="size-3" />
						);
					const label = FINAL_INVOICE_STATUS_LABEL[finalStatus];
					return (
						<div className={STATUS}>
							<div className="flex flex-col gap-0.5">
								<Badge variant={variant} className="w-fit gap-1 font-normal">
									{icon}
									{label}
								</Badge>
							</div>
						</div>
					);
				},
			},
			{
				id: "actions",
				header: "Actions",
				enableSorting: false,
				cell: ({ row }) => (
					<div className={`${ACTIONS} flex flex-wrap gap-1`}>
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="gap-1"
							onClick={() => onView(row.original)}
						>
							<Eye className="size-3.5" />
							View
						</Button>
						{canRoute ? (
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="gap-1"
								onClick={() => onRoute(row.original)}
							>
								<Send className="size-3.5" />
								Route
							</Button>
						) : null}
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="gap-1"
							onClick={() => onDownload(row.original)}
						>
							<Download className="size-3.5" />
							Download
						</Button>
					</div>
				),
			},
		],
		[onView, onRoute, onDownload, canRoute, fmtShortDate, fmtDateRange],
	);
}
