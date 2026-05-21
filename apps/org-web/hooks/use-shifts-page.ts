"use client";

import { toIsoDateString } from "@repo/shared";
import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useSearchWithFilters } from "@repo/ui/hooks/use-search-with-filters";
import { useQuery } from "@tanstack/react-query";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useCallback, useMemo, useState } from "react";
import type { Shift, ShiftStatus } from "@/constants/shifts";
import { SHIFT_LIST_PAGE_SIZE, SHIFT_TYPE_OPTIONS } from "@/constants/shifts";
import { useOrgContext } from "@/contexts/org-context";
import {
	useShiftTemplateDepartments,
	useShiftTemplateLocations,
	useShiftTemplateOccupations,
} from "@/queries/shift-templates.queries";
import { useSpecialtiesForOccupation } from "@/queries/talent-community.queries";
import type { PerDiemShiftListResponse } from "@/services/per-diem-shifts.service";
import { PerDiemShiftsService } from "@/services/per-diem-shifts.service";

const SELECT_FILTER_KEYS = [
	"shiftType",
	"department",
	"location",
	"occupation",
	"specialty",
] as const;

const VALID_STATUSES: ShiftStatus[] = [
	"OPEN",
	"IN_PROGRESS",
	"COMPLETED",
	"CANCELLED",
];

const perDiemShiftsKeys = {
	all: ["per-diem-shifts"] as const,
	list: (params: Record<string, unknown>) =>
		[...perDiemShiftsKeys.all, "list", params] as const,
};

export const SHIFTS_PARAMS = {
	PAGE: "pdPage",
	SEARCH: "pdSearch",
	STATUS: "status",
	DATE: "date",
	SHIFT_TYPE: "shiftType",
	DEPARTMENT: "department",
	LOCATION: "location",
	OCCUPATION: "occupation",
	SPECIALTY: "specialty",
} as const;

