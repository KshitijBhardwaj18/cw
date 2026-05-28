"use client";

import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { useCandidatesTabContent } from "@/contexts/organization-user-enrollment.context";

export function CandidatesTabContent() {
	const {
		isLoading,
		isError,
		rows,
		columns,
		debouncedSearch,
		totalCount,
		page,
		pageSize,
		onPaginationChange,
	} = useCandidatesTabContent();

	if (isLoading) {
		return (
			<Empty className="border-muted/50">
				<EmptyHeader>
					<EmptyTitle>Loading candidates…</EmptyTitle>
					<EmptyDescription>Fetching enrolled candidates.</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}
	if (isError) {
		return (
			<Empty className="border-destructive/40">
				<EmptyHeader>
					<EmptyTitle>Unable to load candidates</EmptyTitle>
					<EmptyDescription>
						We could not fetch candidates. Please try again.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}
	if (rows.length === 0) {
		return (
			<Empty className="border-muted/50">
				<EmptyHeader>
					<EmptyTitle>
						{debouncedSearch ? "No results found" : "No candidates"}
					</EmptyTitle>
					<EmptyDescription>
						{debouncedSearch
							? `No candidates match "${debouncedSearch}".`
							: "Candidates onboarded into this organization will appear here."}
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
			getRowId={(row) => row.id}
			paginationMode="server"
			totalCount={totalCount}
			currentPage={page}
			pageSize={pageSize}
			onPaginationChange={onPaginationChange}
		/>
	);
}
