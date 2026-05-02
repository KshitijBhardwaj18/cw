import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { useUrlQueryState } from "@repo/ui/hooks/use-url-query-state";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { VENDOR_CANDIDATE_STATUS_FILTER_OPTIONS } from "@/constants/vendor-candidates";
import { useVendorCandidateListColumns } from "@/hooks/tables/use-vendor-candidate-list-columns";
import {
	useVendorCandidatesList,
	useVendorCandidatesMetrics,
} from "@/queries/vendor-candidates.queries";

const DEFAULT_LIMIT = 20;
const PAGE_SIZE_OPTIONS = [10, 20, 50];

type VendorCandidateStatus = "all" | "ACTIVE" | "ONBOARDING" | "INACTIVE";

export function useVendorCandidates() {
	const searchParams = useSearchParams();
	const { pushParams } = useUrlQueryState();
	const { localSearch, searchFromUrl, handleSearchChange } = useDebouncedSearch(
		{ paramKey: "vcSearch", pageParamKey: "vcPage" },
	);

	const pageParam = Number(searchParams.get("vcPage") ?? "1");
	const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
	const limitParam = Number(
		searchParams.get("vcLimit") ?? String(DEFAULT_LIMIT),
	);
	const limit = PAGE_SIZE_OPTIONS.includes(limitParam)
		? limitParam
		: DEFAULT_LIMIT;
	const statusParam = searchParams.get("vcStatus") ?? "all";
	const statusFilter: VendorCandidateStatus =
		statusParam === "ACTIVE" ||
		statusParam === "ONBOARDING" ||
		statusParam === "INACTIVE" ||
		statusParam === "all"
			? statusParam
			: "all";

	const [filtersExpanded, setFiltersExpanded] = useState(true);

	const setPage = useCallback(
		(p: number) => {
			pushParams({ vcPage: String(p) });
		},
		[pushParams],
	);

	const setLimitAndResetPage = useCallback(
		(l: number) => {
			pushParams({ vcLimit: String(l), vcPage: null });
		},
		[pushParams],
	);

	const setStatusFilterAndResetPage = useCallback(
		(v: VendorCandidateStatus) => {
			const clear = v === "all";
			pushParams({ vcStatus: clear ? null : v, vcPage: null });
		},
		[pushParams],
	);

	const listQuery = useVendorCandidatesList({
		page,
		limit,
		search: searchFromUrl.trim() || undefined,
		...(statusFilter !== "all" ? { status: statusFilter } : {}),
	});

	const metricsQuery = useVendorCandidatesMetrics();

	const columns = useVendorCandidateListColumns();

	const filterConfigs = useMemo(
		() => [
			{
				id: "vendor-candidate-status",
				label: "Status",
				value: statusFilter,
				onValueChange: (v: string) =>
					setStatusFilterAndResetPage(v as VendorCandidateStatus),
				placeholder: "All",
				options: VENDOR_CANDIDATE_STATUS_FILTER_OPTIONS,
			},
		],
		[setStatusFilterAndResetPage, statusFilter],
	);

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
		setLimit: setLimitAndResetPage,
		pageSizeOptions: PAGE_SIZE_OPTIONS,
		search: localSearch,
		setSearch: handleSearchChange,
		statusFilter,
		setStatusFilter: setStatusFilterAndResetPage,
		filtersExpanded,
		setFiltersExpanded,
		isListLoading: listQuery.isLoading,
		isListError: listQuery.isError,
		filterConfigs,
	};
}
