"use client";

import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useDocumentWalletListColumns } from "@/hooks/tables/use-document-wallet-list-columns";
import {
	useVendorDocumentWalletsList,
	useVendorDocumentWalletsMetrics,
} from "@/queries/vendor-document-wallets.queries";

const LIST_LIMIT = 20;

export const DW_PARAMS = {
	PAGE: "dwPage",
	SEARCH: "dwSearch",
} as const;

export function useVendorDocumentWallets() {
	const { page, setPage } = usePaginationControls({
		pageParamKey: DW_PARAMS.PAGE,
		defaultLimit: LIST_LIMIT,
	});

	const { localSearch, searchFromUrl, handleSearchChange } = useDebouncedSearch(
		{
			paramKey: DW_PARAMS.SEARCH,
			pageParamKey: DW_PARAMS.PAGE,
		},
	);

	const listQuery = useVendorDocumentWalletsList({
		page,
		limit: LIST_LIMIT,
		search: searchFromUrl.trim() || undefined,
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
		limit: LIST_LIMIT,
		search: localSearch,
		setSearch: handleSearchChange,
		isListLoading: listQuery.isLoading,
		isListError: listQuery.isError,
	};
}
