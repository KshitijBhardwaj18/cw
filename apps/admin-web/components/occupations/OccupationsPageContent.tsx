"use client";

import { Action } from "@repo/casl";
import { ConfigPageEmptyState } from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { ConfigPagePagination } from "@repo/ui/general/ConfigPagePagination";
import { useConfigPageSearch } from "@repo/ui/hooks/use-config-page-search";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts";
import { useOccupationsPaginated } from "@/queries/occupations.query";
import { OccupationFormDialog } from "./OccupationFormDialog";
import { OccupationsTableWrapper } from "./OccupationsTableWrapper";

const PAGE_SIZE = 10;

export const OccupationsPageContent = () => {
	const { ability } = useAuth();
	const canCreateOccupation = ability.can(Action.Create, "Occupation");
	const [createOpen, setCreateOpen] = useState(false);
	const router = useRouter();
	const {
		page,
		searchFromUrl,
		hasActiveSearch,
		localSearch,
		handleSearchChange,
		buildSearchParams,
	} = useConfigPageSearch();

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
						onPageChange={(p) => router.push(buildSearchParams({ page: p }))}
					/>
				</>
			)}

			<OccupationFormDialog open={createOpen} onOpenChange={setCreateOpen} />
		</div>
	);
};
