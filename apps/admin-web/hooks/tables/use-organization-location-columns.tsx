"use client";

import type { OrganizationLocationType } from "@repo/shared";
import { getLabel } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { LOCATION_TYPE_OPTIONS } from "@/constants/organization";
import {
	ORGANIZATION_LOCATION_COLUMN_HEADERS,
	ORGANIZATION_LOCATION_COLUMN_KEYS,
} from "@/constants/tables/organization-locations";

type OrganizationLocationColumnsCallbacks = {
	onEdit?: (row: OrganizationLocationType) => void;
	onDelete?: (row: OrganizationLocationType) => void;
};

export function useOrganizationLocationColumns({
	onEdit,
	onDelete,
}: OrganizationLocationColumnsCallbacks) {
	const columns = useMemo<ColumnDef<OrganizationLocationType>[]>(
		() => [
			{
				accessorKey: ORGANIZATION_LOCATION_COLUMN_KEYS.name,
				header: ORGANIZATION_LOCATION_COLUMN_HEADERS.name,
				cell: ({ row }) => (
					<div className="text-sm font-semibold">{row.original.name}</div>
				),
			},
			{
				accessorKey: ORGANIZATION_LOCATION_COLUMN_KEYS.locationType,
				header: ORGANIZATION_LOCATION_COLUMN_HEADERS.locationType,
				cell: ({ row }) => (
					<div className="text-sm">
						{getLabel(LOCATION_TYPE_OPTIONS, row.original.locationType)}
					</div>
				),
			},

			{
				accessorKey: ORGANIZATION_LOCATION_COLUMN_KEYS.address,
				header: ORGANIZATION_LOCATION_COLUMN_HEADERS.address,
				cell: ({ row }) => (
					<div className="text-sm max-w-[200px] truncate">
						{row.original.address}
					</div>
				),
			},
			{
				accessorKey: ORGANIZATION_LOCATION_COLUMN_KEYS.phone,
				header: ORGANIZATION_LOCATION_COLUMN_HEADERS.phone,
				cell: ({ row }) => (
					<div className="text-sm">{row.original.phone ?? "—"}</div>
				),
			},
			...(onEdit || onDelete
				? [
						{
							id: ORGANIZATION_LOCATION_COLUMN_KEYS.actions,
							header: ORGANIZATION_LOCATION_COLUMN_HEADERS.actions,
							cell: ({ row }: { row: Row<OrganizationLocationType> }) => (
								<div className="flex items-center gap-2">
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
								</div>
							),
						},
					]
				: []),
		],
		[onEdit, onDelete],
	);

	return { columns };
}
