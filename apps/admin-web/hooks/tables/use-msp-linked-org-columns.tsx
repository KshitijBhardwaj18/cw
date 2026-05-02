"use client";

import type { MspLinkedOrgWithOrganization } from "@repo/shared";
import { formatCurrency, formatDate } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@repo/ui/components/tooltip";
import type { ColumnDef } from "@tanstack/react-table";
import { Download, Eye, Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";

type Options = {
	onEdit?: (row: MspLinkedOrgWithOrganization) => void;
	onDelete?: (row: MspLinkedOrgWithOrganization) => void;
	onViewAgreement?: (row: MspLinkedOrgWithOrganization) => void;
	onDownloadAgreement?: (row: MspLinkedOrgWithOrganization) => void;
};

export function useMspLinkedOrgColumns(options: Options = {}) {
	const { onEdit, onDelete, onViewAgreement, onDownloadAgreement } = options;

	const columns = useMemo<ColumnDef<MspLinkedOrgWithOrganization>[]>(
		() => [
			{
				accessorKey: "organization.name",
				header: "ORGANIZATION NAME",
				cell: ({ row }) => (
					<div className="text-sm font-medium">
						{row.original.organization.name}
					</div>
				),
			},
			{
				id: "addendumAgreement",
				header: "ADDENDUM AGREEMENT",
				cell: ({ row }) => (
					<div className="flex items-center gap-2">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="size-8"
									onClick={() => onViewAgreement?.(row.original)}
								>
									<Eye className="size-4 text-muted-foreground" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>View Agreement</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="size-8"
									onClick={() => onDownloadAgreement?.(row.original)}
								>
									<Download className="size-4 text-muted-foreground" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Download Agreement</TooltipContent>
						</Tooltip>
					</div>
				),
			},
			{
				accessorKey: "mspFeePercentage",
				header: "MSP FEE %",
				cell: ({ row }) => (
					<div className="text-sm">{row.original.mspFeePercentage}</div>
				),
			},
			{
				accessorKey: "saasFeePercentage",
				header: "SAAS FEE %",
				cell: ({ row }) => (
					<div className="text-sm">{row.original.saasFeePercentage}</div>
				),
			},
			{
				accessorKey: "startDate",
				header: "AGREEMENT START DATE",
				cell: ({ row }) => (
					<div className="text-sm">{formatDate(row.original.startDate)}</div>
				),
			},
			{
				accessorKey: "possibleCancellationDate",
				header: "POSSIBLE CANCELLATION DATE",
				cell: ({ row }) => (
					<div className="text-sm">
						{row.original.possibleCancellationDate
							? formatDate(row.original.possibleCancellationDate)
							: "—"}
					</div>
				),
			},
			{
				accessorKey: "renewalDate",
				header: "AGREEMENT RENEWAL DATE",
				cell: ({ row }) => (
					<div className="text-sm">{formatDate(row.original.renewalDate)}</div>
				),
			},
			{
				id: "expectedMspRevenue",
				header: "EXPECTED MSP REVENUE",
				cell: () => (
					<div className="text-sm font-medium">{formatCurrency(0)}</div>
				),
			},
			{
				id: "expectedSasRevenue",
				header: "EXPECTED SAS REVENUE",
				cell: () => (
					<div className="text-sm font-medium">{formatCurrency(0)}</div>
				),
			},
			{
				id: "ytdInvoicedAmount",
				header: "YEAR-TO-DATE INVOICED AMOUNT",
				cell: () => <div className="text-sm">{formatCurrency(0)}</div>,
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
									className="size-8"
									onClick={() => onEdit?.(row.original)}
								>
									<Pencil className="size-4 text-muted-foreground" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Edit Linking</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="size-8"
									onClick={() => onDelete?.(row.original)}
								>
									<Trash2 className="size-4 text-muted-foreground" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Delete Linking</TooltipContent>
						</Tooltip>
					</div>
				),
			},
		],
		[onEdit, onDelete, onViewAgreement, onDownloadAgreement],
	);

	return { columns };
}
