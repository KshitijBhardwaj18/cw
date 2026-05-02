"use client";

import { OccupationStatus, type OccupationTableRowType } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import { useMemo } from "react";
import {
	OCCUPATION_COLUMN_HEADERS,
	OCCUPATION_COLUMN_KEYS,
} from "@/constants/tables/occupations";
import type { OccupationColumnsCallbacks } from "@/types/occupation";

export const useOccupationColumns = ({
	onEdit,
	onDelete,
	actions,
}: OccupationColumnsCallbacks) => {
	const columns = useMemo<ColumnDef<OccupationTableRowType>[]>(
		() => [
			{
				accessorKey: OCCUPATION_COLUMN_KEYS.name,
				header: OCCUPATION_COLUMN_HEADERS.name,
				cell: ({ row }) => (
					<div className="flex flex-col gap-0.5 py-2">
						<div className="text-sm font-semibold">{row.original.name}</div>
						<div className="text-xs text-muted-foreground">
							{row.original.acronym}
						</div>
					</div>
				),
			},
			{
				accessorKey: OCCUPATION_COLUMN_KEYS.industry,
				header: OCCUPATION_COLUMN_HEADERS.industry,
				cell: ({ row }) => (
					<div className="text-sm">{row.original.industry ?? "-"}</div>
				),
			},
			{
				accessorKey: OCCUPATION_COLUMN_KEYS.acronym,
				header: OCCUPATION_COLUMN_HEADERS.acronym,
				cell: ({ row }) => (
					<div className="text-sm font-medium">{row.original.acronym}</div>
				),
			},
			{
				accessorKey: OCCUPATION_COLUMN_KEYS.code,
				header: OCCUPATION_COLUMN_HEADERS.code,
				cell: ({ row }) => (
					<div className="font-mono text-sm">{row.original.code}</div>
				),
			},
			{
				accessorKey: OCCUPATION_COLUMN_KEYS.status,
				header: OCCUPATION_COLUMN_HEADERS.status,
				cell: ({ row }) => (
					<Badge
						variant={
							row.original.status === OccupationStatus.ACTIVE
								? "success"
								: "inactive"
						}
					>
						{row.original.status === OccupationStatus.ACTIVE
							? "Active"
							: "Inactive"}
					</Badge>
				),
			},
			{
				id: OCCUPATION_COLUMN_KEYS.actions,
				header: OCCUPATION_COLUMN_HEADERS.actions,
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
