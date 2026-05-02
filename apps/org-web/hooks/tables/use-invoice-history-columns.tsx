"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { invoiceStatusVariants } from "@repo/ui/general/billing/constants";
import type { InvoiceHistoryItem } from "@repo/ui/general/billing/types";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { useMemo } from "react";

export interface InvoiceHistoryColumnsParams {
	onViewInvoice: (invoice: InvoiceHistoryItem) => void;
}

export function useInvoiceHistoryColumns({
	onViewInvoice,
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
				),
			},
		],
		[onViewInvoice],
	);

	return { columns };
}
