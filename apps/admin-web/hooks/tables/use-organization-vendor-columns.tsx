"use client";

import type { OrganizationVendorWithVendorType } from "@repo/shared";
import { getLabel } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { Edit, Eye, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { ORGANIZATION_VENDOR_STATUS_OPTIONS } from "@/constants/organization";
import {
	ORGANIZATION_VENDOR_COLUMN_HEADERS,
	ORGANIZATION_VENDOR_COLUMN_KEYS,
} from "@/constants/tables/organization-vendors";

type OrganizationVendorColumnsCallbacks = {
	onEdit?: (row: OrganizationVendorWithVendorType) => void;
	onView?: (row: OrganizationVendorWithVendorType) => void;
	onDelete?: (row: OrganizationVendorWithVendorType) => void;
};

export function useOrganizationVendorColumns({
	onEdit,
	onView,
	onDelete,
}: OrganizationVendorColumnsCallbacks) {
	const columns = useMemo<ColumnDef<OrganizationVendorWithVendorType>[]>(
		() => [
			{
				accessorKey: ORGANIZATION_VENDOR_COLUMN_KEYS.name,
				header: ORGANIZATION_VENDOR_COLUMN_HEADERS.name,
				cell: ({ row }) => (
					<div className="text-sm font-semibold">
						{row.original.vendor.name}
					</div>
				),
			},
			{
				accessorKey: ORGANIZATION_VENDOR_COLUMN_KEYS.status,
				header: ORGANIZATION_VENDOR_COLUMN_HEADERS.status,
				cell: ({ row }) => (
					<div className="text-sm">
						{getLabel(ORGANIZATION_VENDOR_STATUS_OPTIONS, row.original.status)}
					</div>
				),
			},
			{
				accessorKey: ORGANIZATION_VENDOR_COLUMN_KEYS.startDate,
				header: ORGANIZATION_VENDOR_COLUMN_HEADERS.startDate,
				cell: ({ row }) => (
					<div className="text-sm">
						{row.original.startDate
							? new Date(row.original.startDate).toLocaleDateString("en-US", {
									year: "numeric",
									month: "short",
									day: "numeric",
								})
							: "—"}
					</div>
				),
			},
			...(onEdit || onView || onDelete
				? [
						{
							id: ORGANIZATION_VENDOR_COLUMN_KEYS.actions,
							header: ORGANIZATION_VENDOR_COLUMN_HEADERS.actions,
							cell: ({
								row,
							}: {
								row: Row<OrganizationVendorWithVendorType>;
							}) => (
								<div className="flex items-center gap-2">
									{onView && (
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8"
											onClick={(e) => {
												e.stopPropagation();
												onView(row.original);
											}}
											title="View"
										>
											<Eye className="size-4" />
										</Button>
									)}
									{onEdit && (
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8"
											onClick={(e) => {
												e.stopPropagation();
												onEdit(row.original);
											}}
											title="Edit"
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
											title="Delete"
										>
											<Trash2 className="size-4" />
										</Button>
									)}
								</div>
							),
						},
					]
				: []),
		],
		[onEdit, onView, onDelete],
	);

	return { columns };
}
