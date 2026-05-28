"use client";

import { CustomTable } from "@repo/ui/general/CustomTable";
import { useOrganizationSpecialtyColumns } from "@/hooks/tables/use-organization-specialty-columns";
import type { OrganizationSpecialtyTableRowType } from "@/types/organization-specialty";

export interface OrganizationSpecialtiesTableProps {
	data: OrganizationSpecialtyTableRowType[];
	organizationId: string;
}

export function OrganizationSpecialtiesTable({
	data,
	organizationId,
}: Readonly<OrganizationSpecialtiesTableProps>) {
	const { columns } = useOrganizationSpecialtyColumns({ organizationId });

	return <CustomTable columns={columns} data={data} enableSorting={false} />;
}
