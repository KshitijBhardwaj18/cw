"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useReplaceOccupationsForOrganization } from "@/queries/organization-occupations.query";
import type {
	LinkedOrganizationOccupationResponse,
	OrganizationOccupationTableRowType,
} from "@/types/organization-occupation";
import { ManageSpecialtyDialog } from "./ManageSpecialtyDialog";
import { OrganizationOccupationsTable } from "./OrganizationOccupationsTable";
import { OrganizationOccupationUnlinkDialog } from "./OrganizationOccupationUnlinkDialog";
import { toOrganizationOccupationTableRows } from "./utils";

interface OrganizationOccupationsTableWrapperProps {
	data: LinkedOrganizationOccupationResponse[];
	organizationId: string;
	linkedOccupationIds: string[];
}

export function OrganizationOccupationsTableWrapper({
	data,
	organizationId,
	linkedOccupationIds,
}: Readonly<OrganizationOccupationsTableWrapperProps>) {
	const rows = toOrganizationOccupationTableRows(data);
	const replaceMutation = useReplaceOccupationsForOrganization(organizationId);
	const [unlinkTarget, setUnlinkTarget] =
		useState<OrganizationOccupationTableRowType | null>(null);
	const [manageSpecialtyTarget, setManageSpecialtyTarget] =
		useState<OrganizationOccupationTableRowType | null>(null);

	const handleUnlinkRequest = (row: OrganizationOccupationTableRowType) => {
		setUnlinkTarget(row);
	};

	const handleUnlinkConfirm = () => {
		if (!unlinkTarget) return;
		const newIds = linkedOccupationIds.filter((id) => id !== unlinkTarget.id);
		const targetName = unlinkTarget.name;
		replaceMutation.mutate(newIds, {
			onSuccess: () => {
				toast.success(`"${targetName}" unlinked successfully`);
				setUnlinkTarget(null);
			},
			onError: (err) => {
				toast.error(
					err instanceof Error ? err.message : "Failed to unlink occupation",
				);
			},
		});
	};

	const handleManageSpecialtyRequest = (
		row: OrganizationOccupationTableRowType,
	) => {
		setManageSpecialtyTarget(row);
	};

	return (
		<>
			<OrganizationOccupationsTable
				data={rows}
				organizationId={organizationId}
				onUnlink={handleUnlinkRequest}
				onManageSpecialty={handleManageSpecialtyRequest}
			/>
			<OrganizationOccupationUnlinkDialog
				occupation={unlinkTarget}
				isPending={replaceMutation.isPending}
				onConfirm={() => void handleUnlinkConfirm()}
				onOpenChange={(open) => {
					if (!open) setUnlinkTarget(null);
				}}
			/>
			<ManageSpecialtyDialog
				open={!!manageSpecialtyTarget}
				onOpenChange={(open) => {
					if (!open) setManageSpecialtyTarget(null);
				}}
				organizationId={organizationId}
				organizationOccupationId={
					manageSpecialtyTarget?.organizationOccupationId ?? ""
				}
				occupationId={manageSpecialtyTarget?.id ?? ""}
				linkedSpecialtyIds={manageSpecialtyTarget?.linkedSpecialtyIds ?? []}
			/>
		</>
	);
}
