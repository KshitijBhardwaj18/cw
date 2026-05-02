"use client";

import { CustomTable } from "@repo/ui/general/CustomTable";
import { useVendorColumns } from "@/hooks/tables/use-vendor-columns";
import type {
	VendorColumnsCallbacks,
	VendorTableRowType,
} from "@/types/vendor";

interface VendorsTableProps extends VendorColumnsCallbacks {
	data: VendorTableRowType[];
}

export function VendorsTable({ data, onEdit, onDelete }: VendorsTableProps) {
	const { columns } = useVendorColumns({ onEdit, onDelete });

	return (
		<CustomTable
			columns={columns}
			data={data}
			enableSorting
			emptyState={
				<div className="text-center text-muted-foreground">
					No vendors found.
				</div>
			}
		/>
	);
}
