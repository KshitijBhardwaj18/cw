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
import { SearchWithFilters } from "@repo/ui/shared/SearchWithFilters";
import { AlertCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { useVendorOrgSession } from "@/components/vendor-layout/VendorOrgBridge";
import { PLACEMENT_STATUS_FILTER_OPTIONS } from "@/constants/placements";
import { useVendorPlacementListColumns } from "@/hooks/tables/use-vendor-placement-list-columns";
import { usePlacementsPage } from "@/hooks/use-placements-page";
import type { PlacementTab } from "@/types/placement";
import type {
	PlacementListMockRow,
	PlacementMetricStats,
	PlacementTabCounts,
	PlacementTabValue,
} from "@/types/placements";
import { mapPlacementCardToVendorTableRow } from "@/utils/map-placement-card-to-vendor-table-row";
import { PlacementBottomSummaryCard } from "./PlacementBottomSummaryCard";
import { PlacementsMetricCards } from "./PlacementsMetricCards";
import { PlacementsTabsSection } from "./PlacementsTabsSection";

function rowMatchesTab(row: PlacementListMockRow, tab: PlacementTab): boolean {
	if (tab === "upcoming") return row.status === "upcoming";
	if (tab === "active") {
		return row.status === "active" || row.status === "ending_soon";
	}
	return row.status === "completed";
}

interface VendorPlacementsDashboardContentProps {
	detailBasePath: string;
}

export function VendorPlacementsDashboardContent({
	detailBasePath,
}: VendorPlacementsDashboardContentProps) {
	const { vendorId } = useVendorOrgSession();
	const {
		activeTab,
		handleTabChange,
		placementCounts,
		tabCounts,
		placements,
		isLoading,
		isError,
		search,
		setSearch,
		filtersExpanded,
		setFiltersExpanded,
	} = usePlacementsPage({ fixedVendorId: vendorId });

	const [statusFilter, setStatusFilter] = useState("all");

	const columns = useVendorPlacementListColumns(detailBasePath);

	const metricStats: PlacementMetricStats = useMemo(
		() => ({
			totalPlacements: placementCounts.total,
			active: placementCounts.activeOnly,
			endingSoon: placementCounts.endingSoon,
			completed: placementCounts.completed,
		}),
		[placementCounts],
	);

	const filteredRows = useMemo(() => {
		const mapped = placements.map(mapPlacementCardToVendorTableRow);
		const q = search.trim().toLowerCase();
		return mapped.filter((row) => {
			if (!rowMatchesTab(row, activeTab)) return false;
			if (statusFilter !== "all" && row.status !== statusFilter) return false;
			if (!q) return true;
			const hay = [
				row.candidateName,
				row.displayId,
				row.jobTitle,
				row.department,
				row.location,
			]
				.join(" ")
				.toLowerCase();
			return hay.includes(q);
		});
	}, [placements, activeTab, statusFilter, search]);

	const filterConfigs = useMemo(
		() => [
			{
				id: "placement-status",
				label: "Status",
				value: statusFilter,
				onValueChange: setStatusFilter,
				placeholder: "All Statuses",
				options: PLACEMENT_STATUS_FILTER_OPTIONS,
			},
		],
		[statusFilter],
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
				total={isLoading ? placementCounts.total : filteredRows.length}
				itemLabel="placement"
				itemLabelPlural="placements"
				description="Track all active candidate assignments and placements"
			/>

			{isLoading ? (
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

			{isLoading ? (
				<div className="space-y-4">
					<Skeleton className="h-10 w-full max-w-md rounded-md" />
					<Skeleton className="h-72 w-full rounded-lg" />
				</div>
			) : (
				<PlacementsTabsSection
					activeTab={activeTab as PlacementTabValue}
					onTabChange={handleTabChangeWrapped}
					tabCounts={countsForTab}
					table={{
						rows: filteredRows,
						columns,
						totalFiltered: filteredRows.length,
					}}
				/>
			)}

			{!isLoading ? <PlacementBottomSummaryCard stats={metricStats} /> : null}
		</div>
	);
}
