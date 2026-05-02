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
import { PLACEMENTS_PAGE_SIZE } from "@/constants/placements";
import type { PlacementListMockRow } from "@/types/placements";

export type PlacementsTableCardProps = {
	rows: PlacementListMockRow[];
	columns: ColumnDef<PlacementListMockRow, unknown>[];
	totalFiltered: number;
};

export function PlacementsTableCard({
	rows,
	columns,
	totalFiltered,
}: PlacementsTableCardProps) {
	if (totalFiltered === 0) {
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
			enablePagination
			paginationMode="client"
			pageSize={PLACEMENTS_PAGE_SIZE}
			emptyState={null}
		/>
	);
}
