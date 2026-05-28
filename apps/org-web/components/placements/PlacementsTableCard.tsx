"use client";

import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { CustomTable } from "@repo/ui/general/CustomTable";
import type { ColumnDef } from "@tanstack/react-table";
import { Briefcase } from "lucide-react";
import type { PlacementListMockRow } from "@/types/placements";

export type PlacementsTableCardProps = {
	rows: PlacementListMockRow[];
	columns: ColumnDef<PlacementListMockRow, unknown>[];
	totalFiltered: number;
	isLoading: boolean;
};

export function PlacementsTableCard({
	rows,
	columns,
	totalFiltered,
	isLoading,
}: Readonly<PlacementsTableCardProps>) {
	if (totalFiltered === 0 && !isLoading) {
		return (
			<Empty className="border-muted/50 py-12">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<Briefcase className="size-5" />
					</EmptyMedia>
					<EmptyTitle>No placements in this view</EmptyTitle>
					<EmptyDescription>
						Try clearing search, changing the status filter, or switching tabs.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	return (
		<CustomTable
			data={rows}
			columns={columns}
			enableSorting
			enablePagination={false}
			emptyState={null}
			isLoading={isLoading}
			loadingLabel="Loading placements..."
		/>
	);
}
