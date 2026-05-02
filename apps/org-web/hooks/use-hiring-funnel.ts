"use client";

import { useDebouncedCallback } from "@tanstack/react-pacer";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { CommandCenterService } from "@/services/command-center.service";
import type { HiringFunnelSummaryKey } from "@/types/command-center";

type HiringFunnelFilterKey = "search" | "location" | "department";

const PARAM_MAP: Record<HiringFunnelFilterKey, string> = {
	search: "hiringFunnelSearch",
	location: "hiringFunnelLocation",
	department: "hiringFunnelDepartment",
};

export function useHiringFunnel() {
	const { getValue, setValue } = useUrlFilters<HiringFunnelFilterKey>({
		paramMap: PARAM_MAP,
	});

	const searchFromUrl = getValue("search");
	const location = getValue("location");
	const department = getValue("department");

	const [localSearch, setLocalSearch] = useState(searchFromUrl);
	const [filtersExpanded, setFiltersExpanded] = useState(false);

	useEffect(() => {
		setLocalSearch(searchFromUrl);
	}, [searchFromUrl]);

	const debouncedReplaceSearch = useDebouncedCallback(
		(value: string) =>
			setValue("search", value || undefined, {
				navigation: "replace",
			}),
		{ wait: 250 },
	);

	const handleSearchChange = (value: string) => {
		setLocalSearch(value);
		debouncedReplaceSearch(value);
	};

	const setLocation = useCallback(
		(value: string) => {
			setValue("location", value && value !== "all" ? value : undefined);
		},
		[setValue],
	);

	const setDepartment = useCallback(
		(value: string) => {
			setValue("department", value && value !== "all" ? value : undefined);
		},
		[setValue],
	);

	const listQuery = useQuery({
		queryKey: [
			"command-center",
			"hiring-funnel",
			searchFromUrl,
			location,
			department,
		],
		queryFn: () =>
			CommandCenterService.getHiringFunnel({
				search: searchFromUrl.trim() || undefined,
				location: location || undefined,
				department: department || undefined,
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

	const filterConfigs = useMemo(
		() => [
			{
				id: "hiring-funnel-location",
				label: "Location",
				value: location || "all",
				onValueChange: setLocation,
				placeholder: "All",
				options: [{ value: "all", label: "All Locations" }, ...locationOptions],
			},
			{
				id: "hiring-funnel-department",
				label: "Department",
				value: department || "all",
				onValueChange: setDepartment,
				placeholder: "All Departments",
				options: [
					{ value: "all", label: "All Departments" },
					...departmentOptions,
				],
			},
		],
		[
			department,
			departmentOptions,
			location,
			locationOptions,
			setDepartment,
			setLocation,
		],
	);

	return {
		localSearch,
		filtersExpanded,
		setFiltersExpanded,
		handleSearchChange,
		location,
		department,
		setLocation,
		setDepartment,
		locationOptions,
		departmentOptions,
		jobListings,
		summaryByKey,
		isLoading: listQuery.isLoading,
		isError: listQuery.isError,
		listErrorMessage,
		refetchJobs: listQuery.refetch,
		filterConfigs,
	};
}
