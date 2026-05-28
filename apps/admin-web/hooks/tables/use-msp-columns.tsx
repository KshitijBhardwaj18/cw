"use client";

import type { MspResponseType } from "@repo/shared";
import { getLabel } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import { useMemo } from "react";
import {
	MSP_INDUSTRY_OPTIONS,
	MSP_ORGANIZATION_TYPE_OPTIONS,
} from "@/constants/msp";
import { MSP_COLUMN_HEADERS, MSP_COLUMN_KEYS } from "@/constants/tables/msps";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import type { MspColumnsCallbacks } from "@/types/msp";

export const useMspColumns = ({
	onEdit,
	onDelete,
	actions,
}: MspColumnsCallbacks) => {
	const { fmtShortDate } = useUserTimezone();
	const columns = useMemo<ColumnDef<MspResponseType>[]>(
		() => [
			{
				accessorKey: MSP_COLUMN_KEYS.name,
				header: MSP_COLUMN_HEADERS.name,
				cell: ({ row }) => (
					<div className="text-sm font-semibold">{row.original.name}</div>
				),
			},
			{
				id: MSP_COLUMN_KEYS.location,
				header: MSP_COLUMN_HEADERS.location,
				cell: ({ row }) => {
					const hq = row.original.headquarters;
					const location = hq ? `${hq.city}, ${hq.state}` : "—";
					return <div className="text-sm">{location}</div>;
				},
			},
			{
				accessorKey: MSP_COLUMN_KEYS.industry,
				header: MSP_COLUMN_HEADERS.industry,
				cell: ({ row }) => (
					<div className="text-sm">
						{getLabel(MSP_INDUSTRY_OPTIONS, row.original.industry)}
					</div>
				),
			},
			{
				accessorKey: MSP_COLUMN_KEYS.organizationType,
				header: MSP_COLUMN_HEADERS.organizationType,
				cell: ({ row }) => (
					<div className="text-sm">
						{getLabel(
							MSP_ORGANIZATION_TYPE_OPTIONS,
							row.original.organizationType,
						)}
					</div>
				),
			},
			{
				accessorKey: MSP_COLUMN_KEYS.phoneNumber,
				header: MSP_COLUMN_HEADERS.phoneNumber,
				cell: ({ row }) => (
					<div className="text-sm">{row.original.phoneNumber}</div>
				),
			},
			{
				accessorKey: MSP_COLUMN_KEYS.createdAt,
				header: MSP_COLUMN_HEADERS.createdAt,
				cell: ({ row }) => (
					<div className="text-sm">{fmtShortDate(row.original.createdAt)}</div>
				),
			},
			{
				id: MSP_COLUMN_KEYS.actions,
				header: MSP_COLUMN_HEADERS.actions,
				cell: ({ row }) => (
					<div className="flex items-center gap-2">
						{actions ?? (
							<>
								{onEdit && (
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8"
										onClick={(e) => {
											e.stopPropagation();
											onEdit(row.original);
										}}
									>
										<Edit className="size-4" />
									</Button>
								)}
								{onDelete && (
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 text-destructive hover:text-destructive"
										onClick={(e) => {
											e.stopPropagation();
											onDelete(row.original);
										}}
									>
										<Trash2 className="size-4" />
									</Button>
								)}
							</>
						)}
					</div>
				),
			},
		],
		[onEdit, onDelete, actions, fmtShortDate],
	);

	return { columns };
};
