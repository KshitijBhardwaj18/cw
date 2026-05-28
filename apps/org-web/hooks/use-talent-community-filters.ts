"use client";

import { CANDIDATE_WORKFORCE_TYPE_OPTIONS } from "@repo/shared";
import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useSearchWithFilters } from "@repo/ui/hooks/use-search-with-filters";
import { useCallback, useMemo, useState } from "react";
import type {
	TalentCommunityQuery,
	TalentCommunityTab,
} from "@/services/talent-community.service";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export interface UseTalentCommunityFiltersOptions {
	pageSize?: number;
	activeTab?: TalentCommunityTab;
}

export const TALENT_COMMUNITY_PARAMS = {
	PAGE: "tcPage",
	LIMIT: "tcLimit",
	SEARCH: "tcSearch",
	WORKFORCE_TYPE: "tcWfType",
	INVITE_STATUS: "tcInvite",
	PLACEMENT_STATUS: "tcPlacement",
} as const;

export function useTalentCommunityFilters(
	options?: UseTalentCommunityFiltersOptions,
) {
	const pageSize = options?.pageSize ?? DEFAULT_PAGE_SIZE;
	const activeTab = options?.activeTab;

	const { page, setPage, limit, setLimit } = usePaginationControls({
		pageParamKey: TALENT_COMMUNITY_PARAMS.PAGE,
		limitParamKey: TALENT_COMMUNITY_PARAMS.LIMIT,
		defaultLimit: pageSize,
		pageSizeOptions: PAGE_SIZE_OPTIONS,
	});

	const talentCommunityFilters = useMemo(
		() => [
			{
				id: TALENT_COMMUNITY_PARAMS.WORKFORCE_TYPE,
				label: "Workforce Type",
				type: "select" as const,
				defaultValue: "all",
				placeholder: "All",
				options: [
					{ value: "all", label: "All Types" },
					...CANDIDATE_WORKFORCE_TYPE_OPTIONS.map((o) => ({
						value: o.value,
						label: o.label,
					})),
				],
			},
			{
				id: TALENT_COMMUNITY_PARAMS.PLACEMENT_STATUS,
				label: "Placement Status",
				type: "select" as const,
				defaultValue: "all",
				placeholder: "All",
				options: [
					{ value: "all", label: "All Status" },
					{ value: "ACTIVE", label: "Active" },
					{ value: "UPCOMING", label: "Upcoming" },
					{ value: "ENDING_SOON", label: "Ending Soon" },
					{ value: "COMPLETED", label: "Completed" },
					{ value: "TERMINATED", label: "Terminated" },
					{ value: "ON_HOLD", label: "On Hold" },
					{ value: "PENDING", label: "Pending" },
					{ value: "INACTIVE", label: "Inactive" },
				],
			},
		],
		[],
	);

	const {
		searchValue: localSearch,
		searchFromUrl,
		handleSearchChange,
		values,
		filterConfigs: hookFilterConfigs,
		onFilterChange,
	} = useSearchWithFilters({
		pagination: { pageParamKey: TALENT_COMMUNITY_PARAMS.PAGE },
		search: { paramKey: TALENT_COMMUNITY_PARAMS.SEARCH },
		filters: activeTab === "talent-community" ? talentCommunityFilters : [],
	});

	const workforceTypeFilter =
		values[TALENT_COMMUNITY_PARAMS.WORKFORCE_TYPE] || "all";
	const placementStatusFilter =
		values[TALENT_COMMUNITY_PARAMS.PLACEMENT_STATUS] || "all";
	const statusFilter = values[TALENT_COMMUNITY_PARAMS.INVITE_STATUS] || "all";

	const [filtersExpanded, setFiltersExpanded] = useState(false);

	const setWorkforceTypeFilter = useCallback(
		(v: string) => {
			onFilterChange({
				[TALENT_COMMUNITY_PARAMS.WORKFORCE_TYPE]: v === "all" ? null : v,
			});
		},
		[onFilterChange],
	);

	const setPlacementStatusFilter = useCallback(
		(v: string) => {
			onFilterChange({
				[TALENT_COMMUNITY_PARAMS.PLACEMENT_STATUS]: v === "all" ? null : v,
			});
		},
		[onFilterChange],
	);

	const query = useMemo<Omit<TalentCommunityQuery, "tab">>(
		() => ({
			search: searchFromUrl?.trim() || undefined,
			workforceType:
				workforceTypeFilter !== "all" ? workforceTypeFilter : undefined,
			inviteStatus: statusFilter !== "all" ? statusFilter : undefined,
			placementStatus:
				placementStatusFilter !== "all" ? placementStatusFilter : undefined,
			page,
			limit,
		}),
		[
			searchFromUrl,
			workforceTypeFilter,
			statusFilter,
			placementStatusFilter,
			page,
			limit,
		],
	);

	return {
		search: localSearch,
		debouncedSearch: searchFromUrl,
		setSearch: handleSearchChange,
		filtersExpanded,
		setFiltersExpanded,
		page,
		setPage,
		pageSize: limit,
		setLimit,
		pageSizeOptions: PAGE_SIZE_OPTIONS,
		workforceTypeFilter,
		setWorkforceTypeFilter,
		placementStatusFilter,
		setPlacementStatusFilter,
		statusFilter,
		query,
		resetPage: () => setPage(1),
		filterConfigs: hookFilterConfigs,
	};
}
