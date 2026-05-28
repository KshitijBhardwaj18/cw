"use client";

import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useSearchWithFilters } from "@repo/ui/hooks/use-search-with-filters";
import { useCallback, useMemo, useState } from "react";
import { useDocumentWalletListColumns } from "@/hooks/tables/use-document-wallet-list-columns";
import {
	useVendorDocumentWalletsList,
	useVendorDocumentWalletsMetrics,
} from "@/queries/vendor-document-wallets.queries";

const DEFAULT_LIMIT = 10;
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export const DW_PARAMS = {
	PAGE: "dwPage",
	LIMIT: "dwLimit",
	SEARCH: "dwSearch",
	STATUS: "dwStatus",
} as const;

const STATUS_OPTIONS = [
	{ value: "all", label: "All statuses" },
	{ value: "COMPLETE", label: "Complete" },
	{ value: "IN_PROGRESS", label: "In Progress" },
	{ value: "CRITICAL", label: "Critical" },
] as const;

type StatusValue = "all" | "COMPLETE" | "IN_PROGRESS" | "CRITICAL";

export function useVendorDocumentWallets() {
	const { page, setPage, limit, setLimit } = usePaginationControls({
		pageParamKey: DW_PARAMS.PAGE,
		limitParamKey: DW_PARAMS.LIMIT,
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
		pagination: { pageParamKey: DW_PARAMS.PAGE },
		search: { paramKey: DW_PARAMS.SEARCH },
		filters: [
			{
				id: DW_PARAMS.STATUS,
				label: "Status",
				type: "select",
				defaultValue: "all",
				placeholder: "All statuses",
				options: [...STATUS_OPTIONS],
			},
		],
	});

	const statusFilter = (values[DW_PARAMS.STATUS] || "all") as StatusValue;
	const [filtersExpanded, setFiltersExpanded] = useState(false);

	const setStatusFilter = useCallback(
		(v: string) => onFilterChange({ [DW_PARAMS.STATUS]: v || "all" }),
		[onFilterChange],
	);

	const filterConfigs = useMemo(
		() =>
			hookFilterConfigs.map((cfg) =>
				cfg.id === DW_PARAMS.STATUS
					? { ...cfg, onValueChange: setStatusFilter }
					: cfg,
			),
		[hookFilterConfigs, setStatusFilter],
	);

	const listQuery = useVendorDocumentWalletsList({
		page,
		limit,
		search: searchFromUrl.trim() || undefined,
		...(statusFilter !== "all" ? { status: statusFilter } : {}),
	});

	const metricsQuery = useVendorDocumentWalletsMetrics();
	const columns = useDocumentWalletListColumns();

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
		filterConfigs,
		filtersExpanded,
		setFiltersExpanded,
		isListLoading: listQuery.isLoading,
		isListError: listQuery.isError,
	};
}
