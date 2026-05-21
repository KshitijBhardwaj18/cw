"use client";

import type { DataSourceFilter } from "@repo/ui/general/timekeeping/types";
import { useSearchWithFilters } from "@repo/ui/hooks/use-search-with-filters";
import { useState } from "react";
import type { ApprovalStatusFilter } from "@/types/timekeeping";

export const ATK_PARAMS = {
	SEARCH: "atkSearch",
	DATA_SOURCE: "ds",
	GROUPED_STATUS: "gs",
} as const;

export function useTimekeepingUrlState() {
	const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

	const {
		searchValue: localSearch,
		handleSearchChange,
		searchFromUrl,
		values,
		filterConfigs,
	} = useSearchWithFilters({
		search: { paramKey: ATK_PARAMS.SEARCH },
		filters: [
			{
				id: ATK_PARAMS.DATA_SOURCE,
				label: "Data Source",
				type: "select",
				defaultValue: "ALL",
				options: [
					{ label: "All", value: "ALL" },
					{ label: "File Upload", value: "FILE_UPLOAD" },
					{ label: "Mobile App", value: "MOBILE_APP" },
				],
			},
			{
				id: ATK_PARAMS.GROUPED_STATUS,
				label: "Grouped Status",
				type: "select",
				defaultValue: "PENDING",
				options: [
					{ label: "All", value: "ALL" },
					{ label: "Pending", value: "PENDING" },
					{ label: "Approved", value: "APPROVED" },
					{ label: "Disputed", value: "DISPUTED" },
					{ label: "Rejected", value: "REJECTED" },
				],
			},
		],
	});

	return {
		localSearch,
		searchFromUrl,
		handleSearchChange,
		isFiltersExpanded,
		setIsFiltersExpanded,
		dataSourceFilter: values[ATK_PARAMS.DATA_SOURCE] as DataSourceFilter,
		groupedStatusFilter: values[
			ATK_PARAMS.GROUPED_STATUS
		] as ApprovalStatusFilter,
		setDataSourceFilter: filterConfigs[0].onValueChange,
		setGroupedStatusFilter: filterConfigs[1].onValueChange,
	};
}

export type TimekeepingUrlState = ReturnType<typeof useTimekeepingUrlState>;
