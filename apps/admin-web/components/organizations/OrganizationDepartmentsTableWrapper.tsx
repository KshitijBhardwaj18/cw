"use client";

import { Action } from "@repo/casl";
import type { OrganizationDepartmentType } from "@repo/shared";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts";
import { useDeleteOrganizationDepartmentMutation } from "@/queries/organizations.query";
import { DepartmentDeleteDialog } from "./DepartmentDeleteDialog";
import { DepartmentEditDialog } from "./DepartmentEditDialog";
import { OrganizationDepartmentsTable } from "./OrganizationDepartmentsTable";

interface OrganizationDepartmentsTableWrapperProps {
	organizationId: string;
	data: OrganizationDepartmentType[];
}

export function OrganizationDepartmentsTableWrapper({
	organizationId,
	data,
}: OrganizationDepartmentsTableWrapperProps) {
	const { ability } = useAuth();
	const canUpdateDepartment = ability.can(Action.Update, "Organization");
	const canDeleteDepartment = ability.can(Action.Delete, "Organization");
	const [editDepartment, setEditDepartment] =
		useState<OrganizationDepartmentType | null>(null);
	const [deleteTarget, setDeleteTarget] =
		useState<OrganizationDepartmentType | null>(null);

	const deleteMutation = useDeleteOrganizationDepartmentMutation();

	const handleEdit = (department: OrganizationDepartmentType) => {
		setEditDepartment(department);
	};

	const handleDeleteRequest = (department: OrganizationDepartmentType) => {
		setDeleteTarget(department);
	};

	const handleDeleteConfirm = () => {
		if (!deleteTarget) return;
		if (!canDeleteDepartment) {
			toast.error("You are not authorized to delete departments");
			return;
		}
		const targetName = deleteTarget.name;
		deleteMutation.mutate(
			{ organizationId, departmentId: deleteTarget.id },
			{
				onSuccess: () => {
					toast.success(`"${targetName}" deleted successfully`);
					setDeleteTarget(null);
				},
				onError: (err) =>
					toast.error(
						err instanceof Error ? err.message : "Something went wrong",
					),
			},
		);
	};

	return (
		<>
			<OrganizationDepartmentsTable
				data={data}
				onEdit={canUpdateDepartment ? handleEdit : undefined}
				onDelete={canDeleteDepartment ? handleDeleteRequest : undefined}
			/>

			<DepartmentEditDialog
				open={!!editDepartment}
				onOpenChange={(open) => {
					if (!open) setEditDepartment(null);
				}}
				organizationId={organizationId}
				department={editDepartment}
			/>

			<DepartmentDeleteDialog
				department={deleteTarget}
				isPending={deleteMutation.isPending}
				onConfirm={() => void handleDeleteConfirm()}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
			/>
		</>
	);
}
