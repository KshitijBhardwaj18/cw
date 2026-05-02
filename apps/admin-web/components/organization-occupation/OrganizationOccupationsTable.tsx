"use client";

import { CustomTable } from "@repo/ui/general/CustomTable";
import { useOrganizationOccupationColumns } from "@/hooks/tables/use-organization-occupation-columns";
import type { OrganizationOccupationTableRowType } from "@/types/organization-occupation";

export interface OrganizationOccupationsTableProps {
	data: OrganizationOccupationTableRowType[];
	organizationId: string;
	onUnlink?: (row: OrganizationOccupationTableRowType) => void;
	onManageSpecialty?: (row: OrganizationOccupationTableRowType) => void;
}

export function OrganizationOccupationsTable({
	data,
	organizationId,
	onUnlink,
	onManageSpecialty,
}: OrganizationOccupationsTableProps) {
	const { columns } = useOrganizationOccupationColumns({
		organizationId,
		onUnlink,
		onManageSpecialty,
	});

	return <CustomTable columns={columns} data={data} enableSorting={false} />;
}
