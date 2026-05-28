"use client";

import type { OrganizationDepartmentType } from "@repo/shared";
import { getLabel } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { DEPARTMENT_TYPE_OPTIONS } from "@/constants/organization";
import {
	ORGANIZATION_DEPARTMENT_COLUMN_HEADERS,
	ORGANIZATION_DEPARTMENT_COLUMN_KEYS,
} from "@/constants/tables/organization-departments";

type OrganizationDepartmentColumnsCallbacks = {
	onEdit?: (row: OrganizationDepartmentType) => void;
	onDelete?: (row: OrganizationDepartmentType) => void;
};

export function useOrganizationDepartmentColumns({
	onEdit,
	onDelete,
}: OrganizationDepartmentColumnsCallbacks) {
	const columns = useMemo<ColumnDef<OrganizationDepartmentType>[]>(
		() => [
			{
				accessorKey: ORGANIZATION_DEPARTMENT_COLUMN_KEYS.name,
				header: ORGANIZATION_DEPARTMENT_COLUMN_HEADERS.name,
				cell: ({ row }) => (
					<div className="text-sm font-semibold">{row.original.name}</div>
				),
			},
			{
				accessorKey: ORGANIZATION_DEPARTMENT_COLUMN_KEYS.locations,
				header: ORGANIZATION_DEPARTMENT_COLUMN_HEADERS.locations,
				cell: ({ row }) => (
					<div className="text-sm">{row.original.location?.name ?? "—"}</div>
				),
			},
			{
				accessorKey: ORGANIZATION_DEPARTMENT_COLUMN_KEYS.departmentType,
				header: ORGANIZATION_DEPARTMENT_COLUMN_HEADERS.departmentType,
				cell: ({ row }) => (
					<div className="text-sm">
						{getLabel(DEPARTMENT_TYPE_OPTIONS, row.original.departmentType)}
					</div>
				),
			},
			{
				accessorKey: ORGANIZATION_DEPARTMENT_COLUMN_KEYS.costCenter,
				header: ORGANIZATION_DEPARTMENT_COLUMN_HEADERS.costCenter,
				cell: ({ row }) => (
					<div className="text-sm">{row.original.costCenter ?? "—"}</div>
				),
			},
			...(onEdit || onDelete
				? [
						{
							id: ORGANIZATION_DEPARTMENT_COLUMN_KEYS.actions,
							header: ORGANIZATION_DEPARTMENT_COLUMN_HEADERS.actions,
							cell: ({
								row,
							}: Readonly<{ row: Row<OrganizationDepartmentType> }>) => (
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
