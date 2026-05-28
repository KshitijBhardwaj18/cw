"use client";

import type { OrganizationDepartmentType } from "@repo/shared";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { useOrganizationDepartmentColumns } from "@/hooks/tables/use-organization-department-columns";

export interface OrganizationDepartmentsTableProps {
	data: OrganizationDepartmentType[];
	onEdit?: (department: OrganizationDepartmentType) => void;
	onDelete?: (department: OrganizationDepartmentType) => void;
}

export function OrganizationDepartmentsTable({
	data,
	onEdit,
	onDelete,
}: Readonly<OrganizationDepartmentsTableProps>) {
	const { columns } = useOrganizationDepartmentColumns({ onEdit, onDelete });

	return <CustomTable columns={columns} data={data} enableSorting={false} />;
}
