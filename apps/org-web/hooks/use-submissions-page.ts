"use client";

import { MemberRole } from "@repo/shared";
import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useSearchWithFilters } from "@repo/ui/hooks/use-search-with-filters";
import { useTabSwitch } from "@repo/ui/hooks/use-tab-switch";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useCallback, useMemo, useState } from "react";
import {
	SUBMISSION_STAGE_TABS,
	type SubmissionAgingFilter,
	type SubmissionStageKey,
} from "@/constants/submissions";
import { useOrgMembersForPicker } from "@/queries/organizations.queries";
import {
	useShiftTemplateDepartments,
	useShiftTemplateLocations,
} from "@/queries/shift-templates.queries";
import {
	useOrgSubmissionAgingCounts,
	useOrgSubmissionStageCounts,
	useOrgSubmissionsList,
} from "@/queries/submissions.queries";
import { useOrgVendors } from "@/queries/talent-community.queries";

export interface SubmissionFilterOptions {
	vendors: { value: string; label: string }[];
	managers: { value: string; label: string }[];
	departments: { value: string; label: string }[];
	locations: { value: string; label: string }[];
}

const DEFAULT_LIMIT = 10;
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export interface UseSubmissionsPageOptions {
	/** Ordered list of stage tabs the current user can Read, per CASL. */
	allowedStages: readonly SubmissionStageKey[];
}

export const SUBMISSIONS_PARAMS = {
	PAGE: "subPage",
	LIMIT: "subLimit",
	SEARCH: "subSearch",
	STAGE: "subStage",
	VENDOR: "subVendor",
	HIRING_MANAGER: "subHm",
	DEPARTMENT: "subDept",
	LOCATION: "subLoc",
	AGING: "subAging",
} as const;

