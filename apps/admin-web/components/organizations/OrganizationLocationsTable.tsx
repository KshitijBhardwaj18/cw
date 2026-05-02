"use client";

import type { OrganizationLocationType } from "@repo/shared";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { useOrganizationLocationColumns } from "@/hooks/tables/use-organization-location-columns";

export interface OrganizationLocationsTableProps {
	data: OrganizationLocationType[];
	onEdit?: (location: OrganizationLocationType) => void;
	onDelete?: (location: OrganizationLocationType) => void;
}

export function OrganizationLocationsTable({
	data,
	onEdit,
	onDelete,
}: OrganizationLocationsTableProps) {
	const { columns } = useOrganizationLocationColumns({ onEdit, onDelete });

	return <CustomTable columns={columns} data={data} enableSorting={false} />;
}
