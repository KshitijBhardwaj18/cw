"use client";

import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useSearchWithFilters } from "@repo/ui/hooks/use-search-with-filters";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useCandidateOrganizationId } from "@/hooks/candidate/use-candidate-organization-id";
import { useCandidatePlacementsList } from "@/queries/candidate-placements.queries";
import type { CandidatePlacementListItem } from "@/types/candidate-placement";

export const CANDIDATE_PLACEMENTS_TABS = [
	"active",
	"upcoming",
	"past",
] as const;
export type CandidatePlacementsTab = (typeof CANDIDATE_PLACEMENTS_TABS)[number];

export const CP_PLACEMENTS_PARAMS = {
	TAB: "cpPlTab",
	SEARCH: "cpPlSearch",
	LOCATION: "cpPlLocation",
	ACTIVE_PAGE: "cpPlActPage",
	ACTIVE_LIMIT: "cpPlActLimit",
	UPCOMING_PAGE: "cpPlUpPage",
	UPCOMING_LIMIT: "cpPlUpLimit",
	PAST_PAGE: "cpPlPstPage",
	PAST_LIMIT: "cpPlPstLimit",
} as const;

const DEFAULT_LIMIT = 5;
const PAGE_SIZE_OPTIONS = [5, 10, 15, 20];

const PAGE_PARAM_KEYS = [
	CP_PLACEMENTS_PARAMS.ACTIVE_PAGE,
	CP_PLACEMENTS_PARAMS.UPCOMING_PAGE,
	CP_PLACEMENTS_PARAMS.PAST_PAGE,
];

function uniqueOptions(
	rows: CandidatePlacementListItem[],
	pick: (r: CandidatePlacementListItem) => string | undefined,
): { value: string; label: string }[] {
	const set = new Set<string>();
	for (const r of rows) {
		const v = pick(r)?.trim();
		if (v) set.add(v);
	}
	return Array.from(set)
		.sort((a, b) => a.localeCompare(b))
		.map((v) => ({ value: v, label: v }));
}

function matchesSearch(row: CandidatePlacementListItem, q: string): boolean {
	if (!q) return true;
	const needle = q.toLowerCase();
	return (
		row.jobTitle.toLowerCase().includes(needle) ||
		row.employerName.toLowerCase().includes(needle) ||
		row.locationLabel.toLowerCase().includes(needle)
	);
}

