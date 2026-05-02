"use client";

import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { useUrlQueryState } from "@repo/ui/hooks/use-url-query-state";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { FINAL_INVOICE_STATUS_FILTER_OPTIONS } from "@/constants/final-invoices";
import {
	useFinalInvoiceSummary,
	useFinalInvoices,
} from "@/queries/billing.queries";

export const FINAL_INVOICES_PAGE_SIZE = 10;

export function useFinalInvoicesPage(orgId: string) {
	const searchParams = useSearchParams();
	const { pushParams } = useUrlQueryState();
	const { localSearch, searchFromUrl, handleSearchChange } = useDebouncedSearch(
		{ paramKey: "finvSearch", pageParamKey: "finvPage" },
	);

	const pageParam = Number(searchParams.get("finvPage") ?? "1");
	const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
	const statusFilter = searchParams.get("finalInvStatus") ?? "all";

	const [filtersExpanded, setFiltersExpanded] = useState(true);

	const setPage = useCallback(
		(p: number) => {
			pushParams({ finvPage: String(p) });
		},
		[pushParams],
	);

	const setStatusFilter = useCallback(
		(v: string) => {
			const clear = !v || v === "all";
			pushParams({ finalInvStatus: clear ? null : v, finvPage: null });
		},
		[pushParams],
	);

	const query = useMemo(
		() => ({
			page,
			limit: FINAL_INVOICES_PAGE_SIZE,
			...(searchFromUrl.trim() ? { search: searchFromUrl.trim() } : {}),
			...(statusFilter !== "all" ? { status: statusFilter } : {}),
		}),
		[page, searchFromUrl, statusFilter],
	);

	const listQuery = useFinalInvoices(orgId, query);
	const summaryQuery = useFinalInvoiceSummary(orgId, {
		...(searchFromUrl.trim() ? { search: searchFromUrl.trim() } : {}),
	});

	const filterConfigs = useMemo(
		() => [
			{
				id: "final-invoice-status",
				label: "Status",
				value: statusFilter,
				onValueChange: setStatusFilter,
				placeholder: "All",
				options: [...FINAL_INVOICE_STATUS_FILTER_OPTIONS],
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
