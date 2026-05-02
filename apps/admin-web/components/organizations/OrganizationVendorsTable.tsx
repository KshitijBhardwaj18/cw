"use client";

import type { OrganizationVendorWithVendorType } from "@repo/shared";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { useOrganizationVendorColumns } from "@/hooks/tables/use-organization-vendor-columns";

export interface OrganizationVendorsTableProps {
	data: OrganizationVendorWithVendorType[];
	onEdit?: (row: OrganizationVendorWithVendorType) => void;
	onView?: (row: OrganizationVendorWithVendorType) => void;
	onDelete?: (row: OrganizationVendorWithVendorType) => void;
}

export function OrganizationVendorsTable({
	data,
	onEdit,
	onView,
	onDelete,
}: OrganizationVendorsTableProps) {
	const { columns } = useOrganizationVendorColumns({
		onEdit,
		onView,
		onDelete,
	});

	return <CustomTable columns={columns} data={data} enableSorting={false} />;
}
