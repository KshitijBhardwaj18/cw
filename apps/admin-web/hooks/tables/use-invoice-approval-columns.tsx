"use client";

import { enumToTitleText, formatUsdLedger } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import type { ColumnDef } from "@tanstack/react-table";
import { Smartphone, Upload } from "lucide-react";
import type { CandidateEntry } from "@/types/billing-approval";

export function useInvoiceApprovalColumns() {
	const columns: ColumnDef<CandidateEntry>[] = [
		{
			id: "candidate",
			header: "Candidate",
			accessorKey: "name",
			cell: ({ row }) => {
				const entry = row.original;
				return (
					<div>
						<div className="font-medium">{entry.name}</div>
						<div className="text-xs text-muted-foreground font-medium">
							{entry.role}
						</div>
					</div>
				);
			},
		},
		{
			id: "source",
			header: "Source",
			accessorKey: "source",
			cell: ({ row }) => {
				const source = row.original.source;
				return (
					<div className="flex items-center gap-2 text-xs font-medium text-primary uppercase tracking-wide">
						{source === "mobile" ? (
							<>
								<Smartphone className="size-3.5" />
								Mobile
							</>
						) : (
							<>
								<Upload className="size-3.5" />
								Upload
							</>
						)}
					</div>
				);
			},
		},
		{
			id: "regularHrs",
			header: () => <div className="text-center">Regular Hrs</div>,
			accessorKey: "regularHrs",
			cell: ({ row }) => (
				<div className="font-medium text-center">{row.original.regularHrs}</div>
			),
		},
		{
			id: "otHrs",
			header: () => <div className="text-center">OT Hrs</div>,
			accessorKey: "otHrs",
			cell: ({ row }) => (
				<div className="font-medium text-center">{row.original.otHrs}</div>
			),
		},
		{
			id: "holidayHrs",
			header: () => <div className="text-center">Holiday Hrs</div>,
			accessorKey: "holidayHrs",
			cell: ({ row }) => (
				<div className="font-medium text-center">{row.original.holidayHrs}</div>
			),
		},
		{
			id: "billRate",
			header: () => <div className="text-center">Bill Rate</div>,
			accessorKey: "billRate",
			cell: ({ row }) => (
				<div className="font-medium text-center">
					{formatUsdLedger(row.original.billRate)}
				</div>
			),
		},
		{
			id: "total",
			header: () => <div className="text-center">Total</div>,
			accessorKey: "total",
			cell: ({ row }) => (
				<div className="font-medium text-center">
					{formatUsdLedger(row.original.total)}
				</div>
			),
		},
		{
			id: "status",
			header: () => <div className="text-right">Status</div>,
			accessorKey: "status",
			cell: ({ row }) => (
				<div className="text-right">
					<Badge variant="success">
						{enumToTitleText(row.original.status)}
					</Badge>
				</div>
			),
		},
	];

	return columns;
}
