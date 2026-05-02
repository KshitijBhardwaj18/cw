"use client";

import { formatCurrency } from "@repo/shared";
import type { InvoiceLineItem } from "@repo/ui/general/billing/types";
import type { ColumnDef } from "@tanstack/react-table";
import { Briefcase, MapPin, User } from "lucide-react";
import { useMemo } from "react";

export function useFinalInvoiceLineItemColumns() {
	return useMemo<ColumnDef<InvoiceLineItem>[]>(
		() => [
			{
				id: "worker",
				header: "Worker",
				accessorFn: (r) => r.candidateName ?? "",
				cell: ({ row }) => (
					<div className="max-w-[12rem] min-w-0 px-2">
						<div className="flex items-center gap-2">
							<User className="text-muted-foreground size-3.5 shrink-0" />
							<span className="text-sm font-medium">
								{row.original.candidateName ?? "Unassigned"}
							</span>
						</div>
					</div>
				),
			},
			{
				id: "position",
				header: "Position",
				accessorFn: (r) => r.payCode ?? "",
				cell: ({ row }) => (
					<div className="max-w-[10rem] min-w-0 px-2">
						<div className="flex items-center gap-2">
							<Briefcase className="text-muted-foreground size-3.5 shrink-0" />
							<span className="text-sm">{row.original.payCode ?? "—"}</span>
						</div>
					</div>
				),
			},
			{
				id: "location",
				header: "Location / Dept",
				accessorFn: (r) => r.locationName ?? "",
				cell: ({ row }) => (
					<div className="max-w-[13rem] min-w-0 px-2">
						<div className="flex items-start gap-2">
							<MapPin className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
							<div>
								<p className="text-sm font-medium">
									{row.original.locationName ?? "—"}
								</p>
								<p className="text-muted-foreground text-xs">
									{row.original.description}
								</p>
							</div>
						</div>
					</div>
				),
			},
			{
				id: "date",
				header: "Date",
				accessorFn: (r) => r.workDate ?? "",
				cell: ({ row }) => (
					<div className="w-[7.5rem] px-2 tabular-nums">
						<span className="text-sm">
							{row.original.workDate
								? new Date(row.original.workDate).toLocaleDateString()
								: "—"}
						</span>
					</div>
				),
			},
			{
				id: "regular",
				header: () => <span className="block w-full text-center">Regular</span>,
				accessorFn: (r) => r.regularHrs ?? 0,
				cell: ({ row }) => (
					<div className="px-2 text-center tabular-nums">
						{row.original.regularHrs ?? 0}
					</div>
				),
			},
			{
				id: "ot",
				header: () => <span className="block w-full text-center">OT</span>,
				accessorFn: (r) => r.otHrs ?? 0,
				cell: ({ row }) => (
					<div className="px-2 text-center tabular-nums">
						{row.original.otHrs ?? 0}
					</div>
				),
			},
			{
				id: "rate",
				header: () => <span className="block w-full text-right">Rate</span>,
				accessorFn: (r) => r.unitPrice,
				cell: ({ row }) => (
					<div className="min-w-[5rem] px-2 text-right tabular-nums">
						{formatCurrency(row.original.unitPrice)}
					</div>
				),
			},
			{
				id: "total",
				header: () => <span className="block w-full text-right">Total</span>,
				accessorFn: (r) => r.amount,
				cell: ({ row }) => (
					<div className="min-w-[5.5rem] px-2 text-right font-medium tabular-nums">
						{formatCurrency(row.original.amount)}
					</div>
				),
			},
		],
		[],
	);
}
