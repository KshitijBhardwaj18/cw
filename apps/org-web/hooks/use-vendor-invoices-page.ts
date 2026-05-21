"use client";

import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useSearchWithFilters } from "@repo/ui/hooks/use-search-with-filters";
import { useMemo, useState } from "react";
import { VENDOR_INVOICE_STATUS_FILTER_OPTIONS } from "@/constants/vendor-invoices";
import {
	useVendorInvoiceSummary,
	useVendorInvoices,
} from "@/queries/vendor-invoices.queries";

const PAGE_SIZE = 10;

export const VENDOR_INVOICES_PARAMS = {
	PAGE: "vinvPage",
	SEARCH: "vinvSearch",
	STATUS: "vendorInvStatus",
} as const;

export function useVendorInvoicesPage() {
	const { page, setPage } = usePaginationControls({
		pageParamKey: VENDOR_INVOICES_PARAMS.PAGE,
		defaultLimit: PAGE_SIZE,
	});

	const {
		searchValue: localSearch,
		searchFromUrl,
		handleSearchChange,
		values,
		filterConfigs: hookFilterConfigs,
	} = useSearchWithFilters({
		pagination: { pageParamKey: VENDOR_INVOICES_PARAMS.PAGE },
		search: { paramKey: VENDOR_INVOICES_PARAMS.SEARCH },
		filters: [
			{
				id: VENDOR_INVOICES_PARAMS.STATUS,
				label: "Status",
				type: "select",
				defaultValue: "all",
				placeholder: "All",
				options: [...VENDOR_INVOICE_STATUS_FILTER_OPTIONS],
			},
		],
	});

	const statusFilter = values[VENDOR_INVOICES_PARAMS.STATUS] || "all";

	const [filtersExpanded, setFiltersExpanded] = useState(true);

	const query = useMemo(
		() => ({
			page,
			limit: PAGE_SIZE,
			...(searchFromUrl.trim() ? { search: searchFromUrl.trim() } : {}),
			...(statusFilter !== "all" ? { status: statusFilter.toUpperCase() } : {}),
		}),
		[page, searchFromUrl, statusFilter],
	);

	const listQuery = useVendorInvoices(query);
	const summaryQuery = useVendorInvoiceSummary({
		...(searchFromUrl.trim() ? { search: searchFromUrl.trim() } : {}),
	});

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
		filterConfigs: hookFilterConfigs,
	};
}
