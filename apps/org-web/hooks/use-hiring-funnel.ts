"use client";

import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useSearchWithFilters } from "@repo/ui/hooks/use-search-with-filters";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { CommandCenterService } from "@/services/command-center.service";
import type { HiringFunnelSummaryKey } from "@/types/command-center";

export const HIRING_FUNNEL_PARAMS = {
	PAGE: "hiringFunnelPage",
	LIMIT: "hiringFunnelLimit",
	SEARCH: "hiringFunnelSearch",
	LOCATION: "hiringFunnelLocation",
	DEPARTMENT: "hiringFunnelDepartment",
} as const;

const HIRING_FUNNEL_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export function useHiringFunnel() {
	const { page, limit, setPage, setLimit } = usePaginationControls({
		pageParamKey: HIRING_FUNNEL_PARAMS.PAGE,
		limitParamKey: HIRING_FUNNEL_PARAMS.LIMIT,
		defaultLimit: 10,
		pageSizeOptions: HIRING_FUNNEL_PAGE_SIZE_OPTIONS,
	});

	const {
		searchValue: localSearch,
		searchFromUrl,
		handleSearchChange,
		values,
		filterConfigs: hookFilterConfigs,
	} = useSearchWithFilters({
		search: { paramKey: HIRING_FUNNEL_PARAMS.SEARCH },
		pagination: { pageParamKey: HIRING_FUNNEL_PARAMS.PAGE },
		filters: [
			{
				id: HIRING_FUNNEL_PARAMS.LOCATION,
				label: "Location",
				type: "select",
				defaultValue: "all",
			},
			{
				id: HIRING_FUNNEL_PARAMS.DEPARTMENT,
				label: "Department",
				type: "select",
				defaultValue: "all",
			},
		],
	});

	const location = values[HIRING_FUNNEL_PARAMS.LOCATION] || "all";
	const department = values[HIRING_FUNNEL_PARAMS.DEPARTMENT] || "all";

	const [filtersExpanded, setFiltersExpanded] = useState(false);

	const listQuery = useQuery({
		queryKey: [
			"command-center",
			"hiring-funnel",
			searchFromUrl,
			location,
			department,
			page,
			limit,
		],
		queryFn: () =>
			CommandCenterService.getHiringFunnel({
				search: searchFromUrl.trim() || undefined,
				location: location === "all" ? undefined : location || undefined,
				department: department === "all" ? undefined : department || undefined,
				page,
				limit,
			}),
	});

	const locationOptions = listQuery.data?.locationOptions ?? [];
	const departmentOptions = listQuery.data?.departmentOptions ?? [];
	const jobListings = listQuery.data?.jobListings ?? [];
	const summaryByKey: Record<
		HiringFunnelSummaryKey,
		{ value: number; helperText: string }
	> = listQuery.data?.summaryByKey ?? {
		submitted: { value: 0, helperText: "" },
		qualified: { value: 0, helperText: "" },
		shortlisted: { value: 0, helperText: "" },
		offers: { value: 0, helperText: "" },
		rejected: { value: 0, helperText: "" },
		placed: { value: 0, helperText: "" },
	};

	const listErrorMessage =
		listQuery.error instanceof Error
			? listQuery.error.message
			: "Could not load job pipeline";

	const filterConfigs = useMemo(() => {
		return hookFilterConfigs.map((cfg) => {
			if (cfg.id === HIRING_FUNNEL_PARAMS.LOCATION) {
				return {
					...cfg,
					options: [
						{ value: "all", label: "All Locations" },
						...locationOptions,
					],
				};
			}
			if (cfg.id === HIRING_FUNNEL_PARAMS.DEPARTMENT) {
				return {
					...cfg,
					options: [
						{ value: "all", label: "All Departments" },
						...departmentOptions,
					],
				};
			}
			return cfg;
		});
	}, [hookFilterConfigs, locationOptions, departmentOptions]);

	const total = listQuery.data?.total ?? 0;
	const totalPages = Math.ceil(total / limit);

	return {
		localSearch,
		handleSearchChange,
		filtersExpanded,
		setFiltersExpanded,
		location,
		department,
		locationOptions,
		departmentOptions,
		jobListings,
		summaryByKey,
		isLoading: listQuery.isLoading,
		isError: listQuery.isError,
		listErrorMessage,
		refetchJobs: listQuery.refetch,
		filterConfigs,
		page,
		limit,
		totalPages,
		total,
		setPage,
		setLimit,
		pageSizeOptions: HIRING_FUNNEL_PAGE_SIZE_OPTIONS,
	};
}
