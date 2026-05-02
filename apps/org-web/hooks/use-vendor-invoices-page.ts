"use client";

import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { useUrlQueryState } from "@repo/ui/hooks/use-url-query-state";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { VENDOR_INVOICE_STATUS_FILTER_OPTIONS } from "@/constants/vendor-invoices";
import {
	useVendorInvoiceSummary,
	useVendorInvoices,
} from "@/queries/vendor-invoices.queries";

const PAGE_SIZE = 10;

export function useVendorInvoicesPage() {
	const searchParams = useSearchParams();
	const { pushParams } = useUrlQueryState();
	const { localSearch, searchFromUrl, handleSearchChange } = useDebouncedSearch(
		{ paramKey: "vinvSearch", pageParamKey: "vinvPage" },
	);

	const pageParam = Number(searchParams.get("vinvPage") ?? "1");
	const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
	const statusFilter = searchParams.get("vendorInvStatus") ?? "all";

	const [filtersExpanded, setFiltersExpanded] = useState(true);

	const setPage = useCallback(
		(p: number) => {
			pushParams({ vinvPage: String(p) });
		},
		[pushParams],
	);

	const setStatusFilter = useCallback(
		(v: string) => {
			const clear = !v || v === "all";
			pushParams({ vendorInvStatus: clear ? null : v, vinvPage: null });
		},
		[pushParams],
	);

	const query = useMemo(
		() => ({
			page,
			limit: PAGE_SIZE,
			...(searchFromUrl.trim() ? { search: searchFromUrl.trim() } : {}),
			...(statusFilter !== "all" ? { status: statusFilter } : {}),
		}),
		[page, searchFromUrl, statusFilter],
	);

	const listQuery = useVendorInvoices(query);
	const summaryQuery = useVendorInvoiceSummary({
		...(searchFromUrl.trim() ? { search: searchFromUrl.trim() } : {}),
	});

	const filterConfigs = useMemo(
		() => [
			{
				id: "vendor-invoice-status",
				label: "Status",
				value: statusFilter,
				onValueChange: setStatusFilter,
				placeholder: "All",
				options: [...VENDOR_INVOICE_STATUS_FILTER_OPTIONS],
			},
		],
		[setStatusFilter, statusFilter],
	);

	return {
		search: localSearch,
		setSearch: handleSearchChange,
		filtersExpanded,
		setFiltersExpanded,
		page,
		setPage,
		query,
		listQuery,
		summaryQuery,
		filterConfigs,
	};
}
