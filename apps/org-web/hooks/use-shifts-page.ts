"use client";

import { toIsoDateString } from "@repo/shared";
import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { useUrlQueryState } from "@repo/ui/hooks/use-url-query-state";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
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

export function useShiftsPage() {
	const { id: orgId } = useOrgContext();
	const searchParams = useSearchParams();
	const { pushParams } = useUrlQueryState();
	const { localSearch, searchFromUrl, handleSearchChange } = useDebouncedSearch(
		{ paramKey: "pdSearch", pageParamKey: "pdPage" },
	);

	const pageParam = Number(searchParams.get("pdPage") ?? "1");
	const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

	const statusParam = searchParams.get("status");
	const statusFilter: ShiftStatus | "ALL" =
		statusParam && VALID_STATUSES.includes(statusParam as ShiftStatus)
			? (statusParam as ShiftStatus)
			: "ALL";

	const filters = useMemo(() => {
		return {
			date: searchParams.get("date") ?? "",
			shiftType: searchParams.get("shiftType") ?? "all",
			department: searchParams.get("department") ?? "all",
			location: searchParams.get("location") ?? "all",
			occupation: searchParams.get("occupation") ?? "all",
			specialty: searchParams.get("specialty") ?? "all",
		};
	}, [searchParams]);

	const setFilter = useCallback(
		(key: string, value: string) => {
			const clear =
				!value || value === "all" || (key === "date" && value === "");
			const updates: Record<string, string | null> = {
				[key]: clear ? null : value,
				pdPage: null,
			};

			if (key === "occupation") {
				const prevOcc = searchParams.get("occupation") ?? "all";
				const nextOcc = clear ? "all" : value;
				if (prevOcc !== nextOcc) {
					updates.specialty = null;
				}
			}
			pushParams(updates);
		},
		[pushParams, searchParams],
	);

	const setStatusFilter = useCallback(
		(value: ShiftStatus | "ALL") => {
			pushParams({
				status: value === "ALL" ? null : value,
				pdPage: null,
			});
		},
		[pushParams],
	);

	const setPage = useCallback(
		(nextPage: number) => {
			pushParams({ pdPage: String(nextPage) });
		},
		[pushParams],
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

	const params = useMemo(() => {
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
	}, [
		filters.date,
		filters.department,
		filters.location,
		filters.occupation,
		filters.shiftType,
		filters.specialty,
		page,
		searchFromUrl,
		statusFilter,
	]);

	const listQuery = useQuery({
		queryKey: perDiemShiftsKeys.list(params),
		queryFn: () => PerDiemShiftsService.list(params),
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

	const shiftTypeFilterOptions = useMemo(
		() => [
			{ value: "all", label: "All Shift Types" },
			...SHIFT_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
		],
		[],
	);

	const filterConfigs = useMemo(
		() => [
			{
				id: "shifts-filter-date",
				label: "Date",
				type: "date" as const,
				value: filters.date,
				onValueChange: (value: string) => setFilter("date", value),
				placeholder: "Pick a date",
			},
			{
				id: "shifts-filter-shiftType",
				label: "Shift Type",
				value: filters.shiftType,
				onValueChange: (value: string) => setFilter("shiftType", value),
				placeholder: "All",
				options: shiftTypeFilterOptions,
			},
			{
				id: "shifts-filter-department",
				label: "Department",
				value: filters.department,
				onValueChange: (value: string) => setFilter("department", value),
				placeholder: "All Departments",
				options: departmentOptions,
			},
			{
				id: "shifts-filter-location",
				label: "Location",
				value: filters.location,
				onValueChange: (value: string) => setFilter("location", value),
				placeholder: "All Locations",
				options: locationOptions,
			},
			{
				id: "shifts-filter-occupation",
				label: "Occupation",
				value: filters.occupation,
				onValueChange: (value: string) => setFilter("occupation", value),
				placeholder: "All Occupations",
				options: occupationOptions,
			},
			{
				id: "shifts-filter-specialty",
				label: "Specialty",
				value: filters.specialty,
				onValueChange: (value: string) => setFilter("specialty", value),
				placeholder: "All Specialties",
				options: specialtyOptions,
			},
		],
		[
			departmentOptions,
			filters.date,
			filters.department,
			filters.location,
			filters.occupation,
			filters.shiftType,
			filters.specialty,
			locationOptions,
			occupationOptions,
			setFilter,
			shiftTypeFilterOptions,
			specialtyOptions,
		],
	);

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
