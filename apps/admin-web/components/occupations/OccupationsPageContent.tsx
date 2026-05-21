"use client";

import { Action } from "@repo/casl";
import { ConfigPageEmptyState } from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { ConfigPagePagination } from "@repo/ui/general/ConfigPagePagination";
import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts";
import { useOccupationsPaginated } from "@/queries/occupations.query";
import { OccupationFormDialog } from "./OccupationFormDialog";
import { OccupationsTableWrapper } from "./OccupationsTableWrapper";

const PAGE_SIZE = 10;

export const OCCUPATIONS_PARAMS = {
	PAGE: "occPage",
	SEARCH: "occSearch",
} as const;

export const OccupationsPageContent = () => {
	const { ability } = useAuth();
	const canCreateOccupation = ability.can(Action.Create, "Occupation");
	const [createOpen, setCreateOpen] = useState(false);

	const { page, setPage } = usePaginationControls({
		pageParamKey: OCCUPATIONS_PARAMS.PAGE,
		defaultLimit: PAGE_SIZE,
	});

	const { localSearch, searchFromUrl, handleSearchChange, hasActiveSearch } =
		useDebouncedSearch({
			paramKey: OCCUPATIONS_PARAMS.SEARCH,
			pageParamKey: OCCUPATIONS_PARAMS.PAGE,
		});

	const { data: paginated } = useOccupationsPaginated(
		page,
		PAGE_SIZE,
		searchFromUrl,
	);

	const { data: items, total, totalPages } = paginated;

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Occupations"
				total={total}
				itemLabel="occupation"
				itemLabelPlural="occupations"
				countText={
					hasActiveSearch
						? `${total} item${total !== 1 ? "s" : ""} match${total !== 1 ? "" : "es"}`
						: `${total} occupation${total !== 1 ? "s" : ""} total`
				}
				actions={
					canCreateOccupation
						? [
								{
									key: "add",
									icon: <Plus data-icon="inline-start" />,
									label: "Add Occupation",
									className: "font-semibold",
									onClick: () => setCreateOpen(true),
								},
							]
						: []
				}
				search={{
					value: localSearch,
					onChange: handleSearchChange,
					placeholder: "Search occupations...",
				}}
			/>

			{total === 0 ? (
				<ConfigPageEmptyState
					hasSearch={hasActiveSearch}
					emptyTitle="No occupations found."
					emptyMessage="There are no occupations to show yet."
					searchEmptyMessage="There are no occupations that match your search."
				/>
			) : (
				<>
					<OccupationsTableWrapper
						data={items}
						canEdit={ability.can(Action.Update, "Occupation")}
						canDelete={ability.can(Action.Delete, "Occupation")}
					/>

					<ConfigPagePagination
						page={page}
						totalPages={totalPages}
						onPageChange={setPage}
					/>
				</>
			)}

			<OccupationFormDialog open={createOpen} onOpenChange={setCreateOpen} />
		</div>
	);
};
