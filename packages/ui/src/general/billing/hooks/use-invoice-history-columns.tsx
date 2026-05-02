"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@repo/ui/components/tooltip";
import type { ColumnDef } from "@tanstack/react-table";
import { Download, Eye, FileDown } from "lucide-react";
import { useMemo } from "react";
import { invoiceStatusVariants } from "../constants";
import type { InvoiceHistoryItem } from "../types";

export interface InvoiceHistoryColumnsParams {
	onViewInvoice: (invoice: InvoiceHistoryItem) => void;
	onDownloadPDF: (invoice: InvoiceHistoryItem) => void;
	onExportData: (invoice: InvoiceHistoryItem) => void;
}

export function useInvoiceHistoryColumns({
	onViewInvoice,
	onDownloadPDF,
	onExportData,
}: InvoiceHistoryColumnsParams) {
	const columns = useMemo<ColumnDef<InvoiceHistoryItem>[]>(
		() => [
			{
				id: "invoiceId",
				accessorKey: "id",
				header: "INVOICE ID",
				cell: ({ row }) => (
					<div className="flex flex-col space-y-0.5">
						<span className="text-sm font-medium text-foreground">
							{row.original.id}
						</span>
						<span className="text-muted-foreground text-xs font-medium">
							{row.original.lineItems} line items
							{row.original.grouping ? ` • ${row.original.grouping}` : ""}
						</span>
					</div>
				),
			},
			{
				id: "billingPeriod",
				accessorKey: "period",
				header: "BILLING PERIOD",
				cell: ({ row }) => (
					<div className="flex flex-col space-y-0.5">
						<span className="text-sm font-medium text-foreground">
							{row.original.period}
						</span>
						<span className="text-muted-foreground text-xs font-medium">
							Due: {row.original.dueDate}
						</span>
					</div>
				),
			},
			{
				id: "totalAmount",
				accessorKey: "amount",
				header: "TOTAL AMOUNT",
				cell: ({ row }) => (
					<span className="text-sm font-medium text-foreground">
						{row.original.amount}
					</span>
				),
			},
			{
				id: "status",
				accessorKey: "status",
				header: "STATUS",
				cell: ({ row }) => (
					<Badge variant={invoiceStatusVariants[row.original.status]}>
						{row.original.status}
					</Badge>
				),
			},
			{
				id: "actions",
				header: "ACTIONS",
				cell: ({ row }) => (
					<div className="flex items-center gap-1">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-muted-foreground hover:text-foreground"
									onClick={() => onViewInvoice(row.original)}
								>
									<Eye className="size-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>View Invoice</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-muted-foreground hover:text-foreground"
									onClick={() => onDownloadPDF(row.original)}
								>
									<Download className="size-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Download PDF</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-muted-foreground hover:text-foreground"
									onClick={() => onExportData(row.original)}
								>
									<FileDown className="size-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Export Data</TooltipContent>
						</Tooltip>
					</div>
				),
			},
		],
		[onViewInvoice, onDownloadPDF, onExportData],
	);

	return { columns };
}
