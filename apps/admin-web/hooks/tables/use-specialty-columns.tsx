"use client";

import { SpecialtyStatus, type SpecialtyTableRowType } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import { useMemo } from "react";
import {
	SPECIALTY_COLUMN_HEADERS,
	SPECIALTY_COLUMN_KEYS,
} from "@/constants/tables/specialties";
import type { SpecialtyColumnsCallbacks } from "@/types/specialty";

export const useSpecialtyColumns = ({
	onEdit,
	onDelete,
	actions,
}: SpecialtyColumnsCallbacks) => {
	const columns = useMemo<ColumnDef<SpecialtyTableRowType>[]>(
		() => [
			{
				accessorKey: SPECIALTY_COLUMN_KEYS.name,
				header: SPECIALTY_COLUMN_HEADERS.name,
				cell: ({ row }) => (
					<div className="flex flex-col gap-0.5 py-2">
						<div className="text-sm font-semibold">{row.original.acronym}</div>
						<div className="text-sm">{row.original.name}</div>
						{row.original.group && (
							<div className="text-xs text-muted-foreground">
								Group: {row.original.group}
							</div>
						)}
					</div>
				),
			},
			{
				accessorKey: SPECIALTY_COLUMN_KEYS.acronym,
				header: SPECIALTY_COLUMN_HEADERS.acronym,
				cell: ({ row }) => (
					<div className="text-sm font-medium">{row.original.acronym}</div>
				),
			},
			{
				accessorKey: SPECIALTY_COLUMN_KEYS.linkedOccupations,
				header: SPECIALTY_COLUMN_HEADERS.linkedOccupations,
				cell: ({ row }) => (
					<div className="flex flex-wrap gap-1.5">
						{row.original.linkedOccupations.map((occupation) => (
							<Badge key={occupation} variant="secondary">
								{occupation}
							</Badge>
						))}
					</div>
				),
			},
			{
				accessorKey: SPECIALTY_COLUMN_KEYS.status,
				header: SPECIALTY_COLUMN_HEADERS.status,
				cell: ({ row }) => (
					<Badge
						variant={
							row.original.status === SpecialtyStatus.ACTIVE
								? "success"
								: "inactive"
						}
					>
						{row.original.status === SpecialtyStatus.ACTIVE
							? "Active"
							: "Inactive"}
					</Badge>
				),
			},
			{
				id: SPECIALTY_COLUMN_KEYS.actions,
				header: SPECIALTY_COLUMN_HEADERS.actions,
				cell: ({ row }) => (
					<div className="flex items-center gap-2">
						{actions ?? (
							<>
								{onEdit && (
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8"
										onClick={() => onEdit(row.original)}
									>
										<Edit className="size-4" />
									</Button>
								)}
								{onDelete && (
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 text-destructive hover:text-destructive"
										onClick={() => onDelete(row.original)}
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
