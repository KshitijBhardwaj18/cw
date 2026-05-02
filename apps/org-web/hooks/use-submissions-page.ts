"use client";

import { MemberRole } from "@repo/shared";
import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { useUrlQueryState } from "@repo/ui/hooks/use-url-query-state";
import { useSearchParams } from "next/navigation";
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

const PAGE_SIZE = 10;
const AGING_SET = new Set<SubmissionAgingFilter>([
	"ALL",
	"OVERDUE",
	"NEAR",
	"WITHIN",
]);

function parseAging(raw: string | null): SubmissionAgingFilter {
	if (raw && AGING_SET.has(raw as SubmissionAgingFilter)) {
		return raw as SubmissionAgingFilter;
	}
	return "ALL";
}

export interface UseSubmissionsPageOptions {
	/** Ordered list of stage tabs the current user can Read, per CASL. */
	allowedStages: readonly SubmissionStageKey[];
}

export function useSubmissionsPage(
	orgId: string | undefined,
	{ allowedStages }: UseSubmissionsPageOptions,
) {
	const searchParams = useSearchParams();
	const { pushParams } = useUrlQueryState();
	const { localSearch, searchFromUrl, handleSearchChange } = useDebouncedSearch(
		{ paramKey: "subSearch", pageParamKey: "subPage" },
	);

	const pageParam = Number(searchParams.get("subPage") ?? "1");
	const currentPage =
		Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

	const vendorFilter = searchParams.get("subVendor") ?? "all";
	const hiringManagerFilter = searchParams.get("subHm") ?? "all";
	const departmentFilter = searchParams.get("subDept") ?? "all";
	const locationFilter = searchParams.get("subLoc") ?? "all";
	const agingFilter = parseAging(searchParams.get("subAging"));

	const [filtersExpanded, setFiltersExpanded] = useState(false);

	const safeActiveStage: SubmissionStageKey | null = useMemo(() => {
		if (allowedStages.length === 0) {
			return null;
		}
		const fromUrl = searchParams.get("subStage") as SubmissionStageKey | null;
		if (fromUrl && allowedStages.includes(fromUrl)) {
			return fromUrl;
		}
		return allowedStages[0];
	}, [allowedStages, searchParams]);

	const setVendorFilter = useCallback(
		(v: string) => {
			const clear = !v || v === "all";
			pushParams({ subVendor: clear ? null : v, subPage: null });
		},
		[pushParams],
	);

	const setHiringManagerFilter = useCallback(
		(v: string) => {
			const clear = !v || v === "all";
			pushParams({ subHm: clear ? null : v, subPage: null });
		},
		[pushParams],
	);

	const setDepartmentFilter = useCallback(
		(v: string) => {
			const clear = !v || v === "all";
			pushParams({ subDept: clear ? null : v, subPage: null });
		},
		[pushParams],
	);

	const setLocationFilter = useCallback(
		(v: string) => {
			const clear = !v || v === "all";
			pushParams({ subLoc: clear ? null : v, subPage: null });
		},
		[pushParams],
	);

	const setAgingFilter = useCallback(
		(v: SubmissionAgingFilter) => {
			pushParams({ subAging: v === "ALL" ? null : v, subPage: null });
		},
		[pushParams],
	);

	const setCurrentPage = useCallback(
		(p: number) => {
			pushParams({ subPage: String(p) });
		},
		[pushParams],
	);

	const oid = orgId ?? "";
	const hasActiveStage = safeActiveStage !== null;
	const vendorsQuery = useOrgVendors(oid);
	const hiringManagersQuery = useOrgMembersForPicker(oid, {
		role: MemberRole.HIRING_MANAGER,
	});
	const departmentsQuery = useShiftTemplateDepartments();
	const locationsQuery = useShiftTemplateLocations();

	const listParams = useMemo(
		() => ({
			stage: safeActiveStage ?? SUBMISSION_STAGE_TABS[0].stage,
			agingBucket: agingFilter,
			search: searchFromUrl.trim() || undefined,
			vendorId: vendorFilter === "all" ? undefined : vendorFilter,
			hiringManagerId:
				hiringManagerFilter === "all" ? undefined : hiringManagerFilter,
			departmentId: departmentFilter === "all" ? undefined : departmentFilter,
			locationId: locationFilter === "all" ? undefined : locationFilter,
			page: currentPage,
			limit: PAGE_SIZE,
		}),
		[
			safeActiveStage,
			agingFilter,
			searchFromUrl,
			vendorFilter,
			hiringManagerFilter,
			departmentFilter,
			locationFilter,
			currentPage,
		],
	);

	const listQuery = useOrgSubmissionsList(orgId, listParams, {
		enabled: hasActiveStage,
	});

	const agingStatsParams = useMemo(
		() => ({
			stage: safeActiveStage ?? SUBMISSION_STAGE_TABS[0].stage,
			search: searchFromUrl.trim() || undefined,
			vendorId: vendorFilter === "all" ? undefined : vendorFilter,
			hiringManagerId:
				hiringManagerFilter === "all" ? undefined : hiringManagerFilter,
			departmentId: departmentFilter === "all" ? undefined : departmentFilter,
			locationId: locationFilter === "all" ? undefined : locationFilter,
		}),
		[
			safeActiveStage,
			searchFromUrl,
			vendorFilter,
			hiringManagerFilter,
			departmentFilter,
			locationFilter,
		],
	);

	const stageCountsQuery = useOrgSubmissionStageCounts(orgId, {
		enabled: hasActiveStage,
	});
	const agingCountsQuery = useOrgSubmissionAgingCounts(
		orgId,
		agingStatsParams,
		{ enabled: hasActiveStage },
	);

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

	const handleStageChange = useCallback(
		(stage: SubmissionStageKey) => {
			if (!allowedStages.includes(stage)) {
				return;
			}
			pushParams({
				subStage: stage,
				subAging: null,
				subPage: null,
			});
		},
		[allowedStages, pushParams],
	);

	const setPage = useCallback(
		(page: number, _pageSize: number) => {
			setCurrentPage(page);
		},
		[setCurrentPage],
	);

	const isLoading = listQuery.isLoading;
	const isError = listQuery.isError;
	const listErrorMessage =
		listQuery.error instanceof Error
			? listQuery.error.message
			: "Could not load submissions.";

	const filterConfigs = useMemo(
		() => [
			{
				id: "sub-filter-vendor",
				label: "Vendor",
				value: vendorFilter,
				onValueChange: setVendorFilter,
				placeholder: "All",
				options: filterOptions.vendors,
			},
			{
				id: "sub-filter-hm",
				label: "Hiring manager",
				value: hiringManagerFilter,
				onValueChange: setHiringManagerFilter,
				placeholder: "All Hiring Managers",
				options: filterOptions.managers,
			},
			{
				id: "sub-filter-dept",
				label: "Department",
				value: departmentFilter,
				onValueChange: setDepartmentFilter,
				placeholder: "All Departments",
				options: filterOptions.departments,
			},
			{
				id: "sub-filter-loc",
				label: "Location",
				value: locationFilter,
				onValueChange: setLocationFilter,
				placeholder: "All Locations",
				options: filterOptions.locations,
			},
		],
		[
			departmentFilter,
			filterOptions,
			hiringManagerFilter,
			locationFilter,
			setDepartmentFilter,
			setHiringManagerFilter,
			setLocationFilter,
			setVendorFilter,
			vendorFilter,
		],
	);

	return {
		activeStage: safeActiveStage,
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
		currentPage,
		totalPages,
		pageSize: PAGE_SIZE,
		setPage,
		isLoading,
		isError,
		listErrorMessage,
	};
}