export function useShiftsPage() {
	const { id: orgId } = useOrgContext();

	const { page, setPage, resetPage } = usePaginationControls({
		pageParamKey: SHIFTS_PARAMS.PAGE,
		defaultLimit: SHIFT_LIST_PAGE_SIZE,
	});

	const {
		searchValue: localSearch,
		searchFromUrl,
		handleSearchChange,
		values,
		filterConfigs: hookFilterConfigs,
		onFilterChange,
	} = useSearchWithFilters({
		search: { paramKey: SHIFTS_PARAMS.SEARCH },
		pagination: { pageParamKey: SHIFTS_PARAMS.PAGE },
		filters: [
			{
				id: SHIFTS_PARAMS.DATE,
				label: "Date",
				type: "date",
				defaultValue: "",
				placeholder: "Pick a date",
			},
			{
				id: SHIFTS_PARAMS.SHIFT_TYPE,
				label: "Shift Type",
				type: "select",
				defaultValue: "all",
				placeholder: "All",
				options: [
					{ value: "all", label: "All Shift Types" },
					...SHIFT_TYPE_OPTIONS,
				],
			},
			{
				id: SHIFTS_PARAMS.DEPARTMENT,
				label: "Department",
				type: "select",
				defaultValue: "all",
				placeholder: "All Departments",
			},
			{
				id: SHIFTS_PARAMS.LOCATION,
				label: "Location",
				type: "select",
				defaultValue: "all",
				placeholder: "All Locations",
			},
			{
				id: SHIFTS_PARAMS.OCCUPATION,
				label: "Occupation",
				type: "select",
				defaultValue: "all",
				placeholder: "All Occupations",
			},
			{
				id: SHIFTS_PARAMS.SPECIALTY,
				label: "Specialty",
				type: "select",
				defaultValue: "all",
				placeholder: "All Specialties",
			},
		],
	});

	const [statusFilter, setStatusFilterState] = useQueryState(
		SHIFTS_PARAMS.STATUS,
		parseAsStringLiteral([...VALID_STATUSES, "ALL"]).withDefault("ALL"),
	);

	const filters = useMemo(() => {
		return {
			date: values[SHIFTS_PARAMS.DATE] ?? "",
			shiftType: values[SHIFTS_PARAMS.SHIFT_TYPE] || "all",
			department: values[SHIFTS_PARAMS.DEPARTMENT] || "all",
			location: values[SHIFTS_PARAMS.LOCATION] || "all",
			occupation: values[SHIFTS_PARAMS.OCCUPATION] || "all",
			specialty: values[SHIFTS_PARAMS.SPECIALTY] || "all",
		};
	}, [values]);

	const setStatusFilter = useCallback(
		(value: ShiftStatus | "ALL") => {
			void setStatusFilterState(value);
			resetPage();
		},
		[setStatusFilterState, resetPage],
	);

	const setFilter = useCallback(
		(key: string, value: string) => {
			if (key === SHIFTS_PARAMS.OCCUPATION) {
				const updates: Record<string, string | null> = {
					[SHIFTS_PARAMS.OCCUPATION]: value === "all" ? null : value,
				};
				if (values[SHIFTS_PARAMS.OCCUPATION] !== value) {
					updates[SHIFTS_PARAMS.SPECIALTY] = null;
				}
				onFilterChange(updates);
			} else {
				onFilterChange({ [key]: value === "all" ? null : value });
			}
		},
		[onFilterChange, values],
	);

	const departmentsQuery = useShiftTemplateDepartments();
	const locationsQuery = useShiftTemplateLocations();
	const occupationsQuery = useShiftTemplateOccupations();

	const activeOccupationId =
		occupationsQuery.data?.find((o) => o.name === filters.occupation)?.id ??
		null;
	const { data: specialtiesForOccupation } = useSpecialtiesForOccupation(
		orgId,
		activeOccupationId,
	);

	const queryParams = useMemo(() => {
		const date = filters.date ? toIsoDateString(filters.date) : null;
		return {
			search: searchFromUrl.trim() || undefined,
			status: statusFilter === "ALL" ? undefined : statusFilter,
			shiftType:
				filters.shiftType === "all"
					? undefined
					: filters.shiftType || undefined,
			date: date || undefined,
			department:
				filters.department === "all"
					? undefined
					: filters.department || undefined,
			location:
				filters.location === "all" ? undefined : filters.location || undefined,
			occupation:
				filters.occupation === "all"
					? undefined
					: filters.occupation || undefined,
			specialty:
				filters.specialty === "all"
					? undefined
					: filters.specialty || undefined,
			page,
			limit: SHIFT_LIST_PAGE_SIZE,
		};
	}, [filters, page, searchFromUrl, statusFilter]);

	const listQuery = useQuery({
		queryKey: perDiemShiftsKeys.list(queryParams),
		queryFn: () => PerDiemShiftsService.list(queryParams),
		refetchOnMount: "always",
	});

	const data = listQuery.data as PerDiemShiftListResponse | undefined;
	const counts = data?.counts;
	const pagedShifts = (data?.data ?? []) as Shift[];

	const hasActiveFilters = Boolean(
		searchFromUrl.trim() ||
			statusFilter !== "ALL" ||
			Boolean(filters.date) ||
			SELECT_FILTER_KEYS.some((key) => filters[key] !== "all"),
	);

	const totalCount = data?.total ?? 0;
	const totalPages = data?.totalPages ?? 1;
	const currentPage = data?.page ?? page;

	const [filtersExpanded, setFiltersExpanded] = useState(false);

	const departmentOptions = useMemo(
		() => [
			{ value: "all", label: "All Departments" },
			...(departmentsQuery.data ?? []).map((d) => ({
				value: d.name,
				label: d.name,
			})),
		],
		[departmentsQuery.data],
	);

	const locationOptions = useMemo(
		() => [
			{ value: "all", label: "All Locations" },
			...(locationsQuery.data ?? []).map((l) => ({
				value: l.name,
				label: l.name,
			})),
		],
		[locationsQuery.data],
	);

	const occupationOptions = useMemo(
		() => [
			{ value: "all", label: "All Occupations" },
			...(occupationsQuery.data ?? []).map((o) => ({
				value: o.name,
				label: o.name,
			})),
		],
		[occupationsQuery.data],
	);

	const specialtyOptions = useMemo(() => {
		if (filters.occupation === "all") {
			return [{ value: "all", label: "All Specialties" }];
		}
		return [
			{ value: "all", label: "All Specialties" },
			...(specialtiesForOccupation ?? []).map((s) => ({
				value: s.name,
				label: s.name,
			})),
		];
	}, [filters.occupation, specialtiesForOccupation]);

	const filterConfigs = useMemo(() => {
		return hookFilterConfigs.map((cfg) => {
			switch (cfg.id) {
				case SHIFTS_PARAMS.DEPARTMENT:
					return { ...cfg, options: departmentOptions };
				case SHIFTS_PARAMS.LOCATION:
					return { ...cfg, options: locationOptions };
				case SHIFTS_PARAMS.OCCUPATION:
					return {
						...cfg,
						options: occupationOptions,
						onValueChange: (v: string) =>
							setFilter(SHIFTS_PARAMS.OCCUPATION, v),
					};
				case SHIFTS_PARAMS.SPECIALTY:
					return { ...cfg, options: specialtyOptions };
				default:
					return cfg;
			}
		});
	}, [
		hookFilterConfigs,
		departmentOptions,
		locationOptions,
		occupationOptions,
		specialtyOptions,
		setFilter,
	]);

	return {
		isLoading: listQuery.isLoading,
		page,
		statusFilter,
		searchFromUrl,
		localSearch,
		filters,
		handleSearchChange,
		setFilter,
		setStatusFilter,
		setPage,
		counts: counts ?? {
			ALL: 0,
			OPEN: 0,
			IN_PROGRESS: 0,
			COMPLETED: 0,
			CANCELLED: 0,
		},
		hasActiveFilters,
		totalCount,
		totalPages,
		currentPage,
		pagedShifts,
		filtersExpanded,
		setFiltersExpanded,
		filterConfigs,
	};
}
