"use client";

import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@repo/ui/components/tabs";
import { ConfigPageEmptyState } from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import PaginationControls from "@repo/ui/general/PaginationControls";
import { ScrollableLineTabsRow } from "@repo/ui/general/ScrollableLineTabsRow";
import { SearchWithFilters } from "@repo/ui/shared/SearchWithFilters";
import { CalendarCheck, CalendarClock, CalendarMinus } from "lucide-react";
import { CANDIDATE_PORTAL_COPY } from "@/constants/candidate-portal";
import {
	type CandidatePlacementsTab,
	useCandidatePortalPlacementsList,
} from "@/hooks/candidate/use-candidate-portal-placements-list";
import type { CandidatePlacementListItem } from "@/types/candidate-placement";
import { candidatePlacementDetailPath } from "@/utils/candidate-portal-routes";
import { CandidatePlacementCard } from "./CandidatePlacementCard";
import { CandidatePortalContentSkeleton } from "./CandidatePortalContentSkeleton";

const TAB_META: Record<
	CandidatePlacementsTab,
	{ label: string; icon: typeof CalendarCheck }
> = {
	active: { label: "Active", icon: CalendarCheck },
	upcoming: { label: "Upcoming", icon: CalendarClock },
	past: { label: "Past", icon: CalendarMinus },
};

interface PlacementsTabPanelProps {
	rows: CandidatePlacementListItem[];
	pagination: {
		currentPage: number;
		pageCount: number;
		goToPage: (page: number) => void;
		limit: number;
		setLimit: (limit: number) => void;
		totalItems: number;
	};
	pageSizeOptions: number[];
	isInternal: boolean;
	hasSearch: boolean;
	emptyTitle: string;
	emptyMessage: string;
	emptyIcon: typeof CalendarCheck;
	showInternalWorkforceBadge?: boolean;
}

function PlacementsTabPanel({
	rows,
	pagination,
	pageSizeOptions,
	isInternal,
	hasSearch,
	emptyTitle,
	emptyMessage,
	emptyIcon,
	showInternalWorkforceBadge = true,
}: Readonly<PlacementsTabPanelProps>) {
	if (rows.length === 0) {
		return (
			<ConfigPageEmptyState
				className="py-12"
				hasSearch={hasSearch}
				searchEmptyTitle="No placements match your search"
				searchEmptyMessage="Try adjusting keywords or clearing filters."
				emptyTitle={emptyTitle}
				emptyMessage={emptyMessage}
				icon={emptyIcon}
			/>
		);
	}

	return (
		<div className="space-y-4">
			{rows.map((p) => (
				<CandidatePlacementCard
					key={p.id}
					placement={p}
					viewDetailsHref={candidatePlacementDetailPath(p.id)}
					isInternalWorkforce={showInternalWorkforceBadge ? isInternal : false}
				/>
			))}
			<PaginationControls
				{...pagination}
				pageSizeOptions={pageSizeOptions}
				itemLabel="placement"
				itemLabelPlural="placements"
			/>
		</div>
	);
}

export function PlacementsPageContent() {
	const {
		organizationId,
		orgLoading,
		listQuery,
		tab,
		setTab,
		isInternal,
		counts,
		totals,
		active,
		upcoming,
		past,
		pageSizeOptions,
		searchValue,
		setSearchValue,
		hasActiveSearch,
		hasActiveFilters,
		filterConfigs,
		filtersExpanded,
		setFiltersExpanded,
	} = useCandidatePortalPlacementsList();

	if (orgLoading || (organizationId && listQuery.isPending)) {
		return <CandidatePortalContentSkeleton />;
	}

	if (!organizationId) {
		return (
			<p className="text-muted-foreground py-12 text-center text-sm">
				{CANDIDATE_PORTAL_COPY.needOrganization}
			</p>
		);
	}

	if (listQuery.isError) {
		return (
			<p className="text-destructive text-sm">
				{listQuery.error instanceof Error
					? listQuery.error.message
					: CANDIDATE_PORTAL_COPY.couldNotLoadPlacementsList}
			</p>
		);
	}

	if (!listQuery.data) {
		return (
			<p className="text-destructive text-sm">
				{CANDIDATE_PORTAL_COPY.couldNotLoadPlacementsList}
			</p>
		);
	}

	const hasSearchOrFilters = hasActiveSearch || hasActiveFilters;

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="My Placements"
				total={totals.total}
				itemLabel="placement"
				itemLabelPlural="placements"
				description="Track your active, upcoming, and past assignments"
			/>

			<SearchWithFilters
				searchPlaceholder="Search by job title or location..."
				searchValue={searchValue}
				onSearchChange={setSearchValue}
				filtersExpanded={filtersExpanded}
				onFiltersExpandedChange={setFiltersExpanded}
				filterConfigs={filterConfigs}
			/>

			<Tabs
				value={tab}
				onValueChange={(v) => setTab(v as CandidatePlacementsTab)}
				className="w-full flex-col space-y-6"
			>
				<ScrollableLineTabsRow>
					<TabsList
						variant="line"
						className="inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-0 rounded-none border-0 bg-transparent p-0"
					>
						{(Object.keys(TAB_META) as CandidatePlacementsTab[]).map((id) => {
							const { label, icon: Icon } = TAB_META[id];
							return (
								<TabsTrigger
									key={id}
									value={id}
									className="inline-flex flex-none items-center gap-1.5 px-2 text-sm sm:gap-2 sm:px-3"
								>
									<Icon className="size-4" />
									{label}
									<span className="ml-1 text-xs opacity-70">
										({counts[id]})
									</span>
								</TabsTrigger>
							);
						})}
					</TabsList>
				</ScrollableLineTabsRow>

				<TabsContent value="active">
					<PlacementsTabPanel
						rows={active.rows}
						pagination={active.pagination}
						pageSizeOptions={pageSizeOptions}
						isInternal={isInternal}
						hasSearch={hasSearchOrFilters}
						emptyTitle={CANDIDATE_PORTAL_COPY.placementsSectionActiveEmptyTitle}
						emptyMessage={
							CANDIDATE_PORTAL_COPY.placementsSectionActiveEmptyDescription
						}
						emptyIcon={CalendarCheck}
					/>
				</TabsContent>

				<TabsContent value="upcoming">
					<PlacementsTabPanel
						rows={upcoming.rows}
						pagination={upcoming.pagination}
						pageSizeOptions={pageSizeOptions}
						isInternal={isInternal}
						hasSearch={hasSearchOrFilters}
						emptyTitle={
							CANDIDATE_PORTAL_COPY.placementsSectionUpcomingEmptyTitle
						}
						emptyMessage={
							CANDIDATE_PORTAL_COPY.placementsSectionUpcomingEmptyDescription
						}
						emptyIcon={CalendarClock}
					/>
				</TabsContent>

				<TabsContent value="past">
					<PlacementsTabPanel
						rows={past.rows}
						pagination={past.pagination}
						pageSizeOptions={pageSizeOptions}
						isInternal={isInternal}
						hasSearch={hasSearchOrFilters}
						showInternalWorkforceBadge={false}
						emptyTitle={CANDIDATE_PORTAL_COPY.placementsSectionPastEmptyTitle}
						emptyMessage={
							CANDIDATE_PORTAL_COPY.placementsSectionPastEmptyDescription
						}
						emptyIcon={CalendarMinus}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}
