"use client";

import type { MspResponseType } from "@repo/shared";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { useMspColumns } from "@/hooks/tables/use-msp-columns";

export interface MspsTableProps {
	data: MspResponseType[];
	onEdit?: (msp: MspResponseType) => void;
	onDelete?: (msp: MspResponseType) => void;
	onRowClick?: (msp: MspResponseType) => void;
	actions?: React.ReactNode;
}

export function MspsTable({
	data,
	onEdit,
	onDelete,
	onRowClick,
	actions,
}: MspsTableProps) {
	const { columns } = useMspColumns({ onEdit, onDelete, actions });

	return (
		<CustomTable
			columns={columns}
			data={data}
			enableSorting={false}
			onRowClick={onRowClick}
		/>
	);
}
