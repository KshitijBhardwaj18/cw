"use client";

import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useSearchWithFilters } from "@repo/ui/hooks/use-search-with-filters";
import { useMemo, useState } from "react";
import type { PlacementsQuery } from "@/services/placements.service";

export const PLACEMENT_PARAMS = {
	PAGE: "plPage",
	LIMIT: "limit",
	SEARCH: "plSearch",
	COMPLIANCE: "compliance",
	VENDOR: "vendor",
} as const;

export interface UsePlacementFiltersOptions {
	debounceMs?: number;
	defaultLimit?: number;
	pageSizeOptions?: number[];
}

export function usePlacementFilters(options?: UsePlacementFiltersOptions) {
	const defaultLimit = options?.defaultLimit ?? 6;
	const pageSizeOptions = options?.pageSizeOptions;

	const { page, setPage, limit, setLimit } = usePaginationControls({
		pageParamKey: PLACEMENT_PARAMS.PAGE,
		limitParamKey: PLACEMENT_PARAMS.LIMIT,
		defaultLimit,
		...(pageSizeOptions ? { pageSizeOptions } : {}),
	});

	const {
		searchValue: localSearch,
		handleSearchChange,
		searchFromUrl,
		values,
		filterConfigs,
	} = useSearchWithFilters({
		search: { paramKey: PLACEMENT_PARAMS.SEARCH },
		pagination: { pageParamKey: PLACEMENT_PARAMS.PAGE },
		filters: [
			{
				id: PLACEMENT_PARAMS.COMPLIANCE,
				label: "Compliance Status",
				type: "select",
				defaultValue: "all",
				options: [
					{ value: "all", label: "All Status" },
					{ value: "complete", label: "Complete" },
					{ value: "incomplete", label: "Incomplete" },
				],
			},
			{
				id: PLACEMENT_PARAMS.VENDOR,
				label: "Vendor",
				type: "select",
				defaultValue: "all",
			},
		],
	});

	const [filtersExpanded, setFiltersExpanded] = useState(false);

	const complianceFilter = values[PLACEMENT_PARAMS.COMPLIANCE] || "all";
	const vendorFilter = values[PLACEMENT_PARAMS.VENDOR] || "all";

	const query = useMemo<Omit<PlacementsQuery, "tab" | "fixedVendorId">>(
		() => ({
			search: searchFromUrl.trim() || undefined,
			compliance: complianceFilter !== "all" ? complianceFilter : undefined,
			vendorId: vendorFilter !== "all" ? vendorFilter : undefined,
			page,
			limit,
		}),
		[searchFromUrl, complianceFilter, vendorFilter, page, limit],
	);

	return {
		search: localSearch,
		setSearch: handleSearchChange,
		filtersExpanded,
		setFiltersExpanded,
		page,
		setPage,
		limit,
		setLimit,
		complianceFilter,
		vendorFilter,
		query,
		filterConfigs,
	};
}
