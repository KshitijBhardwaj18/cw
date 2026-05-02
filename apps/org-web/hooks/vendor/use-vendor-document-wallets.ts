import { useLocalDebouncedSearch } from "@repo/ui/hooks/use-local-debounced-search";
import { useCallback, useState } from "react";
import { useDocumentWalletListColumns } from "@/hooks/tables/use-document-wallet-list-columns";
import {
	useVendorDocumentWalletsList,
	useVendorDocumentWalletsMetrics,
} from "@/queries/vendor-document-wallets.queries";

const SEARCH_DEBOUNCE_MS = 300;
const LIST_LIMIT = 20;

export function useVendorDocumentWallets() {
	const [page, setPage] = useState(1);
	const {
		search,
		debouncedSearch,
		setSearch: setSearchBase,
	} = useLocalDebouncedSearch("", { wait: SEARCH_DEBOUNCE_MS });

	const setSearchAndResetPage = useCallback(
		(v: string) => {
			setSearchBase(v);
			setPage(1);
		},
		[setSearchBase],
	);

	const listQuery = useVendorDocumentWalletsList({
		page,
		limit: LIST_LIMIT,
		search: debouncedSearch.trim() || undefined,
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
		search,
		setSearch: setSearchAndResetPage,
		isListLoading: listQuery.isLoading,
		isListError: listQuery.isError,
	};
}
