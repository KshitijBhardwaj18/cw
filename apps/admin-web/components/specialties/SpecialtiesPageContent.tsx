"use client";

import { Action } from "@repo/casl";
import type { SpecialtyTableRowType } from "@repo/shared";
import { ConfigPageEmptyState } from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { ConfigPagePagination } from "@repo/ui/general/ConfigPagePagination";
import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useAuth } from "@/contexts";
import { useSpecialtiesPaginated } from "@/queries/specialties.query";
import { SpecialtiesTableWrapper } from "./SpecialtiesTableWrapper";
import { SpecialtyFormDialog } from "./SpecialtyFormDialog";

const PAGE_SIZE = 10;

export const SPECIALTY_PARAMS = {
	PAGE: "spPage",
	SEARCH: "spSearch",
} as const;

export function SpecialtiesPageContent() {
	const { ability } = useAuth();
	const canCreateSpecialty = ability.can(Action.Create, "Specialty");
	const [createOpen, setCreateOpen] = useState(false);

	const { page, setPage } = usePaginationControls({
		pageParamKey: SPECIALTY_PARAMS.PAGE,
		defaultLimit: PAGE_SIZE,
	});

	const { localSearch, searchFromUrl, handleSearchChange, hasActiveSearch } =
		useDebouncedSearch({
			paramKey: SPECIALTY_PARAMS.SEARCH,
			pageParamKey: SPECIALTY_PARAMS.PAGE,
		});

	const { data: paginated } = useSpecialtiesPaginated(
		page,
		PAGE_SIZE,
		searchFromUrl,
	);

	const { data: items, total, totalPages } = paginated;

	const tableRows: SpecialtyTableRowType[] = useMemo(
		() =>
			items.map((specialty) => ({
				...specialty,
				group: specialty.group ?? undefined,
				description: specialty.description ?? undefined,
				linkedOccupations: specialty.occupationSpecialties.map(
					(os) => os.occupation.acronym ?? "",
				),
			})),
		[items],
	);

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Specialties"
				total={total}
				itemLabel="specialty"
				itemLabelPlural="specialties"
				countText={
					hasActiveSearch
						? `${total} item${total !== 1 ? "s" : ""} match${total !== 1 ? "" : "es"}`
						: `${total} ${total === 1 ? "specialty" : "specialties"} total`
				}
				actions={
					canCreateSpecialty
						? [
								{
									key: "add",
									icon: <Plus data-icon="inline-start" />,
									label: "Add Specialty",
									className: "font-semibold",
									onClick: () => setCreateOpen(true),
								},
							]
						: []
				}
				search={{
					value: localSearch,
					onChange: handleSearchChange,
					placeholder: "Search specialties...",
				}}
			/>

			{total === 0 ? (
				<ConfigPageEmptyState
					hasSearch={hasActiveSearch}
					emptyTitle="No specialties found."
					emptyMessage="There are no specialties to show yet."
					searchEmptyMessage="There are no specialties that match your search."
				/>
			) : (
				<>
					<SpecialtiesTableWrapper
						data={tableRows}
						rawData={items}
						canEdit={ability.can(Action.Update, "Specialty")}
						canDelete={ability.can(Action.Delete, "Specialty")}
					/>

					<ConfigPagePagination
						page={page}
						totalPages={totalPages}
						onPageChange={setPage}
					/>
				</>
			)}

			<SpecialtyFormDialog open={createOpen} onOpenChange={setCreateOpen} />
		</div>
	);
}
