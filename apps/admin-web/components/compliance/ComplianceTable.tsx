"use client";

import { CustomTable } from "@repo/ui/general/CustomTable";
import { useComplianceColumns } from "@/hooks/tables/use-compliance-columns";
import type {
	ComplianceColumnsCallbacks,
	ComplianceTableRowType,
} from "@/types/compliance";

interface ComplianceTableProps extends ComplianceColumnsCallbacks {
	data: ComplianceTableRowType[];
}

export function ComplianceTable({
	data,
	onEdit,
	onDelete,
}: ComplianceTableProps) {
	const { columns } = useComplianceColumns({ onEdit, onDelete });

	return <CustomTable columns={columns} data={data} enableSorting={false} />;
}