export function useCandidatePortalPlacementsList() {
	const {
		organizationId,
		isLoading: orgLoading,
		isReady,
	} = useCandidateOrganizationId();

	const listQuery = useCandidatePlacementsList({
		enabled: Boolean(organizationId) && isReady,
	});

	const router = useRouter();
	const searchParams = useSearchParams();
	const rawTab = searchParams.get(CP_PLACEMENTS_PARAMS.TAB);
	const tab: CandidatePlacementsTab = (
		CANDIDATE_PLACEMENTS_TABS as readonly string[]
	).includes(rawTab ?? "")
		? (rawTab as CandidatePlacementsTab)
		: "active";

	const setTab = useCallback(
		(next: CandidatePlacementsTab) => {
			const params = new URLSearchParams(searchParams.toString());
			if (next === "active") {
				params.delete(CP_PLACEMENTS_PARAMS.TAB);
			} else {
				params.set(CP_PLACEMENTS_PARAMS.TAB, next);
			}
			const qs = params.toString();
			router.replace(qs ? `?${qs}` : "?");
		},
		[router, searchParams],
	);

	const activeAll = listQuery.data?.active ?? [];
	const upcomingAll = listQuery.data?.upcoming ?? [];
	const pastAll = listQuery.data?.past ?? [];

	const allRows = useMemo(
		() => [...activeAll, ...upcomingAll, ...pastAll],
		[activeAll, upcomingAll, pastAll],
	);

	const locationOptions = useMemo(
		() => uniqueOptions(allRows, (r) => r.locationLabel),
		[allRows],
	);

	const {
		searchValue,
		searchFromUrl,
		handleSearchChange,
		filterConfigs: hookFilterConfigs,
		values: filterValues,
		hasActiveSearch,
	} = useSearchWithFilters({
		search: {
			paramKey: CP_PLACEMENTS_PARAMS.SEARCH,
			alsoClearParamKeys: PAGE_PARAM_KEYS,
		},
		pagination: { pageParamKey: CP_PLACEMENTS_PARAMS.ACTIVE_PAGE },
		filters: [
			{
				id: CP_PLACEMENTS_PARAMS.LOCATION,
				label: "Location",
				type: "select",
				defaultValue: "all",
				placeholder: "All locations",
				options: [{ value: "all", label: "All locations" }, ...locationOptions],
			},
		],
	});

	const [filtersExpanded, setFiltersExpanded] = useState(false);

	const locationFilter = (filterValues[CP_PLACEMENTS_PARAMS.LOCATION] ??
		"all") as string;

	const resetAllTabPages = useCallback(() => {
		const params = new URLSearchParams(searchParams.toString());
		let changed = false;
		for (const key of PAGE_PARAM_KEYS) {
			if (params.has(key)) {
				params.delete(key);
				changed = true;
			}
		}
		if (changed) {
			const qs = params.toString();
			router.replace(qs ? `?${qs}` : "?");
		}
	}, [router, searchParams]);

	const filterConfigs = useMemo(
		() =>
			hookFilterConfigs.map((cfg) => ({
				...cfg,
				onValueChange: (v: string) => {
					cfg.onValueChange(v);
					resetAllTabPages();
				},
			})),
		[hookFilterConfigs, resetAllTabPages],
	);

	const applyFilters = useCallback(
		(rows: CandidatePlacementListItem[]) => {
			const q = searchFromUrl.trim();
			return rows.filter((r) => {
				if (locationFilter !== "all" && r.locationLabel !== locationFilter)
					return false;
				return matchesSearch(r, q);
			});
		},
		[searchFromUrl, locationFilter],
	);

	const activeFiltered = useMemo(
		() => applyFilters(activeAll),
		[applyFilters, activeAll],
	);
	const upcomingFiltered = useMemo(
		() => applyFilters(upcomingAll),
		[applyFilters, upcomingAll],
	);
	const pastFiltered = useMemo(
		() => applyFilters(pastAll),
		[applyFilters, pastAll],
	);

	const activePagination = usePaginationControls({
		pageParamKey: CP_PLACEMENTS_PARAMS.ACTIVE_PAGE,
		limitParamKey: CP_PLACEMENTS_PARAMS.ACTIVE_LIMIT,
		defaultLimit: DEFAULT_LIMIT,
		totalItems: activeFiltered.length,
		pageSizeOptions: PAGE_SIZE_OPTIONS,
	});
	const upcomingPagination = usePaginationControls({
		pageParamKey: CP_PLACEMENTS_PARAMS.UPCOMING_PAGE,
		limitParamKey: CP_PLACEMENTS_PARAMS.UPCOMING_LIMIT,
		defaultLimit: DEFAULT_LIMIT,
		totalItems: upcomingFiltered.length,
		pageSizeOptions: PAGE_SIZE_OPTIONS,
	});
	const pastPagination = usePaginationControls({
		pageParamKey: CP_PLACEMENTS_PARAMS.PAST_PAGE,
		limitParamKey: CP_PLACEMENTS_PARAMS.PAST_LIMIT,
		defaultLimit: DEFAULT_LIMIT,
		totalItems: pastFiltered.length,
		pageSizeOptions: PAGE_SIZE_OPTIONS,
	});

	const activePage = useMemo(() => {
		const start = (activePagination.page - 1) * activePagination.limit;
		return activeFiltered.slice(start, start + activePagination.limit);
	}, [activeFiltered, activePagination.page, activePagination.limit]);

	const upcomingPage = useMemo(() => {
		const start = (upcomingPagination.page - 1) * upcomingPagination.limit;
		return upcomingFiltered.slice(start, start + upcomingPagination.limit);
	}, [upcomingFiltered, upcomingPagination.page, upcomingPagination.limit]);

	const pastPage = useMemo(() => {
		const start = (pastPagination.page - 1) * pastPagination.limit;
		return pastFiltered.slice(start, start + pastPagination.limit);
	}, [pastFiltered, pastPagination.page, pastPagination.limit]);

	const activePageCount = Math.max(
		1,
		Math.ceil(activeFiltered.length / activePagination.limit),
	);
	const upcomingPageCount = Math.max(
		1,
		Math.ceil(upcomingFiltered.length / upcomingPagination.limit),
	);
	const pastPageCount = Math.max(
		1,
		Math.ceil(pastFiltered.length / pastPagination.limit),
	);

	const hasActiveFilters = locationFilter !== "all";

	return {
		organizationId,
		orgLoading,
		listQuery,

		tab,
		setTab,

		isInternal: listQuery.data?.isInternal ?? false,

		searchValue,
		setSearchValue: handleSearchChange,
		hasActiveSearch,
		hasActiveFilters,
		filterConfigs,
		filtersExpanded,
		setFiltersExpanded,

		counts: {
			active: activeFiltered.length,
			upcoming: upcomingFiltered.length,
			past: pastFiltered.length,
		},
		totals: {
			active: activeAll.length,
			upcoming: upcomingAll.length,
			past: pastAll.length,
			total: allRows.length,
		},

		active: {
			rows: activePage,
			pagination: {
				currentPage: activePagination.page,
				pageCount: activePageCount,
				goToPage: activePagination.setPage,
				limit: activePagination.limit,
				setLimit: activePagination.setLimit,
				totalItems: activeFiltered.length,
			},
		},
		upcoming: {
			rows: upcomingPage,
			pagination: {
				currentPage: upcomingPagination.page,
				pageCount: upcomingPageCount,
				goToPage: upcomingPagination.setPage,
				limit: upcomingPagination.limit,
				setLimit: upcomingPagination.setLimit,
				totalItems: upcomingFiltered.length,
			},
		},
		past: {
			rows: pastPage,
			pagination: {
				currentPage: pastPagination.page,
				pageCount: pastPageCount,
				goToPage: pastPagination.setPage,
				limit: pastPagination.limit,
				setLimit: pastPagination.setLimit,
				totalItems: pastFiltered.length,
			},
		},

		pageSizeOptions: PAGE_SIZE_OPTIONS,
	};
}
