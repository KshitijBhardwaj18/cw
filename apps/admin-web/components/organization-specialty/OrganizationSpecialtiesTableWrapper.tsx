"use client";

import type { LinkedOrganizationSpecialtyResponse } from "@/types/organization-specialty";
import { toOrganizationSpecialtyTableRows } from "@/utils";
import { OrganizationSpecialtiesTable } from "./OrganizationSpecialtiesTable";

interface OrganizationSpecialtiesTableWrapperProps {
	data: LinkedOrganizationSpecialtyResponse[];
	organizationId: string;
}

export function OrganizationSpecialtiesTableWrapper({
	data,
	organizationId,
}: OrganizationSpecialtiesTableWrapperProps) {
	const rows = toOrganizationSpecialtyTableRows(data);

	return (
		<OrganizationSpecialtiesTable data={rows} organizationId={organizationId} />
	);
}
