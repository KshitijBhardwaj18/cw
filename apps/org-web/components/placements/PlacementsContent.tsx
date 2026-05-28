"use client";

import {
	Action,
	filterReadableTabs,
	PLACEMENT_TAB_CONDITIONS,
	type TabAbilityCheck,
	useAbility,
} from "@repo/casl";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import {
	ConfigPageEmptyState,
	ConfigPageErrorState,
} from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import PaginationControls from "@repo/ui/general/PaginationControls";
import { ScrollableLineTabsRow } from "@repo/ui/general/ScrollableLineTabsRow";
import { SearchWithFilters } from "@repo/ui/shared/SearchWithFilters";
import { AlertCircle, Briefcase } from "lucide-react";
import { useMemo } from "react";
import { AccessBlockedState } from "@/components/general/AccessBlockedState";
import {
	PAGE_SIZE_OPTIONS,
	PLACEMENT_TAB_ORDER,
	usePlacementsPage,
} from "@/hooks/use-placements-page";
import type { PlacementTab } from "@/types/placement";
import { PlacementCard } from "./PlacementCard";
import { PlacementsPageLoading } from "./PlacementsPageLoading";

const TAB_LABELS: Record<PlacementTab, string> = {
	upcoming: "Upcoming Placements",
	active: "Active Placements",
	completed: "Completed Placements",
};

const TAB_CHECKS: Record<PlacementTab, TabAbilityCheck> = {
	upcoming: {
		subject: "Placement",
		conditions: PLACEMENT_TAB_CONDITIONS.upcoming,
	},
	active: { subject: "Placement", conditions: PLACEMENT_TAB_CONDITIONS.active },
	completed: {
		subject: "Placement",
		conditions: PLACEMENT_TAB_CONDITIONS.completed,
	},
};

interface PlacementsContentProps {
	detailBasePath: string;
	fixedVendorId?: string;
	showEndAction: boolean;
}

export function PlacementsContent({
	detailBasePath,
	fixedVendorId,
	showEndAction,
}: Readonly<PlacementsContentProps>) {
	const ability = useAbility();
	const showEndPlacementAction =
		showEndAction && ability.can(Action.Update, "Placement");

	const allowedTabs = useMemo(
		() => filterReadableTabs(ability, PLACEMENT_TAB_ORDER, TAB_CHECKS),
		[ability],
	);

	const {
		activeTab,
		handleTabChange,
		tabCounts,
		placements,
		totalCount,
		pageCount,
		isPlacementsLoading,
		isError,
		search,
		setSearch,
		filtersExpanded,
		setFiltersExpanded,
		hasActiveFilters,
		page,
		setPage,
		limit,
		setLimit,
		filterConfigs,
	} = usePlacementsPage({ fixedVendorId, allowedTabs });

	if (allowedTabs.length === 0) {
		return (
			<div className="space-y-6">
				<ConfigPageHeader
					title="Placements"
					total={0}
					itemLabel="placement"
					itemLabelPlural="placements"
					description="Manage all placements across your organization."
				/>
				<AccessBlockedState description="You do not have permission to view any placement lists for this organization." />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Placements"
				total={totalCount}
				itemLabel="placement"
				itemLabelPlural="placements"
				description={
					hasActiveFilters
						? undefined
						: "Manage all placements across your organization."
				}
				countText={
					hasActiveFilters
						? `${totalCount} placement${totalCount !== 1 ? "s" : ""} match${totalCount === 1 ? "es" : ""}`
						: undefined
				}
			/>

			<Tabs
				value={activeTab}
				onValueChange={(v) => handleTabChange(v as PlacementTab)}
			>
				<ScrollableLineTabsRow>
					<TabsList
						variant="line"
						className="inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-0 rounded-none border-0 bg-transparent p-0"
					>
						{allowedTabs.map((tab) => (
							<TabsTrigger
								key={tab}
								value={tab}
								className="flex flex-none items-center gap-2 rounded-none border-0 px-4 py-3"
							>
								{TAB_LABELS[tab]}
								<span
									className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
										activeTab === tab
											? "bg-primary/10 text-primary"
											: "bg-muted text-muted-foreground"
									}`}
								>
									{isPlacementsLoading ? "—" : tabCounts[tab]}
								</span>
							</TabsTrigger>
						))}
					</TabsList>
				</ScrollableLineTabsRow>
			</Tabs>

			<SearchWithFilters
				searchPlaceholder="Search by candidate name or job title..."
				searchValue={search}
				onSearchChange={setSearch}
				filtersExpanded={filtersExpanded}
				onFiltersExpandedChange={setFiltersExpanded}
				filterConfigs={filterConfigs}
			/>

			{isPlacementsLoading ? (
				<PlacementsPageLoading />
			) : isError ? (
				<ConfigPageErrorState
					title="Failed to load placements"
					description="Please try again."
					icon={AlertCircle}
				/>
			) : placements.length === 0 ? (
				<ConfigPageEmptyState
					hasSearch={hasActiveFilters}
					searchEmptyTitle="No placements found"
					emptyTitle="No placements yet"
					searchEmptyMessage="Try adjusting your search or filters."
					emptyMessage={`No ${TAB_LABELS[activeTab].toLowerCase()} yet.`}
					icon={Briefcase}
				/>
			) : (
				<>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{placements.map((placement) => (
							<PlacementCard
								key={placement.id}
								placement={placement}
								detailBasePath={detailBasePath}
								showEndAction={showEndPlacementAction}
							/>
						))}
					</div>
					{totalCount > 0 && (
						<PaginationControls
							currentPage={page}
							pageCount={pageCount}
							goToPage={setPage}
							limit={limit}
							setLimit={setLimit}
							pageSizeOptions={PAGE_SIZE_OPTIONS}
							totalItems={totalCount}
							itemLabel="placement"
							itemLabelPlural="placements"
						/>
					)}
				</>
			)}
		</div>
	);
}
