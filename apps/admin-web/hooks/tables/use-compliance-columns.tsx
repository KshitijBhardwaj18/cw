"use client";

import { ComplianceListItemStatus } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { COMPLIANCE_EXPIRATION_TYPE_LABELS } from "@/constants/compliance";
import {
	COMPLIANCE_COLUMN_HEADERS,
	COMPLIANCE_COLUMN_KEYS,
} from "@/constants/tables/compliance";
import type {
	ComplianceColumnsCallbacks,
	ComplianceTableRowType,
} from "@/types/compliance";

export const useComplianceColumns = ({
	onEdit,
	onDelete,
}: ComplianceColumnsCallbacks) => {
	const columns = useMemo<ColumnDef<ComplianceTableRowType>[]>(
		() => [
			{
				accessorKey: COMPLIANCE_COLUMN_KEYS.name,
				header: COMPLIANCE_COLUMN_HEADERS.name,
				cell: ({ row }) => (
					<div className="text-sm font-medium">{row.original.name}</div>
				),
			},
			{
				accessorKey: COMPLIANCE_COLUMN_KEYS.expirationType,
				header: COMPLIANCE_COLUMN_HEADERS.expirationType,
				cell: ({ row }) => (
					<div className="text-sm text-muted-foreground">
						{COMPLIANCE_EXPIRATION_TYPE_LABELS[row.original.expirationType]}
					</div>
				),
			},
			{
				accessorKey: COMPLIANCE_COLUMN_KEYS.displayToCandidate,
				header: COMPLIANCE_COLUMN_HEADERS.displayToCandidate,
				cell: ({ row }) => (
					<div className="text-sm">
						{row.original.displayToCandidate ? "Yes" : "No"}
					</div>
				),
			},
			{
				accessorKey: COMPLIANCE_COLUMN_KEYS.status,
				header: COMPLIANCE_COLUMN_HEADERS.status,
				cell: ({ row }) => (
					<Badge
						variant={
							row.original.status === ComplianceListItemStatus.ACTIVE
								? "success"
								: "inactive"
						}
					>
						{row.original.status === ComplianceListItemStatus.ACTIVE
							? "Active"
							: "Inactive"}
					</Badge>
				),
			},
			{
				id: COMPLIANCE_COLUMN_KEYS.actions,
				header: COMPLIANCE_COLUMN_HEADERS.actions,
				cell: ({ row }) => (
					<div className="flex items-center gap-2">
						{onEdit && (
							<Button
								variant="ghost"
								size="icon"
								onClick={() => onEdit(row.original)}
								aria-label="Edit compliance item"
							>
								<Edit className="size-4" />
							</Button>
						)}
						{onDelete && (
							<Button
								variant="ghost"
								size="icon"
								onClick={() => onDelete(row.original)}
								aria-label="Delete compliance item"
							>
								<Trash2 className="size-4 text-destructive" />
							</Button>
						)}
					</div>
				),
			},
		],
		[onEdit, onDelete],
	);

	return { columns };
};
