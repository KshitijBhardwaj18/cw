"use client";

import type { SpecialtyTableRowType } from "@repo/shared";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { useSpecialtyColumns } from "@/hooks/tables/use-specialty-columns";

export interface SpecialtiesTableProps {
	data: SpecialtyTableRowType[];
	onEdit?: (specialty: SpecialtyTableRowType) => void;
	onDelete?: (specialty: SpecialtyTableRowType) => void;
	actions?: React.ReactNode;
}

export function SpecialtiesTable({
	data,
	onEdit,
	onDelete,
	actions,
}: SpecialtiesTableProps) {
	const { columns } = useSpecialtyColumns({ onEdit, onDelete, actions });

	return <CustomTable columns={columns} data={data} enableSorting={false} />;
}
