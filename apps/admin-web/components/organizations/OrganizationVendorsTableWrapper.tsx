"use client";

import { Action } from "@repo/casl";
import type { OrganizationVendorWithVendorType } from "@repo/shared";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts";
import { useDeleteOrganizationVendorMutation } from "@/queries/organizations.query";
import { OrganizationVendorDeleteDialog } from "./OrganizationVendorDeleteDialog";
import { OrganizationVendorFormDialog } from "./OrganizationVendorFormDialog";
import { OrganizationVendorsTable } from "./OrganizationVendorsTable";

interface OrganizationVendorsTableWrapperProps {
	organizationId: string;
	data: OrganizationVendorWithVendorType[];
}

export function OrganizationVendorsTableWrapper({
	organizationId,
	data,
}: OrganizationVendorsTableWrapperProps) {
	const { ability } = useAuth();
	const canUpdate = ability.can(Action.Update, "Organization");
	const canDelete = ability.can(Action.Delete, "Organization");

	const [editTarget, setEditTarget] =
		useState<OrganizationVendorWithVendorType | null>(null);
	const [viewTarget, setViewTarget] =
		useState<OrganizationVendorWithVendorType | null>(null);
	const [deleteTarget, setDeleteTarget] =
		useState<OrganizationVendorWithVendorType | null>(null);

	const deleteMutation = useDeleteOrganizationVendorMutation();

	const handleEdit = (row: OrganizationVendorWithVendorType) => {
		setEditTarget(row);
	};

	const handleView = (row: OrganizationVendorWithVendorType) => {
		setViewTarget(row);
	};

	const handleDeleteRequest = (row: OrganizationVendorWithVendorType) => {
		setDeleteTarget(row);
	};

	const handleDeleteConfirm = () => {
		if (!deleteTarget) return;
		if (!canDelete) {
			toast.error("You are not authorized to remove vendors");
			return;
		}
		const targetName = deleteTarget.vendor.name;
		deleteMutation.mutate(
			{ organizationId, organizationVendorId: deleteTarget.id },
			{
				onSuccess: () => {
					toast.success(`"${targetName}" removed successfully`);
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
			<OrganizationVendorsTable
				data={data}
				onEdit={canUpdate ? handleEdit : undefined}
				onView={handleView}
				onDelete={canDelete ? handleDeleteRequest : undefined}
			/>

			<OrganizationVendorFormDialog
				open={!!editTarget}
				onOpenChange={(open) => {
					if (!open) setEditTarget(null);
				}}
				organizationId={organizationId}
				initialOrganizationVendor={editTarget}
			/>

			<OrganizationVendorFormDialog
				open={!!viewTarget}
				onOpenChange={(open) => {
					if (!open) setViewTarget(null);
				}}
				organizationId={organizationId}
				initialOrganizationVendor={viewTarget}
				viewOnly
			/>

			<OrganizationVendorDeleteDialog
				organizationVendor={deleteTarget}
				open={!!deleteTarget}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
				onConfirm={() => void handleDeleteConfirm()}
				isPending={deleteMutation.isPending}
			/>
		</>
	);
}
