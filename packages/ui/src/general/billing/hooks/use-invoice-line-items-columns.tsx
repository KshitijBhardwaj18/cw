"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import type { ColumnDef } from "@tanstack/react-table";
import { Flag } from "lucide-react";
import { useMemo } from "react";
import type { InvoiceLineItem } from "../types";

export interface InvoiceLineItemsColumnsParams {
	onFlagItem: (item: InvoiceLineItem) => void;
	formatCurrency: (amount: number) => string;
	flagActionEnabled?: boolean;
}

export function useInvoiceLineItemsColumns({
	onFlagItem,
	formatCurrency,
	flagActionEnabled = true,
}: InvoiceLineItemsColumnsParams) {
	const columns = useMemo<ColumnDef<InvoiceLineItem>[]>(
		() => [
			{
				id: "description",
				accessorKey: "description",
				header: "DESCRIPTION",
				cell: ({ row }) => (
					<div className="flex flex-col space-y-0.5">
						<span className="text-sm font-medium text-foreground">
							{row.original.description}
						</span>
						{row.original.lineType && (
							<Badge variant="secondary" className="w-fit text-xs">
								{row.original.lineType}
							</Badge>
						)}
					</div>
				),
			},
			{
				id: "quantity",
				accessorKey: "quantity",
				header: "QTY",
				cell: ({ row }) => (
					<span className="text-sm font-medium">{row.original.quantity}</span>
				),
			},
			{
				id: "unitPrice",
				accessorKey: "unitPrice",
				header: "UNIT PRICE",
				cell: ({ row }) => (
					<span className="text-sm font-medium">
						{formatCurrency(row.original.unitPrice)}
					</span>
				),
			},
			{
				id: "amount",
				accessorKey: "amount",
				header: "AMOUNT",
				cell: ({ row }) => (
					<span className="text-sm font-semibold text-foreground">
						{formatCurrency(row.original.amount)}
					</span>
				),
			},
			...(flagActionEnabled
				? [
						{
							id: "action",
							header: "ACTION",
							cell: ({ row }) => {
								const isDisputed = Boolean(row.original.isDisputed);
								return (
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 text-orange-500 hover:bg-orange-50 hover:text-orange-600 disabled:text-muted-foreground disabled:hover:bg-transparent"
										onClick={() => onFlagItem(row.original)}
										disabled={isDisputed}
										title={
											isDisputed ? "Already disputed" : "Dispute line item"
										}
									>
										<Flag className="size-4" />
									</Button>
								);
							},
						} satisfies ColumnDef<InvoiceLineItem>,
					]
				: []),
		],
		[onFlagItem, formatCurrency, flagActionEnabled],
	);

	return { columns };
}
