"use client";

import { Action, useAbility } from "@repo/casl";
import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { useUrlQueryState } from "@repo/ui/hooks/use-url-query-state";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	ORG_JOBS_SHIFT_FILTER_OPTIONS,
	ORG_JOBS_SHIFT_FILTER_TO_SHIFT_TYPE,
	ORG_JOBS_STATUS_FILTER_OPTIONS,
} from "@/constants/jobs";
import { useOrgContext } from "@/contexts/org-context";
import { useRequisitionsList } from "@/queries/requisitions.queries";
import {
	useShiftTemplateDepartments,
	useShiftTemplateLocations,
	useShiftTemplateOccupations,
} from "@/queries/shift-templates.queries";

const JOBS_PAGE_SIZE = 9;

export function useJobsPage() {
	const router = useRouter();
	const ability = useAbility();
	const canListJobs = ability.can(Action.Read, "Requisition");
	const { id: orgId } = useOrgContext();
	const searchParams = useSearchParams();
	const { pushParams } = useUrlQueryState();
	const { localSearch, searchFromUrl, handleSearchChange } = useDebouncedSearch(
		{ paramKey: "jobSearch", pageParamKey: null },
	);

	const filters = useMemo(() => {
		return {
			date: searchParams.get("date") ?? "",
			status: searchParams.get("status") ?? "all",
			shiftType: searchParams.get("shiftType") ?? "all",
			location: searchParams.get("location") ?? "all",
			occupation: searchParams.get("occupation") ?? "all",
			department: searchParams.get("department") ?? "all",
			specialty: searchParams.get("specialty") ?? "all",
		};
	}, [searchParams]);

	const [filtersExpanded, setFiltersExpanded] = useState(false);
	const [page, setPage] = useState(1);

	const setFilter = useCallback(
		(
			key:
				| "date"
				| "status"
				| "shiftType"
				| "location"
				| "occupation"
				| "department"
				| "specialty",
			value: string,
		) => {
			const clear =
				!value || value === "all" || (key === "date" && value === "");
			const updates: Record<string, string | null> = {
				[key]: clear ? null : value,
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

	const requisitionType =
		filters.shiftType === "permanent" ? "PERMANENT_ROLE" : undefined;
	const shiftTypeParam =
		filters.shiftType === "all" || filters.shiftType === "permanent"
			? undefined
			: ORG_JOBS_SHIFT_FILTER_TO_SHIFT_TYPE[filters.shiftType];
	const listParamsKey = useMemo(
		() =>
			[
				searchFromUrl.trim(),
				filters.date,
				filters.status,
				filters.shiftType,
				filters.location,
				filters.occupation,
				filters.department,
				filters.specialty,
			].join("|"),
		[
			searchFromUrl,
			filters.date,
			filters.status,
			filters.shiftType,
			filters.location,
			filters.occupation,
			filters.department,
			filters.specialty,
		],
	);

	const listQuery = useRequisitionsList(
		orgId,
		{
			search: searchFromUrl.trim() || undefined,
			cardStatus: filters.status === "all" ? undefined : filters.status,
			shiftType: shiftTypeParam,
			requisitionType,
			locationId: filters.location === "all" ? undefined : filters.location,
			departmentId:
				filters.department === "all" ? undefined : filters.department,
			organizationOccupationId:
				filters.occupation === "all" ? undefined : filters.occupation,
			organizationSpecialtyId:
				filters.specialty === "all" ? undefined : filters.specialty,
			expectedStartDate: filters.date || undefined,
			page,
			limit: JOBS_PAGE_SIZE,
		},
		{ enabled: canListJobs },
	);

	const jobs = listQuery.data?.data ?? [];
	const totalCount = listQuery.data?.total ?? 0;
	const totalPages = listQuery.data?.totalPages ?? 1;

	useEffect(() => {
		void listParamsKey;
		setPage(1);
	}, [listParamsKey]);

	useEffect(() => {
		setPage((prev) => Math.min(prev, totalPages));
	}, [totalPages]);

	const hasActiveFilters = useMemo(() => {
		return (
			searchFromUrl.trim() !== "" ||
			filters.date !== "" ||
			filters.status !== "all" ||
			filters.shiftType !== "all" ||
			filters.location !== "all" ||
			filters.occupation !== "all" ||
			filters.department !== "all" ||
			filters.specialty !== "all"
		);
	}, [filters, searchFromUrl]);

	const locationsQuery = useShiftTemplateLocations({ enabled: canListJobs });
	const departmentsQuery = useShiftTemplateDepartments({
		enabled: canListJobs,
	});
	const occupationsQuery = useShiftTemplateOccupations({
		enabled: canListJobs,
	});
	const locationOptions = useMemo(
		() => [
			{ value: "all", label: "All Locations" },
			...(locationsQuery.data ?? []).map((l) => ({
				value: l.id,
				label: l.name,
			})),
		],
		[locationsQuery.data],
	);

	const departmentOptions = useMemo(
		() => [
			{ value: "all", label: "All Departments" },
			...(departmentsQuery.data ?? []).map((d) => ({
				value: d.id,
				label: d.name,
			})),
		],
		[departmentsQuery.data],
	);

	const occupationOptions = useMemo(
		() => [
			{ value: "all", label: "All Occupations" },
			...(occupationsQuery.data ?? []).map((o) => ({
				value: o.organizationOccupationId,
				label: o.name,
			})),
		],
		[occupationsQuery.data],
	);

	const specialtyOptions = useMemo(() => {
		if (filters.occupation === "all") {
			return [{ value: "all", label: "All Specialties" }];
		}
		const occ = occupationsQuery.data?.find(
			(o) => o.organizationOccupationId === filters.occupation,
		);
		const fromLinked = occ?.organizationSpecialties ?? [];
		return [
			{ value: "all", label: "All Specialties" },
			...fromLinked.map((s) => ({ value: s.id, label: s.name })),
		];
	}, [filters.occupation, occupationsQuery.data]);

	const filterConfigs = useMemo(
		() => [
			{
				id: "jobs-filter-date",
				label: "Date",
				type: "date" as const,
				value: filters.date,
				onValueChange: (value: string) => setFilter("date", value),
				placeholder: "dd/mm/yyyy",
			},
			{
				id: "jobs-filter-status",
				label: "Status",
				value: filters.status,
				onValueChange: (value: string) => setFilter("status", value),
				placeholder: "All Statuses",
				options: [...ORG_JOBS_STATUS_FILTER_OPTIONS],
			},
			{
				id: "jobs-filter-shift",
				label: "Shift / type",
				value: filters.shiftType,
				onValueChange: (value: string) => setFilter("shiftType", value),
				placeholder: "All",
				options: [...ORG_JOBS_SHIFT_FILTER_OPTIONS],
			},
			{
				id: "jobs-filter-location",
				label: "Location",
				value: filters.location,
				onValueChange: (value: string) => setFilter("location", value),
				placeholder: "All Locations",
				options: locationOptions,
			},
			{
				id: "jobs-filter-occupation",
				label: "Occupation",
				value: filters.occupation,
				onValueChange: (value: string) => setFilter("occupation", value),
				placeholder: "All Occupations",
				options: occupationOptions,
			},
			{
				id: "jobs-filter-department",
				label: "Department",
				value: filters.department,
				onValueChange: (value: string) => setFilter("department", value),
				placeholder: "All Departments",
				options: departmentOptions,
			},
			{
				id: "jobs-filter-specialty",
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
			filters.status,
			locationOptions,
			occupationOptions,
			setFilter,
			specialtyOptions,
		],
	);

	const handleCreate = () => {
		router.push("/org/jobs/create");
	};

	const handleView = (id: string) => {
		router.push(`/org/jobs/${id}`);
	};

	const handleEdit = (id: string) => {
		router.push(`/org/jobs/${id}/edit`);
	};

	const listErrorMessage =
		listQuery.error instanceof Error
			? listQuery.error.message
			: "Could not load jobs";

	return {
		canListJobs,
		jobs,
		totalCount,
		page,
		totalPages,
		setPage,
		hasActiveFilters,
		isLoading: listQuery.isLoading,
		isError: listQuery.isError,
		listErrorMessage,
		refetchJobs: listQuery.refetch,
		search: localSearch,
		setSearch: handleSearchChange,
		filtersExpanded,
		setFiltersExpanded,
		filterConfigs,
		handleCreate,
		handleView,
		handleEdit,
	};
}
