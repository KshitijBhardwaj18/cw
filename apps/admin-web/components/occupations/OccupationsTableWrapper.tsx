"use client";

import type {
	OccupationResponseType,
	OccupationTableRowType,
} from "@repo/shared";
import { useState } from "react";
import { toast } from "sonner";
import { useDeleteOccupation } from "@/queries/occupations.query";
import { OccupationDeleteDialog } from "./OccupationDeleteDialog";
import { OccupationFormDialog } from "./OccupationFormDialog";
import { OccupationsTable } from "./OccupationsTable";

interface OccupationsTableWrapperProps {
	data: OccupationResponseType[];
	canEdit?: boolean;
	canDelete?: boolean;
}

export function OccupationsTableWrapper({
	data,
	canEdit = true,
	canDelete = true,
}: OccupationsTableWrapperProps) {
	const [editOccupation, setEditOccupation] =
		useState<OccupationResponseType | null>(null);
	const [deleteTarget, setDeleteTarget] =
		useState<OccupationTableRowType | null>(null);

	const deleteMutation = useDeleteOccupation();

	const handleEdit = canEdit
		? (row: OccupationTableRowType) => {
				const full = data.find((o) => o.id === row.id);
				if (full) setEditOccupation(full);
			}
		: undefined;

	const handleDeleteRequest = canDelete
		? (occupation: OccupationTableRowType) => setDeleteTarget(occupation)
		: undefined;

	const handleDeleteConfirm = () => {
		if (!deleteTarget) return;
		if (!canDelete) {
			toast.error("You are not authorized to delete occupations");
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

	return (
		<>
			<OccupationsTable
				data={data}
				onEdit={handleEdit}
				onDelete={handleDeleteRequest}
			/>

			<OccupationFormDialog
				open={!!editOccupation}
				onOpenChange={(open) => {
					if (!open) setEditOccupation(null);
				}}
				occupation={editOccupation ?? undefined}
			/>

			<OccupationDeleteDialog
				occupation={deleteTarget}
				isPending={deleteMutation.isPending}
				onConfirm={() => void handleDeleteConfirm()}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
			/>
		</>
	);
}
