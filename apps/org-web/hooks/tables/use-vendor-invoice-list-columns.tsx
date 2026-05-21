"use client";

import { formatCurrency } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@repo/ui/components/tooltip";
import type { ColumnDef } from "@tanstack/react-table";
import { Calculator, Download } from "lucide-react";
import { useMemo } from "react";
import type {
	VendorInvoiceRow,
	VendorInvoiceStatus,
} from "@/types/vendor-invoices";

function statusBadgeVariant(
	status: VendorInvoiceStatus,
): "success" | "info" | "inactive" {
	if (status === "paid") return "success";
	if (status === "submitted") return "info";
	return "inactive";
}

function statusLabel(status: VendorInvoiceStatus): string {
	if (status === "paid") return "Paid";
	if (status === "submitted") return "Submitted";
	return "Draft";
}

export interface UseVendorInvoiceListColumnsOptions {
	onBreakdown: (row: VendorInvoiceRow) => void;
	onDownload: (row: VendorInvoiceRow) => void;
	downloadingInvoiceId?: string | null;
}

export function useVendorInvoiceListColumns({
	onBreakdown,
	onDownload,
	downloadingInvoiceId,
}: UseVendorInvoiceListColumnsOptions) {
	return useMemo<ColumnDef<VendorInvoiceRow>[]>(
		() => [
			{
				id: "invoiceId",
				header: "Invoice ID",
				accessorFn: (r) => r.invoiceId,
				cell: ({ row }) => (
					<div className="min-w-0 max-w-52 sm:max-w-60 lg:max-w-xs w-32">
						<p className="font-semibold text-sm">{row.original.invoiceId}</p>
						<p className="text-muted-foreground text-xs">
							Due: {row.original.dueDateLabel}
						</p>
					</div>
				),
			},
			{
				id: "organization",
				header: "Organization",
				accessorFn: (r) => r.organization,
				cell: ({ row }) => (
					<div className="max-w-52 truncate text-sm sm:max-w-60 lg:max-w-xs">
						{row.original.organization}
					</div>
				),
			},
			{
				id: "period",
				header: "Period",
				accessorFn: (r) => r.periodLabel,
				cell: ({ row }) => (
					<div className="whitespace-nowrap text-sm">
						{row.original.periodLabel}
					</div>
				),
			},
			{
				id: "hours",
				header: "Hours",
				accessorFn: (r) => r.hours,
				cell: ({ row }) => (
					<div className="tabular-nums text-sm">{row.original.hours}</div>
				),
			},
			{
				id: "grossAmount",
				header: "Gross Amount",
				accessorFn: (r) => r.grossAmount,
				cell: ({ row }) => (
					<div className="font-semibold tabular-nums text-sm">
						{formatCurrency(row.original.grossAmount)}
					</div>
				),
			},
			{
				id: "deductions",
				header: "Deductions",
				accessorFn: (r) => r.deductions,
				cell: ({ row }) => (
					<div className="font-medium text-red-700 tabular-nums text-sm dark:text-red-400">
						-{formatCurrency(row.original.deductions)}
					</div>
				),
			},
			{
				id: "finalAmount",
				header: "Final Amount",
				accessorFn: (r) => r.finalAmount,
				cell: ({ row }) => (
					<div className="font-medium text-emerald-700 tabular-nums text-sm dark:text-emerald-400">
						{formatCurrency(row.original.finalAmount)}
					</div>
				),
			},
			{
				id: "status",
				header: "Status",
				accessorFn: (r) => r.status,
				cell: ({ row }) => (
					<Badge variant={statusBadgeVariant(row.original.status)}>
						{statusLabel(row.original.status)}
					</Badge>
				),
			},
			{
				id: "actions",
				header: () => (
					<span className="flex w-full justify-end pr-1">Actions</span>
				),
				enableSorting: false,
				cell: ({ row }) => (
					<div className="flex justify-end gap-0.5 pr-0">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="text-primary size-9"
									aria-label="View calculation breakdown"
									onClick={() => {
										onBreakdown(row.original);
									}}
								>
									<Calculator className="size-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>View calculation breakdown</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="text-primary size-9"
									aria-label="Download invoice"
									disabled={downloadingInvoiceId === row.original.id}
									onClick={() => {
										onDownload(row.original);
									}}
								>
									<Download className="size-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Download invoice</TooltipContent>
						</Tooltip>
					</div>
				),
			},
		],
		[downloadingInvoiceId, onBreakdown, onDownload],
	);
}
