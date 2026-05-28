"use client";

import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { Skeleton } from "@repo/ui/components/skeleton";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import PaginationControls from "@repo/ui/general/PaginationControls";
import { SearchWithFilters } from "@repo/ui/shared/SearchWithFilters";
import { AlertCircle } from "lucide-react";
import { useQueryState } from "nuqs";
import { useMemo } from "react";
import { useVendorOrgSession } from "@/components/vendor-layout/VendorOrgBridge";
import { PLACEMENT_STATUS_FILTER_OPTIONS } from "@/constants/placements";
import { useVendorPlacementListColumns } from "@/hooks/tables/use-vendor-placement-list-columns";
import {
	TABLE_DEFAULT_LIMIT,
	TABLE_PAGE_SIZE_OPTIONS,
	usePlacementsPage,
} from "@/hooks/use-placements-page";
import type { PlacementTab } from "@/types/placement";
import type {
	PlacementMetricStats,
	PlacementTabCounts,
	PlacementTabValue,
} from "@/types/placements";
import { mapPlacementCardToVendorTableRow } from "@/utils/map-placement-card-to-vendor-table-row";
import { PlacementsMetricCards } from "./PlacementsMetricCards";
import { PlacementsTabsSection } from "./PlacementsTabsSection";

interface VendorPlacementsDashboardContentProps {
	detailBasePath: string;
}

export function VendorPlacementsDashboardContent({
	detailBasePath,
}: Readonly<VendorPlacementsDashboardContentProps>) {
	const { vendorId } = useVendorOrgSession();
	const {
		activeTab,
		handleTabChange,
		placementCounts,
		tabCounts,
		placements,
		totalCount,
		pageCount,
		isPlacementsLoading,
		isCountsLoading,
		isError,
		search,
		setSearch,
		filtersExpanded,
		setFiltersExpanded,
		page,
		setPage,
		limit,
		setLimit,
		pageSizeOptions,
	} = usePlacementsPage({
		fixedVendorId: vendorId,
		defaultLimit: TABLE_DEFAULT_LIMIT,
		pageSizeOptions: TABLE_PAGE_SIZE_OPTIONS,
	});

	const [statusFilter, setStatusFilter] = useQueryState("plStatus", {
		defaultValue: "all",
	});

	const columns = useVendorPlacementListColumns(detailBasePath);

	const metricStats: PlacementMetricStats = useMemo(
		() => ({
			totalPlacements: placementCounts.total,
			active: placementCounts.active,
			endingSoon: placementCounts.endingSoon,
			completed: placementCounts.completed,
		}),
		[placementCounts],
	);

	const filteredRows = useMemo(() => {
		const mapped = placements.map(mapPlacementCardToVendorTableRow);
		return mapped.filter((row) => {
			if (statusFilter !== "all" && row.status !== statusFilter) return false;
			return true;
		});
	}, [placements, statusFilter]);

	const filterConfigs = useMemo(
		() => [
			{
				id: "placement-status",
				label: "Status",
				value: statusFilter,
				onValueChange: (v: string) => setStatusFilter(v || "all"),
				placeholder: "All Statuses",
				options: PLACEMENT_STATUS_FILTER_OPTIONS,
			},
		],
		[statusFilter, setStatusFilter],
	);

	const handleTabChangeWrapped = (value: string) => {
		handleTabChange(value as PlacementTab);
		setStatusFilter("all");
	};

	if (isError) {
		return (
			<Empty className="border py-16">
				<EmptyMedia variant="icon">
					<AlertCircle />
				</EmptyMedia>
				<EmptyHeader>
					<EmptyTitle>Failed to load placements</EmptyTitle>
					<EmptyDescription>Please try again.</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	const countsForTab: PlacementTabCounts = tabCounts;

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Placement Dashboard"
				total={isCountsLoading ? placementCounts.total : filteredRows.length}
				itemLabel="placement"
				itemLabelPlural="placements"
				description="Track all active candidate assignments and placements"
			/>

			{isCountsLoading ? (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-28 w-full rounded-lg" />
					))}
				</div>
			) : (
				<PlacementsMetricCards stats={metricStats} />
			)}

			<SearchWithFilters
				searchPlaceholder="Search by candidate, job, organization, or department..."
				searchValue={search}
				onSearchChange={setSearch}
				filtersExpanded={filtersExpanded}
				onFiltersExpandedChange={setFiltersExpanded}
				filterConfigs={filterConfigs}
			/>

			{isCountsLoading ? (
				<div className="space-y-4">
					<Skeleton className="h-10 w-full max-w-md rounded-md" />
					<Skeleton className="h-72 w-full rounded-lg" />
				</div>
			) : (
				<>
					<PlacementsTabsSection
						activeTab={activeTab as PlacementTabValue}
						onTabChange={handleTabChangeWrapped}
						tabCounts={countsForTab}
						table={{
							rows: filteredRows,
							columns,
							totalFiltered: filteredRows.length,
							isLoading: isPlacementsLoading,
						}}
					/>
					<PaginationControls
						currentPage={page}
						pageCount={pageCount}
						goToPage={setPage}
						limit={limit}
						setLimit={setLimit}
						pageSizeOptions={pageSizeOptions}
						totalItems={totalCount}
						itemLabel="placement"
						itemLabelPlural="placements"
					/>
				</>
			)}
		</div>
	);
}
