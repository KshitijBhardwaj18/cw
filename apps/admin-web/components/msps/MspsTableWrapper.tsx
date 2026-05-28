"use client";

import type { MspResponseType } from "@repo/shared";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useMspAbilities } from "@/hooks/use-msp-abilities";
import { useDeleteMsp } from "@/queries/msps.query";
import { MspDeleteDialog } from "./MspDeleteDialog";
import { MspFormDialog } from "./MspFormDialog";
import { MspsTable } from "./MspsTable";

interface MspsTableWrapperProps {
	data: MspResponseType[];
}

export function MspsTableWrapper({ data }: Readonly<MspsTableWrapperProps>) {
	const router = useRouter();
	const { canDeleteMsp, canUpdateMsp } = useMspAbilities();
	const [editMsp, setEditMsp] = useState<MspResponseType | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<MspResponseType | null>(
		null,
	);

	const deleteMutation = useDeleteMsp();

	const handleRowClick = (msp: MspResponseType) => {
		router.push(`/msps/${msp.id}`);
	};

	const handleEdit = (msp: MspResponseType) => {
		setEditMsp(msp);
	};

	const handleDeleteRequest = (msp: MspResponseType) => {
		setDeleteTarget(msp);
	};

	const handleDeleteConfirm = () => {
		if (!deleteTarget) return;
		if (!canDeleteMsp) {
			toast.error("You are not authorized to delete MSPs");
			return;
		}
		const targetName = deleteTarget.name;
		deleteMutation.mutate(deleteTarget.id, {
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
			<MspsTable
				data={data}
				onEdit={canUpdateMsp ? handleEdit : undefined}
				onDelete={canDeleteMsp ? handleDeleteRequest : undefined}
				onRowClick={handleRowClick}
			/>

			<MspFormDialog
				open={!!editMsp}
				onOpenChange={(open) => {
					if (!open) setEditMsp(null);
				}}
				initialMsp={editMsp}
			/>

			<MspDeleteDialog
				msp={deleteTarget}
				isPending={deleteMutation.isPending}
				onConfirm={() => void handleDeleteConfirm()}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
			/>
		</>
	);
}
