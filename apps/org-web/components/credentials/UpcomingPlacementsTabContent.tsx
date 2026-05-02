"use client";

import { ConfigPageEmptyState } from "@repo/ui/general/ConfigPageEmptyState";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { SearchWithFilters } from "@repo/ui/shared/SearchWithFilters";
import { useRouter } from "next/navigation";
import { UPCOMING_PLACEMENT_STAT_CARDS } from "@/constants/credentials";
import { useUpcomingPlacementColumns } from "@/hooks/tables/use-upcoming-placement-columns";
import { useUpcomingPlacements } from "@/hooks/use-upcoming-placements";
import { StatusStatCard } from "./StatusStatCard";

export const UpcomingPlacementsTabContent = () => {
	const router = useRouter();
	const {
		activeStatKey,
		countsByStat,
		upcomingPlacementRows,
		totalCount,
		page,
		limit,
		onPaginationChange,
		search,
		setSearch,
		toggleStatFilter,
		filtersExpanded,
		setFiltersExpanded,
		filterConfigs,
	} = useUpcomingPlacements();

	const { columns } = useUpcomingPlacementColumns({
		onViewDetails: (item) => {
			router.push(`/org/credentials/details/upcoming-placement/${item.id}`);
		},
	});

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
				{UPCOMING_PLACEMENT_STAT_CARDS.map((card) => (
					<StatusStatCard
						key={card.key}
						card={card}
						count={countsByStat[card.key]}
						isActive={activeStatKey === card.key}
						onClick={() => toggleStatFilter(card.key)}
					/>
				))}
			</div>

			<SearchWithFilters
				searchPlaceholder="Search by candidate, role, location, or missing items..."
				searchValue={search}
				onSearchChange={setSearch}
				filtersExpanded={filtersExpanded}
				onFiltersExpandedChange={setFiltersExpanded}
				filterConfigs={filterConfigs}
			/>

			<CustomTable
				data={upcomingPlacementRows}
				columns={columns}
				enableSorting={false}
				paginationMode="server"
				totalCount={totalCount}
				currentPage={page}
				pageSize={limit}
				onPaginationChange={onPaginationChange}
				emptyState={
					<ConfigPageEmptyState
						hasSearch={false}
						emptyTitle="No upcoming placements found"
						emptyMessage="Try switching the selected status card."
					/>
				}
			/>
		</div>
	);
};