export function useSubmissionsPage({
	allowedStages,
}: UseSubmissionsPageOptions) {
	const [activeStage, handleStageChange] = useTabSwitch<SubmissionStageKey>(
		allowedStages.length > 0 ? [...allowedStages] : ["SUBMITTED"],
		{
			paramKey: SUBMISSIONS_PARAMS.STAGE,
			alsoClearParamKeys: [
				SUBMISSIONS_PARAMS.PAGE,
				SUBMISSIONS_PARAMS.LIMIT,
				SUBMISSIONS_PARAMS.SEARCH,
				SUBMISSIONS_PARAMS.VENDOR,
				SUBMISSIONS_PARAMS.HIRING_MANAGER,
				SUBMISSIONS_PARAMS.DEPARTMENT,
				SUBMISSIONS_PARAMS.LOCATION,
				SUBMISSIONS_PARAMS.AGING,
			],
		},
	);

	const { page, limit, setPage, setLimit, resetPage } = usePaginationControls({
		pageParamKey: SUBMISSIONS_PARAMS.PAGE,
		limitParamKey: SUBMISSIONS_PARAMS.LIMIT,
		defaultLimit: DEFAULT_LIMIT,
		pageSizeOptions: PAGE_SIZE_OPTIONS,
	});

	const {
		searchFromUrl,
		searchValue: localSearch,
		handleSearchChange,
		values,
		filterConfigs: hookFilterConfigs,
		onFilterChange,
	} = useSearchWithFilters({
		pagination: { pageParamKey: SUBMISSIONS_PARAMS.PAGE },
		search: { paramKey: SUBMISSIONS_PARAMS.SEARCH },
		filters: [
			{
				id: SUBMISSIONS_PARAMS.VENDOR,
				label: "Vendor",
				type: "select",
				defaultValue: "all",
				placeholder: "All",
			},
			{
				id: SUBMISSIONS_PARAMS.HIRING_MANAGER,
				label: "Hiring manager",
				type: "select",
				defaultValue: "all",
				placeholder: "All Hiring Managers",
			},
			{
				id: SUBMISSIONS_PARAMS.DEPARTMENT,
				label: "Department",
				type: "select",
				defaultValue: "all",
				placeholder: "All Departments",
			},
			{
				id: SUBMISSIONS_PARAMS.LOCATION,
				label: "Location",
				type: "select",
				defaultValue: "all",
				placeholder: "All Locations",
			},
		],
	});

	const [agingFilter, setAgingFilterState] = useQueryState(
		SUBMISSIONS_PARAMS.AGING,
		parseAsStringLiteral(["ALL", "OVERDUE", "NEAR", "WITHIN"]).withDefault(
			"ALL",
		),
	);

	const vendorFilter = values[SUBMISSIONS_PARAMS.VENDOR] || "all";
	const hiringManagerFilter =
		values[SUBMISSIONS_PARAMS.HIRING_MANAGER] || "all";
	const departmentFilter = values[SUBMISSIONS_PARAMS.DEPARTMENT] || "all";
	const locationFilter = values[SUBMISSIONS_PARAMS.LOCATION] || "all";

	const [filtersExpanded, setFiltersExpanded] = useState(false);

	const setVendorFilter = useCallback(
		(v: string) => {
			onFilterChange({ [SUBMISSIONS_PARAMS.VENDOR]: v === "all" ? null : v });
		},
		[onFilterChange],
	);

	const setHiringManagerFilter = useCallback(
		(v: string) => {
			onFilterChange({
				[SUBMISSIONS_PARAMS.HIRING_MANAGER]: v === "all" ? null : v,
			});
		},
		[onFilterChange],
	);

	const setDepartmentFilter = useCallback(
		(v: string) => {
			onFilterChange({
				[SUBMISSIONS_PARAMS.DEPARTMENT]: v === "all" ? null : v,
			});
		},
		[onFilterChange],
	);

	const setLocationFilter = useCallback(
		(v: string) => {
			onFilterChange({ [SUBMISSIONS_PARAMS.LOCATION]: v === "all" ? null : v });
		},
		[onFilterChange],
	);

	const setAgingFilter = useCallback(
		(v: SubmissionAgingFilter) => {
			void setAgingFilterState(v);
			resetPage();
		},
		[setAgingFilterState, resetPage],
	);

	const hasActiveStage = activeStage !== null;
	const vendorsQuery = useOrgVendors();
	const hiringManagersQuery = useOrgMembersForPicker({
		role: MemberRole.HIRING_MANAGER,
	});
	const departmentsQuery = useShiftTemplateDepartments();
	const locationsQuery = useShiftTemplateLocations();

	const listParams = useMemo(
		() => ({
			stage: activeStage ?? SUBMISSION_STAGE_TABS[0].stage,
			agingBucket: agingFilter,
			search: searchFromUrl.trim() || undefined,
			vendorId: vendorFilter === "all" ? undefined : vendorFilter,
			hiringManagerId:
				hiringManagerFilter === "all" ? undefined : hiringManagerFilter,
			departmentId: departmentFilter === "all" ? undefined : departmentFilter,
			locationId: locationFilter === "all" ? undefined : locationFilter,
			page,
			limit,
		}),
		[
			activeStage,
			agingFilter,
			searchFromUrl,
			vendorFilter,
			hiringManagerFilter,
			departmentFilter,
			locationFilter,
			page,
			limit,
		],
	);

	const listQuery = useOrgSubmissionsList(listParams, {
		enabled: hasActiveStage,
	});

	const agingStatsParams = useMemo(
		() => ({
			stage: activeStage ?? SUBMISSION_STAGE_TABS[0].stage,
			search: searchFromUrl.trim() || undefined,
			vendorId: vendorFilter === "all" ? undefined : vendorFilter,
			hiringManagerId:
				hiringManagerFilter === "all" ? undefined : hiringManagerFilter,
			departmentId: departmentFilter === "all" ? undefined : departmentFilter,
			locationId: locationFilter === "all" ? undefined : locationFilter,
		}),
		[
			activeStage,
			searchFromUrl,
			vendorFilter,
			hiringManagerFilter,
			departmentFilter,
			locationFilter,
		],
	);

	const stageCountsQuery = useOrgSubmissionStageCounts({
		enabled: hasActiveStage,
	});
	const agingCountsQuery = useOrgSubmissionAgingCounts(agingStatsParams, {
		enabled: hasActiveStage,
	});

	const filterOptions = useMemo((): SubmissionFilterOptions => {
		const vendors = vendorsQuery.data ?? [];
		const members = hiringManagersQuery.data?.data ?? [];
		const departments = departmentsQuery.data ?? [];
		const locations = locationsQuery.data ?? [];

		return {
			vendors: [
				{ value: "all", label: "All Vendors" },
				...vendors.map((v) => ({ value: v.id, label: v.name })),
			],
			managers: [
				{ value: "all", label: "All Hiring Managers" },
				...members.map((m) => ({
					value: m.user.id,
					label: m.user.name?.trim() || "—",
				})),
			],
			departments: [
				{ value: "all", label: "All Departments" },
				...departments.map((d) => ({ value: d.id, label: d.name })),
			],
			locations: [
				{ value: "all", label: "All Locations" },
				...locations.map((l) => ({ value: l.id, label: l.name })),
			],
		};
	}, [
		vendorsQuery.data,
		hiringManagersQuery.data,
		departmentsQuery.data,
		locationsQuery.data,
	]);

	const rows = listQuery.data?.data ?? [];
	const totalCount = listQuery.data?.total ?? 0;
	const totalPages = listQuery.data?.totalPages ?? 1;

	const stageCounts = useMemo(() => {
		const fromApi = stageCountsQuery.data;
		const map = {} as Record<SubmissionStageKey, number>;
		for (const t of SUBMISSION_STAGE_TABS) {
			map[t.stage] = fromApi?.[t.stage] ?? 0;
		}
		return map;
	}, [stageCountsQuery.data]);

	const agingCounts = useMemo(() => {
		return (
			agingCountsQuery.data ?? {
				ALL: 0,
				OVERDUE: 0,
				NEAR: 0,
				WITHIN: 0,
			}
		);
	}, [agingCountsQuery.data]);

	const isLoading = listQuery.isLoading;
	const isError = listQuery.isError;
	const listErrorMessage =
		listQuery.error instanceof Error
			? listQuery.error.message
			: "Could not load submissions.";

	const filterConfigs = useMemo(() => {
		return hookFilterConfigs.map((cfg) => {
			switch (cfg.id) {
				case SUBMISSIONS_PARAMS.VENDOR:
					return { ...cfg, options: filterOptions.vendors };
				case SUBMISSIONS_PARAMS.HIRING_MANAGER:
					return { ...cfg, options: filterOptions.managers };
				case SUBMISSIONS_PARAMS.DEPARTMENT:
					return { ...cfg, options: filterOptions.departments };
				case SUBMISSIONS_PARAMS.LOCATION:
					return { ...cfg, options: filterOptions.locations };
				default:
					return cfg;
			}
		});
	}, [hookFilterConfigs, filterOptions]);

	return {
		activeStage,
		handleStageChange,
		agingFilter,
		setAgingFilter,
		search: localSearch,
		setSearch: handleSearchChange,
		filtersExpanded,
		setFiltersExpanded,
		vendorFilter,
		setVendorFilter,
		hiringManagerFilter,
		setHiringManagerFilter,
		departmentFilter,
		setDepartmentFilter,
		locationFilter,
		setLocationFilter,
		filterOptions,
		filterConfigs,
		rows,
		stageCounts,
		agingCounts,
		totalCount,
		currentPage: page,
		totalPages,
		pageSize: limit,
		pageSizeOptions: PAGE_SIZE_OPTIONS,
		setPage: (p: number) => setPage(p),
		setLimit,
		isLoading,
		isError,
		listErrorMessage,
	};
}
