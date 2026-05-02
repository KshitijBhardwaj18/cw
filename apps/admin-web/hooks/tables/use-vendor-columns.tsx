"use client";

import {
	formatDate,
	formatLabelsFromOptions,
	ORGANIZATION_INDUSTRY_OPTIONS,
} from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import { useMemo } from "react";
import {
	VENDOR_COLUMN_HEADERS,
	VENDOR_COLUMN_KEYS,
} from "@/constants/tables/vendors";
import type {
	VendorColumnsCallbacks,
	VendorTableRowType,
} from "@/types/vendor";

export const useVendorColumns = ({
	onEdit,
	onDelete,
	actions,
}: VendorColumnsCallbacks) => {
	const columns = useMemo<ColumnDef<VendorTableRowType>[]>(
		() => [
			{
				accessorKey: VENDOR_COLUMN_KEYS.name,
				header: VENDOR_COLUMN_HEADERS.name,
				cell: ({ row }) => (
					<div className="text-sm font-semibold">{row.original.name}</div>
				),
			},
			{
				accessorKey: VENDOR_COLUMN_KEYS.status,
				header: VENDOR_COLUMN_HEADERS.status,
				cell: ({ row }) => (
					<div className="flex items-center gap-2">
						<span
							className={`size-2.5 rounded-full ${row.original.isActive ? "bg-emerald-500" : "bg-gray-400"}`}
						/>
						<span className="text-sm">
							{row.original.isActive ? "Active" : "Inactive"}
						</span>
					</div>
				),
			},
			{
				accessorKey: VENDOR_COLUMN_KEYS.activationDate,
				header: VENDOR_COLUMN_HEADERS.activationDate,
				cell: ({ row }) => (
					<div className="text-sm">
						{row.original.createdAt ? formatDate(row.original.createdAt) : "—"}
					</div>
				),
			},
			{
				accessorKey: VENDOR_COLUMN_KEYS.industry,
				header: VENDOR_COLUMN_HEADERS.industry,
				cell: ({ row }) => (
					<div className="text-sm">
						{formatLabelsFromOptions(
							ORGANIZATION_INDUSTRY_OPTIONS,
							row.original.industries,
						)}
					</div>
				),
			},
			{
				id: VENDOR_COLUMN_KEYS.actions,
				header: VENDOR_COLUMN_HEADERS.actions,
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
		[onEdit, onDelete, actions],
	);

	return { columns };
};
