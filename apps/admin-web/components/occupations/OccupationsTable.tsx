"use client";

import type { OccupationTableRowType } from "@repo/shared";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { useOccupationColumns } from "@/hooks/tables/use-occupation-columns";

export interface OccupationsTableProps {
	data: OccupationTableRowType[];
	onEdit?: (occupation: OccupationTableRowType) => void;
	onDelete?: (occupation: OccupationTableRowType) => void;
	actions?: React.ReactNode;
}

export function OccupationsTable({
	data,
	onEdit,
	onDelete,
	actions,
}: Readonly<OccupationsTableProps>) {
	const { columns } = useOccupationColumns({ onEdit, onDelete, actions });

	return <CustomTable columns={columns} data={data} enableSorting={false} />;
}
