"use client";

import { useDebouncedCallback } from "@tanstack/react-pacer";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useOrgContext } from "@/contexts/org-context";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { PerDiemShiftsService } from "@/services/per-diem-shifts.service";
import type { CommandCenterShiftSummaryKey } from "@/types/command-center";

type ShiftTabFilterKey = "search" | "department" | "occupation";

const PARAM_MAP: Record<ShiftTabFilterKey, string> = {
	search: "shiftLocationSearch",
	department: "shiftDepartment",
	occupation: "shiftOccupation",
};

function toOption(value: string) {
	return { value, label: value };
}

export function useCommandCenterShiftsTab() {
	const { id: orgId } = useOrgContext();
	const { getValue, setValue, updateValues } = useUrlFilters<ShiftTabFilterKey>(
		{
			paramMap: PARAM_MAP,
		},
	);

	const searchFromUrl = getValue("search");
	const department = getValue("department");
	const occupation = getValue("occupation");

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

	const query = useMemo(
		() => ({
			search: searchFromUrl?.trim() || undefined,
			department: department?.trim() || undefined,
			occupation: occupation?.trim() || undefined,
		}),
		[department, occupation, searchFromUrl],
	);

	const locationsQuery = useQuery({
		queryKey: ["command-center-shifts", orgId, query],
		queryFn: () => PerDiemShiftsService.getCommandCenterLocations(query),
		enabled: !!orgId,
		refetchOnMount: "always",
	});

	const departmentOccupationMap =
		locationsQuery.data?.filtersMeta.departmentOccupations ?? [];

	const availableOccupations = useMemo(() => {
		if (!department) return locationsQuery.data?.filtersMeta.occupations ?? [];
		return (
			departmentOccupationMap.find((item) => item.department === department)
				?.occupations ?? []
		);
	}, [
		department,
		departmentOccupationMap,
		locationsQuery.data?.filtersMeta.occupations,
	]);

	const setDepartment = useCallback(
		(value: string) => {
			const nextDepartment = value && value !== "all" ? value : undefined;
			const stillValidOccupation = nextDepartment
				? (departmentOccupationMap
						.find((item) => item.department === nextDepartment)
						?.occupations.includes(occupation) ?? false)
				: true;

			updateValues(
				{
					department: nextDepartment,
					occupation: stillValidOccupation
						? occupation || undefined
						: undefined,
				},
				{ navigation: "push" },
			);
		},
		[departmentOccupationMap, occupation, updateValues],
	);

	const setOccupation = useCallback(
		(value: string) => {
			setValue("occupation", value && value !== "all" ? value : undefined);
		},
		[setValue],
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
		() => (locationsQuery.data?.filtersMeta.departments ?? []).map(toOption),
		[locationsQuery.data?.filtersMeta.departments],
	);

	const occupationOptions = useMemo(
		() => availableOccupations.map(toOption),
		[availableOccupations],
	);

	const filterConfigs = useMemo(
		() => [
			{
				id: "command-center-shifts-occupation",
				label: "Occupation",
				value: occupation || "all",
				onValueChange: setOccupation,
				placeholder: "All",
				options: [
					{ value: "all", label: "All Occupations" },
					...occupationOptions,
				],
			},
			{
				id: "command-center-shifts-department",
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
			occupation,
			occupationOptions,
			setDepartment,
			setOccupation,
		],
	);

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
		locations: locationsQuery.data?.locations ?? [],
		filterConfigs,
	};
}
