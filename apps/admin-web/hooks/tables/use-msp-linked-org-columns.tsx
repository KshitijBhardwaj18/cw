"use client";

import type { MspLinkedOrgWithOrganization } from "@repo/shared";
import { formatCurrency } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@repo/ui/components/tooltip";
import type { ColumnDef } from "@tanstack/react-table";
import { Download, Eye, Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { useUserTimezone } from "@/hooks/use-user-timezone";

type Options = {
	onEdit?: (row: MspLinkedOrgWithOrganization) => void;
	onDelete?: (row: MspLinkedOrgWithOrganization) => void;
	onViewAgreement?: (row: MspLinkedOrgWithOrganization) => void;
	onDownloadAgreement?: (row: MspLinkedOrgWithOrganization) => void;
	showFeeFields?: boolean;
};

const feeColumns = (): ColumnDef<MspLinkedOrgWithOrganization>[] => [
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
];

const feeRevenueColumns = (): ColumnDef<MspLinkedOrgWithOrganization>[] => [
	{
		id: "expectedMspRevenue",
		header: "EXPECTED MSP REVENUE",
		cell: ({ row }) => (
			<div className="text-sm font-medium">
				{formatCurrency(row.original.expectedMspRevenue)}
			</div>
		),
	},
	{
		id: "expectedSasRevenue",
		header: "EXPECTED SAS REVENUE",
		cell: ({ row }) => (
			<div className="text-sm font-medium">
				{formatCurrency(row.original.expectedSasRevenue)}
			</div>
		),
	},
];

export function useMspLinkedOrgColumns(options: Options = {}) {
	const {
		onEdit,
		onDelete,
		onViewAgreement,
		onDownloadAgreement,
		showFeeFields = true,
	} = options;
	const { fmtShortDate } = useUserTimezone();

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
			...(showFeeFields ? feeColumns() : []),
			{
				accessorKey: "startDate",
				header: "AGREEMENT START DATE",
				cell: ({ row }) => (
					<div className="text-sm">{fmtShortDate(row.original.startDate)}</div>
				),
			},
			{
				accessorKey: "possibleCancellationDate",
				header: "POSSIBLE CANCELLATION DATE",
				cell: ({ row }) => (
					<div className="text-sm">
						{fmtShortDate(row.original.possibleCancellationDate)}
					</div>
				),
			},
			{
				accessorKey: "renewalDate",
				header: "AGREEMENT RENEWAL DATE",
				cell: ({ row }) => (
					<div className="text-sm">
						{fmtShortDate(row.original.renewalDate)}
					</div>
				),
			},
			...(showFeeFields ? feeRevenueColumns() : []),
			{
				id: "ytdInvoicedAmount",
				header: "YEAR-TO-DATE INVOICED AMOUNT",
				cell: ({ row }) => (
					<div className="text-sm">
						{formatCurrency(row.original.ytdInvoicedAmount)}
					</div>
				),
			},
			{
				id: "actions",
				header: "ACTIONS",
				cell: ({ row }) => (
					<div className="flex items-center gap-1">
						{onEdit && (
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="size-8"
										onClick={() => onEdit(row.original)}
									>
										<Pencil className="size-4 text-muted-foreground" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>Edit Linking</TooltipContent>
							</Tooltip>
						)}
						{onDelete && (
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="size-8"
										onClick={() => onDelete(row.original)}
									>
										<Trash2 className="size-4 text-muted-foreground" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>Delete Linking</TooltipContent>
							</Tooltip>
						)}
					</div>
				),
			},
		],
		[
			onEdit,
			onDelete,
			onViewAgreement,
			onDownloadAgreement,
			showFeeFields,
			fmtShortDate,
		],
	);

	return { columns };
}
