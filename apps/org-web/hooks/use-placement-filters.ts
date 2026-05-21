"use client";

import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useSearchWithFilters } from "@repo/ui/hooks/use-search-with-filters";
import { useMemo, useState } from "react";
import type { PlacementsQuery } from "@/services/placements.service";

export const PLACEMENT_PARAMS = {
	PAGE: "plPage",
	LIMIT: "limit",
	SEARCH: "plSearch",
	WORKFORCE_TYPE: "workforceType",
	COMPLIANCE: "compliance",
	VENDOR: "vendor",
} as const;

export interface UsePlacementFiltersOptions {
	debounceMs?: number;
	defaultLimit?: number;
}

export function usePlacementFilters(options?: UsePlacementFiltersOptions) {
	const defaultLimit = options?.defaultLimit ?? 6;

	const { page, setPage, limit, setLimit } = usePaginationControls({
		pageParamKey: PLACEMENT_PARAMS.PAGE,
		limitParamKey: PLACEMENT_PARAMS.LIMIT,
		defaultLimit,
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
				id: PLACEMENT_PARAMS.WORKFORCE_TYPE,
				label: "Workforce Type",
				type: "select",
				defaultValue: "all",
				options: [
					{ value: "all", label: "All Types" },
					{ value: "INTERNAL_STAFF", label: "Internal Staff" },
					{ value: "PER_DIEM", label: "Per Diem" },
					{ value: "AGENCY_VENDOR", label: "Agency Vendor" },
					{ value: "TRAVEL_NURSES", label: "Travel Nurses" },
					{ value: "PREVIOUS_WORKERS", label: "Previous Workers" },
				],
			},
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

	const workforceTypeFilter = values[PLACEMENT_PARAMS.WORKFORCE_TYPE] || "all";
	const complianceFilter = values[PLACEMENT_PARAMS.COMPLIANCE] || "all";
	const vendorFilter = values[PLACEMENT_PARAMS.VENDOR] || "all";

	const query = useMemo<Omit<PlacementsQuery, "tab" | "fixedVendorId">>(
		() => ({
			search: searchFromUrl.trim() || undefined,
			workforceType:
				workforceTypeFilter !== "all" ? workforceTypeFilter : undefined,
			compliance: complianceFilter !== "all" ? complianceFilter : undefined,
			vendorId: vendorFilter !== "all" ? vendorFilter : undefined,
			page,
			limit,
		}),
		[
			searchFromUrl,
			workforceTypeFilter,
			complianceFilter,
			vendorFilter,
			page,
			limit,
		],
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
		workforceTypeFilter,
		complianceFilter,
		vendorFilter,
		query,
		filterConfigs,
	};
}
