"use client";

import { Action, useAbility } from "@repo/casl";
import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useSearchWithFilters } from "@repo/ui/hooks/use-search-with-filters";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
	ORG_JOBS_SHIFT_FILTER_OPTIONS,
	ORG_JOBS_SHIFT_FILTER_TO_SHIFT_TYPE,
	ORG_JOBS_STATUS_FILTER_OPTIONS,
} from "@/constants/jobs";
import { useRequisitionsList } from "@/queries/requisitions.queries";
import {
	useShiftTemplateDepartments,
	useShiftTemplateLocations,
	useShiftTemplateOccupations,
} from "@/queries/shift-templates.queries";

const DEFAULT_LIMIT = 9;
const PAGE_SIZE_OPTIONS = [9, 18, 27, 36];

const JOBS_PARAMS = {
	SEARCH: "jobSearch",
	PAGE: "pdPage",
	LIMIT: "pdLimit",
	DATE: "date",
	STATUS: "status",
	SHIFT_TYPE: "shiftType",
	LOCATION: "location",
	OCCUPATION: "occupation",
	DEPARTMENT: "department",
	SPECIALTY: "specialty",
} as const;

export function useJobsPage() {
	const router = useRouter();
	const ability = useAbility();
	const canListJobs = ability.can(Action.Read, "Requisition");
	const { page, limit, setPage, setLimit } = usePaginationControls({
		pageParamKey: JOBS_PARAMS.PAGE,
		limitParamKey: JOBS_PARAMS.LIMIT,
		defaultLimit: DEFAULT_LIMIT,
		pageSizeOptions: PAGE_SIZE_OPTIONS,
	});

	const {
		searchValue: localSearch,
		searchFromUrl,
		handleSearchChange,
		values,
		filterConfigs: hookFilterConfigs,
		onFilterChange,
	} = useSearchWithFilters({
		search: { paramKey: JOBS_PARAMS.SEARCH },
		pagination: { pageParamKey: JOBS_PARAMS.PAGE },
		filters: [
			{
				id: JOBS_PARAMS.DATE,
				label: "Date",
				type: "date",
				defaultValue: "",
				placeholder: "dd/mm/yyyy",
			},
			{
				id: JOBS_PARAMS.STATUS,
				label: "Status",
				type: "select",
				defaultValue: "all",
				placeholder: "All Statuses",
				options: [...ORG_JOBS_STATUS_FILTER_OPTIONS],
			},
			{
				id: JOBS_PARAMS.SHIFT_TYPE,
				label: "Shift / type",
				type: "select",
				defaultValue: "all",
				placeholder: "All",
				options: [...ORG_JOBS_SHIFT_FILTER_OPTIONS],
			},
			{
				id: JOBS_PARAMS.LOCATION,
				label: "Location",
				type: "select",
				defaultValue: "all",
			},
			{
				id: JOBS_PARAMS.OCCUPATION,
				label: "Occupation",
				type: "select",
				defaultValue: "all",
			},
			{
				id: JOBS_PARAMS.DEPARTMENT,
				label: "Department",
				type: "select",
				defaultValue: "all",
			},
			{
				id: JOBS_PARAMS.SPECIALTY,
				label: "Specialty",
				type: "select",
				defaultValue: "all",
			},
		],
	});

	const filters = useMemo(() => {
		return {
			date: values[JOBS_PARAMS.DATE] || "",
			status: values[JOBS_PARAMS.STATUS] || "all",
			shiftType: values[JOBS_PARAMS.SHIFT_TYPE] || "all",
			location: values[JOBS_PARAMS.LOCATION] || "all",
			occupation: values[JOBS_PARAMS.OCCUPATION] || "all",
			department: values[JOBS_PARAMS.DEPARTMENT] || "all",
			specialty: values[JOBS_PARAMS.SPECIALTY] || "all",
		};
	}, [values]);

	const [filtersExpanded, setFiltersExpanded] = useState(false);

	const requisitionType =
		filters.shiftType === "permanent" ? "PERMANENT_ROLE" : undefined;
	const shiftTypeParam =
		filters.shiftType === "all" || filters.shiftType === "permanent"
			? undefined
			: ORG_JOBS_SHIFT_FILTER_TO_SHIFT_TYPE[filters.shiftType];

	const listQuery = useRequisitionsList(
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
			limit,
		},
		{ enabled: canListJobs },
	);

	const jobs = listQuery.data?.data ?? [];
	const totalCount = listQuery.data?.total ?? 0;
	const totalPages = listQuery.data?.totalPages ?? 1;

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

	const filterConfigs = useMemo(() => {
		return hookFilterConfigs.map((cfg) => {
			switch (cfg.id) {
				case JOBS_PARAMS.LOCATION:
					return {
						...cfg,
						placeholder: "All Locations",
						options: locationOptions,
					};
				case JOBS_PARAMS.OCCUPATION:
					return {
						...cfg,
						placeholder: "All Occupations",
						options: occupationOptions,
						onValueChange: (v: string) => {
							const updates: Record<string, string | null> = {
								[JOBS_PARAMS.OCCUPATION]: v || null,
							};
							if (values[JOBS_PARAMS.OCCUPATION] !== v) {
								updates[JOBS_PARAMS.SPECIALTY] = null;
							}
							onFilterChange(updates);
						},
					};
				case JOBS_PARAMS.DEPARTMENT:
					return {
						...cfg,
						placeholder: "All Departments",
						options: departmentOptions,
					};
				case JOBS_PARAMS.SPECIALTY:
					return {
						...cfg,
						placeholder: "All Specialties",
						options: specialtyOptions,
					};
				default:
					return cfg;
			}
		});
	}, [
		hookFilterConfigs,
		locationOptions,
		occupationOptions,
		departmentOptions,
		specialtyOptions,
		onFilterChange,
		values,
	]);

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
		limit,
		setLimit,
		pageSizeOptions: PAGE_SIZE_OPTIONS,
		hasActiveFilters,
		isLoading: listQuery.isLoading,
		isError: listQuery.isError,
		listErrorMessage,
		refetchJobs: listQuery.refetch,
		localSearch,
		handleSearchChange,
		filtersExpanded,
		setFiltersExpanded,
		filterConfigs,
		handleCreate,
		handleView,
		handleEdit,
	};
}
