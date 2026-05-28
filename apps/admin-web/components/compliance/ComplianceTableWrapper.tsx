"use client";

import type { ComplianceResponseType } from "@repo/shared";
import { useState } from "react";
import { toast } from "sonner";
import { useDeleteComplianceItem } from "@/queries/compliance.query";
import type { ComplianceTableRowType } from "@/types/compliance";
import { ComplianceDeleteDialog } from "./ComplianceDeleteDialog";
import { ComplianceFormDialog } from "./ComplianceFormDialog";
import { ComplianceTable } from "./ComplianceTable";

interface ComplianceTableWrapperProps {
	data: ComplianceTableRowType[];
	getItemForEdit?: (id: string) => ComplianceResponseType | undefined;
	canEdit?: boolean;
	canDelete?: boolean;
}

export function ComplianceTableWrapper({
	data,
	getItemForEdit,
	canEdit = true,
	canDelete = true,
}: Readonly<ComplianceTableWrapperProps>) {
	const [editRow, setEditRow] = useState<ComplianceTableRowType | null>(null);
	const [deleteTarget, setDeleteTarget] =
		useState<ComplianceTableRowType | null>(null);

	const deleteMutation = useDeleteComplianceItem();

	const handleEdit = canEdit
		? (row: ComplianceTableRowType) => setEditRow(row)
		: undefined;
	const handleDeleteRequest = canDelete
		? (row: ComplianceTableRowType) => setDeleteTarget(row)
		: undefined;

	const handleDeleteConfirm = () => {
		if (!deleteTarget) return;
		if (!canDelete) {
			toast.error("You are not authorized to delete compliance items");
			return;
		}
		const targetName = deleteTarget.name;
		deleteMutation.mutate(String(deleteTarget.id), {
			onSuccess: () => {
				toast.success(`"${targetName}" deleted successfully`);
				setDeleteTarget(null);
			},
			onError: (err) =>
				toast.error(
					err instanceof Error ? err.message : "Something went wrong",
				),
		});
	};

	const editItem = editRow ? getItemForEdit?.(editRow.id) : undefined;

	return (
		<>
			<ComplianceTable
				data={data}
				onEdit={handleEdit}
				onDelete={handleDeleteRequest}
			/>

			<ComplianceFormDialog
				open={!!editRow}
				onOpenChange={(open) => {
					if (!open) setEditRow(null);
				}}
				item={editItem}
			/>

			<ComplianceDeleteDialog
				item={deleteTarget}
				isPending={deleteMutation.isPending}
				onConfirm={() => void handleDeleteConfirm()}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
			/>
		</>
	);
}
