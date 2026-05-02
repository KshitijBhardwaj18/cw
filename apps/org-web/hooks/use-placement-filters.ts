"use client";

import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { useUrlQueryState } from "@repo/ui/hooks/use-url-query-state";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { PlacementsQuery } from "@/services/placements.service";

export interface UsePlacementFiltersOptions {
	debounceMs?: number;
	defaultLimit?: number;
}

export function usePlacementFilters(options?: UsePlacementFiltersOptions) {
	const defaultLimit = options?.defaultLimit ?? 6;
	const searchParams = useSearchParams();
	const { pushParams } = useUrlQueryState();
	const { localSearch, searchFromUrl, handleSearchChange } = useDebouncedSearch(
		{ paramKey: "plSearch", pageParamKey: "plPage" },
	);

	const pageParam = Number(searchParams.get("plPage") ?? "1");
	const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

	const limitParam = Number(searchParams.get("limit") ?? String(defaultLimit));
	const limit =
		Number.isFinite(limitParam) && limitParam > 0 ? limitParam : defaultLimit;

	const [filtersExpanded, setFiltersExpanded] = useState(false);

	const workforceTypeFilter = searchParams.get("workforceType") ?? "all";
	const complianceFilter = searchParams.get("compliance") ?? "all";
	const vendorFilter = searchParams.get("vendor") ?? "all";

	const setWorkforceType = (v: string) => {
		pushParams({
			workforceType: !v || v === "all" ? null : v,
			plPage: null,
		});
	};
	const setCompliance = (v: string) => {
		pushParams({
			compliance: !v || v === "all" ? null : v,
			plPage: null,
		});
	};
	const setVendor = (v: string) => {
		pushParams({
			vendor: !v || v === "all" ? null : v,
			plPage: null,
		});
	};

	const setPage = (p: number) => {
		pushParams({ plPage: String(p) });
	};

	const setLimit = (l: number) => {
		pushParams({ limit: String(l), plPage: null });
	};

	const query = useMemo<Omit<PlacementsQuery, "tab">>(
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
		setWorkforceTypeFilter: setWorkforceType,
		complianceFilter,
		setComplianceFilter: setCompliance,
		vendorFilter,
		setVendorFilter: setVendor,
		query,
		resetPage: () => pushParams({ plPage: null }),
	};
}
