"use client";

import { Action } from "@repo/casl";
import type { OrganizationLocationType } from "@repo/shared";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts";
import { useDeleteOrganizationLocationMutation } from "@/queries/organizations.query";
import { LocationDeleteDialog } from "./LocationDeleteDialog";
import { LocationFormDialog } from "./LocationFormDialog";
import { OrganizationLocationsTable } from "./OrganizationLocationsTable";

interface OrganizationLocationsTableWrapperProps {
	organizationId: string;
	data: OrganizationLocationType[];
}

export function OrganizationLocationsTableWrapper({
	organizationId,
	data,
}: Readonly<OrganizationLocationsTableWrapperProps>) {
	const { ability } = useAuth();
	const canUpdateLocation = ability.can(Action.Update, "Organization");
	const canDeleteLocation = ability.can(Action.Delete, "Organization");
	const [editLocation, setEditLocation] =
		useState<OrganizationLocationType | null>(null);
	const [deleteTarget, setDeleteTarget] =
		useState<OrganizationLocationType | null>(null);

	const deleteMutation = useDeleteOrganizationLocationMutation();

	const handleEdit = (location: OrganizationLocationType) => {
		setEditLocation(location);
	};

	const handleDeleteRequest = (location: OrganizationLocationType) => {
		setDeleteTarget(location);
	};

	const handleDeleteConfirm = () => {
		if (!deleteTarget) return;
		if (!canDeleteLocation) {
			toast.error("You are not authorized to delete locations");
			return;
		}
		const targetName = deleteTarget.name;
		deleteMutation.mutate(
			{ organizationId, locationId: deleteTarget.id },
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
			<OrganizationLocationsTable
				data={data}
				onEdit={canUpdateLocation ? handleEdit : undefined}
				onDelete={canDeleteLocation ? handleDeleteRequest : undefined}
			/>

			<LocationFormDialog
				open={!!editLocation}
				onOpenChange={(open) => {
					if (!open) setEditLocation(null);
				}}
				organizationId={organizationId}
				initialLocation={editLocation}
			/>

			<LocationDeleteDialog
				location={deleteTarget}
				isPending={deleteMutation.isPending}
				onConfirm={() => void handleDeleteConfirm()}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
			/>
		</>
	);
}
