"use client";

import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useSearchWithFilters } from "@repo/ui/hooks/use-search-with-filters";
import { useCallback, useState } from "react";
import { VENDOR_CANDIDATE_STATUS_FILTER_OPTIONS } from "@/constants/vendor-candidates";
import { useVendorCandidateListColumns } from "@/hooks/tables/use-vendor-candidate-list-columns";
import {
	useVendorCandidatesList,
	useVendorCandidatesMetrics,
} from "@/queries/vendor-candidates.queries";

const DEFAULT_LIMIT = 20;
const PAGE_SIZE_OPTIONS = [10, 20, 50];

type VendorCandidateStatus = "all" | "ACTIVE" | "ONBOARDING" | "INACTIVE";

export const VENDOR_CANDIDATES_PARAMS = {
	PAGE: "vcPage",
	LIMIT: "vcLimit",
	SEARCH: "vcSearch",
	STATUS: "vcStatus",
} as const;

export function useVendorCandidates() {
	const { page, setPage, limit, setLimit } = usePaginationControls({
		pageParamKey: VENDOR_CANDIDATES_PARAMS.PAGE,
		limitParamKey: VENDOR_CANDIDATES_PARAMS.LIMIT,
		defaultLimit: DEFAULT_LIMIT,
		pageSizeOptions: PAGE_SIZE_OPTIONS,
	});

	const {
		searchValue: localSearch,
		searchFromUrl,
		handleSearchChange,
		values,
		filterConfigs: hookFilterConfigs,
		onFilterChange,
	} = useSearchWithFilters({
		pagination: { pageParamKey: VENDOR_CANDIDATES_PARAMS.PAGE },
		search: { paramKey: VENDOR_CANDIDATES_PARAMS.SEARCH },
		filters: [
			{
				id: VENDOR_CANDIDATES_PARAMS.STATUS,
				label: "Status",
				type: "select",
				defaultValue: "all",
				placeholder: "All",
				options: [...VENDOR_CANDIDATE_STATUS_FILTER_OPTIONS],
			},
		],
	});

	const statusFilter = (values[VENDOR_CANDIDATES_PARAMS.STATUS] ||
		"all") as VendorCandidateStatus;

	const [filtersExpanded, setFiltersExpanded] = useState(true);

	const setStatusFilter = useCallback(
		(v: string) => {
			onFilterChange({ [VENDOR_CANDIDATES_PARAMS.STATUS]: v || "all" });
		},
		[onFilterChange],
	);

	const listQuery = useVendorCandidatesList({
		page,
		limit,
		search: searchFromUrl.trim() || undefined,
		...(statusFilter !== "all" ? { status: statusFilter } : {}),
	});

	const metricsQuery = useVendorCandidatesMetrics();
	const columns = useVendorCandidateListColumns();

	return {
		columns,
		metrics: metricsQuery.data,
		isMetricsLoading: metricsQuery.isLoading,
		rows: listQuery.data?.data ?? [],
		totalRows: listQuery.data?.total ?? 0,
		pageCount: listQuery.data?.totalPages ?? 1,
		page,
		setPage,
		limit,
		setLimit,
		pageSizeOptions: PAGE_SIZE_OPTIONS,
		search: localSearch,
		setSearch: handleSearchChange,
		statusFilter,
		setStatusFilter,
		filtersExpanded,
		setFiltersExpanded,
		isListLoading: listQuery.isLoading,
		isListError: listQuery.isError,
		filterConfigs: hookFilterConfigs,
	};
}
