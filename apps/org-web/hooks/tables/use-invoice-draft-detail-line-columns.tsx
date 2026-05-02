"use client";

import { formatCurrency } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import type { ColumnDef } from "@tanstack/react-table";
import { FileText, X } from "lucide-react";
import { useMemo } from "react";
import type { InvoiceDraftDetailLineItem } from "@/constants/invoice-draft-detail";

export function useInvoiceDraftDetailLineColumns({
	canDispute = true,
	onDispute,
	onViewDispute,
}: {
	canDispute?: boolean;
	onDispute?: (line: InvoiceDraftDetailLineItem) => void;
	onViewDispute?: (line: InvoiceDraftDetailLineItem) => void;
} = {}) {
	return useMemo<ColumnDef<InvoiceDraftDetailLineItem>[]>(
		() => [
			{
				id: "worker",
				header: "Worker",
				accessorFn: (r) => r.workerName,
				cell: ({ row }) => (
					<div className="max-w-56 min-w-0 px-2">
						<div className="flex flex-wrap items-center gap-2">
							<p className="font-semibold text-sm">{row.original.workerName}</p>
							{row.original.disputed ? (
								<Badge variant="error" className="text-[10px] font-medium">
									Disputed
								</Badge>
							) : null}
						</div>
						<p className="text-muted-foreground text-xs truncate">
							{row.original.workerSubtitle}
						</p>
					</div>
				),
			},
			{
				id: "payCode",
				header: "Pay code",
				accessorFn: (r) => r.payCode,
				cell: ({ row }) => (
					<div className="max-w-32 px-2">
						<span className="text-sm">{row.original.payCode}</span>
					</div>
				),
			},
			{
				id: "hours",
				header: () => <span className="block w-full text-right">Hours</span>,
				accessorFn: (r) => r.hours,
				cell: ({ row }) => (
					<div className="w-16 px-2 text-right tabular-nums">
						{row.original.hours}
					</div>
				),
			},
			{
				id: "rate",
				header: () => <span className="block w-full text-right">Rate</span>,
				accessorFn: (r) => r.rate,
				cell: ({ row }) => (
					<div className="min-w-20 px-2 text-right tabular-nums">
						{formatCurrency(row.original.rate)}
					</div>
				),
			},
			{
				id: "amount",
				header: () => <span className="block w-full text-right">Amount</span>,
				accessorFn: (r) => r.amount,
				cell: ({ row }) => (
					<div className="min-w-22 px-2 text-right">
						<span
							className={
								row.original.disputed
									? "font-medium text-red-600 line-through tabular-nums dark:text-red-400"
									: "tabular-nums"
							}
						>
							{formatCurrency(row.original.amount)}
						</span>
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
					<div className="flex justify-end pr-2">
						{row.original.disputed ? (
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="text-muted-foreground h-8 gap-1 px-2"
								onClick={() => onViewDispute?.(row.original)}
							>
								<FileText className="size-4 shrink-0" />
								View
							</Button>
						) : canDispute ? (
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="h-8 gap-1 px-2 text-red-600 hover:text-red-700"
								onClick={() => onDispute?.(row.original)}
							>
								<X className="size-4 shrink-0" />
								Dispute
							</Button>
						) : (
							<span className="text-muted-foreground">—</span>
						)}
					</div>
				),
			},
		],
		[canDispute, onDispute, onViewDispute],
	);
}
