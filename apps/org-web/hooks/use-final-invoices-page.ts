"use client";

import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useSearchWithFilters } from "@repo/ui/hooks/use-search-with-filters";
import { useMemo, useState } from "react";
import { FINAL_INVOICE_STATUS_FILTER_OPTIONS } from "@/constants/final-invoices";
import {
	useFinalInvoiceSummary,
	useFinalInvoices,
} from "@/queries/billing.queries";

export const FINAL_INVOICES_PAGE_SIZE = 10;

const FINAL_INVOICE_PARAMS = {
	SEARCH: "finvSearch",
	PAGE: "finvPage",
	LIMIT: "fil",
	STATUS: "finalInvStatus",
} as const;

export function useFinalInvoicesPage(orgId: string) {
	const { page, limit, setPage, setLimit } = usePaginationControls({
		pageParamKey: FINAL_INVOICE_PARAMS.PAGE,
		limitParamKey: FINAL_INVOICE_PARAMS.LIMIT,
		defaultLimit: FINAL_INVOICES_PAGE_SIZE,
	});

	const {
		searchValue: localSearch,
		searchFromUrl,
		handleSearchChange,
		values,
		filterConfigs: hookFilterConfigs,
		onFilterChange,
	} = useSearchWithFilters({
		search: { paramKey: FINAL_INVOICE_PARAMS.SEARCH },
		pagination: { pageParamKey: FINAL_INVOICE_PARAMS.PAGE },
		filters: [
			{
				id: FINAL_INVOICE_PARAMS.STATUS,
				label: "Status",
				type: "select",
				defaultValue: "all",
				options: [...FINAL_INVOICE_STATUS_FILTER_OPTIONS],
			},
		],
	});

	const [filtersExpanded, setFiltersExpanded] = useState(true);

	const statusFilter = values[FINAL_INVOICE_PARAMS.STATUS] || "all";
	const query = useMemo(
		() => ({
			page,
			limit,
			...(searchFromUrl.trim() ? { search: searchFromUrl.trim() } : {}),
			...(statusFilter !== "all" ? { status: statusFilter } : {}),
		}),
		[page, limit, searchFromUrl, statusFilter],
	);

	const listQuery = useFinalInvoices(orgId, query);
	const summaryQuery = useFinalInvoiceSummary(orgId, {
		...(searchFromUrl.trim() ? { search: searchFromUrl.trim() } : {}),
	});

	return {
		localSearch,
		handleSearchChange,
		filtersExpanded,
		setFiltersExpanded,
		page,
		setPage,
		limit,
		setLimit,
		query,
		listQuery,
		summaryQuery,
		filterConfigs: hookFilterConfigs,
		onFilterChange,
	};
}
