"use client";

import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useSearchWithFilters } from "@repo/ui/hooks/use-search-with-filters";
import { useCallback, useMemo, useState } from "react";
import {
	useCommandCenterShifts,
	useCommandCenterShiftsMeta,
} from "@/queries/per-diem-shifts.queries";
import type { CommandCenterShiftSummaryKey } from "@/types/command-center";

export const SHIFT_TAB_PARAMS = {
	PAGE: "shiftLocationPage",
	SEARCH: "shiftLocationSearch",
	DEPARTMENT: "shiftDepartment",
	OCCUPATION: "shiftOccupation",
} as const;

export const SHIFT_PAGE_SIZE_OPTIONS = [5, 10, 20, 30];

function toOption(value: string) {
	return { value, label: value };
}

export function useCommandCenterShiftsTab() {
	const { page, limit, setPage, setLimit } = usePaginationControls({
		pageParamKey: SHIFT_TAB_PARAMS.PAGE,
		defaultLimit: 2,
		pageSizeOptions: SHIFT_PAGE_SIZE_OPTIONS,
	});

	const {
		searchValue: localSearch,
		handleSearchChange,
		searchFromUrl,
		values,
		filterConfigs: hookFilterConfigs,
		onFilterChange,
	} = useSearchWithFilters({
		search: { paramKey: SHIFT_TAB_PARAMS.SEARCH },
		pagination: { pageParamKey: SHIFT_TAB_PARAMS.PAGE },
		filters: [
			{
				id: SHIFT_TAB_PARAMS.DEPARTMENT,
				label: "Department",
				type: "select",
				defaultValue: "all",
			},
			{
				id: SHIFT_TAB_PARAMS.OCCUPATION,
				label: "Occupation",
				type: "select",
				defaultValue: "all",
			},
		],
	});

	const [filtersExpanded, setFiltersExpanded] = useState(false);

	const department = values[SHIFT_TAB_PARAMS.DEPARTMENT] || "all";
	const occupation = values[SHIFT_TAB_PARAMS.OCCUPATION] || "all";

	const query = useMemo(
		() => ({
			search: searchFromUrl?.trim() || undefined,
			department: department === "all" ? undefined : department.trim(),
			occupation: occupation === "all" ? undefined : occupation.trim(),
			page,
			limit,
		}),
		[department, occupation, page, limit, searchFromUrl],
	);

	const locationsQuery = useCommandCenterShifts(query);
	const filtersMetaQuery = useCommandCenterShiftsMeta();

	const departmentOccupationMap =
		filtersMetaQuery.data?.filtersMeta.departmentOccupations ?? [];

	const availableOccupations = useMemo(() => {
		if (!department || department === "all")
			return filtersMetaQuery.data?.filtersMeta.occupations ?? [];
		return (
			departmentOccupationMap.find((item) => item.department === department)
				?.occupations ?? []
		);
	}, [
		department,
		departmentOccupationMap,
		filtersMetaQuery.data?.filtersMeta.occupations,
	]);

	const setDepartment = useCallback(
		(value: string) => {
			const nextDepartment = value && value !== "all" ? value : "all";
			const stillValidOccupation =
				nextDepartment !== "all"
					? (departmentOccupationMap
							.find((item) => item.department === nextDepartment)
							?.occupations.includes(occupation) ?? false)
					: true;

			onFilterChange({
				[SHIFT_TAB_PARAMS.DEPARTMENT]: nextDepartment,
				[SHIFT_TAB_PARAMS.OCCUPATION]: stillValidOccupation
					? occupation
					: "all",
			});
		},
		[departmentOccupationMap, occupation, onFilterChange],
	);

	const setOccupation = useCallback(
		(value: string) => {
			onFilterChange(SHIFT_TAB_PARAMS.OCCUPATION, value || "all");
		},
		[onFilterChange],
	);

	const summaryCounts = useMemo<Record<CommandCenterShiftSummaryKey, number>>(
		() =>
			locationsQuery.data?.counts ?? {
				"total-shifts": 0,
				filled: 0,
				open: 0,
				"in-progress": 0,
			},
		[locationsQuery.data?.counts],
	);

	const departmentOptions = useMemo(
		() => (filtersMetaQuery.data?.filtersMeta.departments ?? []).map(toOption),
		[filtersMetaQuery.data?.filtersMeta.departments],
	);

	const occupationOptions = useMemo(
		() => availableOccupations.map(toOption),
		[availableOccupations],
	);

	const filterConfigs = useMemo(() => {
		return hookFilterConfigs.map((cfg) => {
			if (cfg.id === SHIFT_TAB_PARAMS.DEPARTMENT) {
				return {
					...cfg,
					onValueChange: setDepartment,
					options: [
						{ value: "all", label: "All Departments" },
						...departmentOptions,
					],
				};
			}
			if (cfg.id === SHIFT_TAB_PARAMS.OCCUPATION) {
				return {
					...cfg,
					onValueChange: setOccupation,
					options: [
						{ value: "all", label: "All Occupations" },
						...occupationOptions,
					],
				};
			}
			return cfg;
		});
	}, [
		hookFilterConfigs,
		setDepartment,
		departmentOptions,
		setOccupation,
		occupationOptions,
	]);

	const locations = locationsQuery.data?.locations ?? [];
	const totalLocations = locationsQuery.data?.totalLocations ?? 0;
	const totalPages = Math.ceil(totalLocations / limit);

	return {
		localSearch,
		filtersExpanded,
		setFiltersExpanded,
		handleSearchChange,
		isLoading: locationsQuery.isLoading,
		department,
		occupation,
		setDepartment,
		setOccupation,
		departmentOptions,
		occupationOptions,
		summaryCounts,
		locations,
		filterConfigs,
		page,
		limit,
		totalLocations,
		totalPages,
		setPage,
		setLimit,
	};
}
