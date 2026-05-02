"use client";

import type {
	SpecialtyResponseType,
	SpecialtyTableRowType,
} from "@repo/shared";
import { useState } from "react";
import { toast } from "sonner";
import { useDeleteSpecialty } from "@/queries/specialties.query";
import { SpecialtiesTable } from "./SpecialtiesTable";
import { SpecialtyDeleteDialog } from "./SpecialtyDeleteDialog";
import { SpecialtyFormDialog } from "./SpecialtyFormDialog";

interface SpecialtiesTableWrapperProps {
	data: SpecialtyTableRowType[];
	rawData: SpecialtyResponseType[];
	canEdit?: boolean;
	canDelete?: boolean;
}

export function SpecialtiesTableWrapper({
	data,
	rawData,
	canEdit = true,
	canDelete = true,
}: SpecialtiesTableWrapperProps) {
	const [editSpecialty, setEditSpecialty] =
		useState<SpecialtyResponseType | null>(null);
	const [deleteTarget, setDeleteTarget] =
		useState<SpecialtyTableRowType | null>(null);

	const deleteMutation = useDeleteSpecialty();

	const handleEdit = canEdit
		? (row: SpecialtyTableRowType) => {
				const full = rawData.find((s) => s.id === row.id);
				if (full) setEditSpecialty(full);
			}
		: undefined;

	const handleDeleteRequest = canDelete
		? (specialty: SpecialtyTableRowType) => setDeleteTarget(specialty)
		: undefined;

	const handleDeleteConfirm = () => {
		if (!deleteTarget) return;
		if (!canDelete) {
			toast.error("You are not authorized to delete specialties");
			return;
		}
		const targetAcronym = deleteTarget.acronym;
		deleteMutation.mutate(String(deleteTarget.id), {
			onSuccess: () => {
				toast.success(`"${targetAcronym}" deleted successfully`);
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
			<SpecialtiesTable
				data={data}
				onEdit={handleEdit}
				onDelete={handleDeleteRequest}
			/>

			<SpecialtyFormDialog
				open={!!editSpecialty}
				onOpenChange={(open) => {
					if (!open) setEditSpecialty(null);
				}}
				specialty={editSpecialty ?? undefined}
			/>

			<SpecialtyDeleteDialog
				specialty={deleteTarget}
				isPending={deleteMutation.isPending}
				onConfirm={() => void handleDeleteConfirm()}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
			/>
		</>
	);
}
