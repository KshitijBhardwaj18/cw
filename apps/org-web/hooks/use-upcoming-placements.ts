"use client";

import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useSearchWithFilters } from "@repo/ui/hooks/use-search-with-filters";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useCallback, useMemo, useState } from "react";
import { useOrgContext } from "@/contexts/org-context";
import {
	useOrganizationLocationsForOnboarding,
	useOrgDepartmentsForUsers,
	useOrgMembersForPicker,
} from "@/queries/organizations.queries";
import {
	usePlacementUpcomingCompliance,
	usePlacementUpcomingComplianceCounts,
} from "@/queries/placements.queries";
import { useOrgVendors } from "@/queries/talent-community.queries";
import type { UpcomingPlacementStatKey } from "@/types/credentials";

const UPCOMING_STAT_KEYS: UpcomingPlacementStatKey[] = [
	"TOTAL_UPCOMING",
	"READY_TO_START",
	"IN_PROGRESS",
	"MISSING_ITEMS",
];

const COMPLIANCE_STATUS_MAP: Record<
	UpcomingPlacementStatKey,
	"COMPLETE" | "IN_PROGRESS" | "MISSING" | undefined
> = {
	TOTAL_UPCOMING: undefined,
	READY_TO_START: "COMPLETE",
	IN_PROGRESS: "IN_PROGRESS",
	MISSING_ITEMS: "MISSING",
};

const DEFAULT_PAGE_SIZE = 10;

export const UPCOMING_PLACEMENTS_PARAMS = {
	PAGE: "upPage",
	LIMIT: "upLimit",
	SEARCH: "upSearch",
	LOCATION: "upcomingLocation",
	DEPARTMENT: "upcomingDepartment",
	VENDOR: "upcomingVendor",
	HIRING_MANAGER: "upcomingHiringManager",
	STATUS: "upcomingStatus",
} as const;

export function useUpcomingPlacements() {
	const { id: orgId } = useOrgContext();

	const { page, limit, setPage, setLimit, resetPage } = usePaginationControls({
		pageParamKey: UPCOMING_PLACEMENTS_PARAMS.PAGE,
		limitParamKey: UPCOMING_PLACEMENTS_PARAMS.LIMIT,
		defaultLimit: DEFAULT_PAGE_SIZE,
	});

	const {
		searchValue: localSearch,
		searchFromUrl,
		handleSearchChange,
		values,
		filterConfigs: hookFilterConfigs,
		onFilterChange,
	} = useSearchWithFilters({
		pagination: { pageParamKey: UPCOMING_PLACEMENTS_PARAMS.PAGE },
		search: { paramKey: UPCOMING_PLACEMENTS_PARAMS.SEARCH },
		filters: [
			{
				id: UPCOMING_PLACEMENTS_PARAMS.LOCATION,
				label: "Location",
				type: "select",
				defaultValue: "all",
				placeholder: "All Locations",
			},
			{
				id: UPCOMING_PLACEMENTS_PARAMS.DEPARTMENT,
				label: "Department",
				type: "select",
				defaultValue: "all",
				placeholder: "All Departments",
			},
			{
				id: UPCOMING_PLACEMENTS_PARAMS.VENDOR,
				label: "Vendor",
				type: "select",
				defaultValue: "all",
				placeholder: "All Vendors",
			},
			{
				id: UPCOMING_PLACEMENTS_PARAMS.HIRING_MANAGER,
				label: "Hiring Manager",
				type: "select",
				defaultValue: "all",
				placeholder: "All Hiring Managers",
			},
		],
	});

	const [activeStatKey, setActiveStatKeyState] = useQueryState(
		UPCOMING_PLACEMENTS_PARAMS.STATUS,
		parseAsStringLiteral(UPCOMING_STAT_KEYS).withDefault("TOTAL_UPCOMING"),
	);

	const [filtersExpanded, setFiltersExpanded] = useState(false);

	const locationFilter = values[UPCOMING_PLACEMENTS_PARAMS.LOCATION] || "all";
	const departmentFilter =
		values[UPCOMING_PLACEMENTS_PARAMS.DEPARTMENT] || "all";
	const vendorFilter = values[UPCOMING_PLACEMENTS_PARAMS.VENDOR] || "all";
	const hiringManagerFilter =
		values[UPCOMING_PLACEMENTS_PARAMS.HIRING_MANAGER] || "all";

	const complianceStatus = activeStatKey
		? COMPLIANCE_STATUS_MAP[activeStatKey]
		: undefined;

	const baseFilters = {
		search: searchFromUrl || undefined,
		locationId: locationFilter !== "all" ? locationFilter : undefined,
		departmentId: departmentFilter !== "all" ? departmentFilter : undefined,
		vendorId: vendorFilter !== "all" ? vendorFilter : undefined,
		hiringManagerId:
			hiringManagerFilter !== "all" ? hiringManagerFilter : undefined,
	};

	const listQuery = { ...baseFilters, complianceStatus, page, limit };

	const { data: countsData } = usePlacementUpcomingComplianceCounts(
		orgId,
		baseFilters,
	);
	const { data, isLoading } = usePlacementUpcomingCompliance(orgId, listQuery);

	const totalCount = data?.total ?? 0;
	const pageCount = Math.ceil(totalCount / limit) || 1;

	const locationsQuery = useOrganizationLocationsForOnboarding(orgId);
	const departmentsQuery = useOrgDepartmentsForUsers(orgId);
	const vendorsQuery = useOrgVendors(orgId);
	const membersQuery = useOrgMembersForPicker(orgId);

	const locationOptions = useMemo(
		() => [
			{ value: "all", label: "All Locations" },
			...(locationsQuery.data?.data ?? []).map((l) => ({
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

	const vendorOptions = useMemo(
		() => [
			{ value: "all", label: "All Vendors" },
			...(vendorsQuery.data ?? []).map((v) => ({
				value: v.id,
				label: v.name,
			})),
		],
		[vendorsQuery.data],
	);

	const hiringManagerOptions = useMemo(
		() => [
			{ value: "all", label: "All Hiring Managers" },
			...(membersQuery.data?.data ?? []).map((m) => ({
				value: m.user.id,
				label: m.user.name,
			})),
		],
		[membersQuery.data],
	);

	const toggleStatFilter = useCallback(
		(nextKey: UpcomingPlacementStatKey) => {
			void setActiveStatKeyState(
				activeStatKey === nextKey ? "TOTAL_UPCOMING" : nextKey,
			);
			resetPage();
		},
		[activeStatKey, setActiveStatKeyState, resetPage],
	);

	const setLocationFilter = useCallback(
		(value: string) => {
			onFilterChange({
				[UPCOMING_PLACEMENTS_PARAMS.LOCATION]: value === "all" ? null : value,
			});
		},
		[onFilterChange],
	);

	const setDepartmentFilter = useCallback(
		(value: string) => {
			onFilterChange({
				[UPCOMING_PLACEMENTS_PARAMS.DEPARTMENT]: value === "all" ? null : value,
			});
		},
		[onFilterChange],
	);

	const setVendorFilter = useCallback(
		(value: string) => {
			onFilterChange({
				[UPCOMING_PLACEMENTS_PARAMS.VENDOR]: value === "all" ? null : value,
			});
		},
		[onFilterChange],
	);

	const setHiringManagerFilter = useCallback(
		(value: string) => {
			onFilterChange({
				[UPCOMING_PLACEMENTS_PARAMS.HIRING_MANAGER]:
					value === "all" ? null : value,
			});
		},
		[onFilterChange],
	);

	const filterConfigs = useMemo(() => {
		return hookFilterConfigs.map((cfg) => {
			switch (cfg.id) {
				case UPCOMING_PLACEMENTS_PARAMS.LOCATION:
					return { ...cfg, options: locationOptions };
				case UPCOMING_PLACEMENTS_PARAMS.DEPARTMENT:
					return { ...cfg, options: departmentOptions };
				case UPCOMING_PLACEMENTS_PARAMS.VENDOR:
					return { ...cfg, options: vendorOptions };
				case UPCOMING_PLACEMENTS_PARAMS.HIRING_MANAGER:
					return { ...cfg, options: hiringManagerOptions };
				default:
					return cfg;
			}
		});
	}, [
		hookFilterConfigs,
		locationOptions,
		departmentOptions,
		vendorOptions,
		hiringManagerOptions,
	]);

	return {
		activeStatKey,
		countsByStat: countsData ?? {
			TOTAL_UPCOMING: 0,
			READY_TO_START: 0,
			IN_PROGRESS: 0,
			MISSING_ITEMS: 0,
		},
		upcomingPlacementRows: data?.data ?? [],
		totalCount,
		page,
		pageCount,
		limit,
		onPaginationChange: (p: number, size: number) => {
			setPage(p);
			setLimit(size);
		},
		isLoading,
		search: localSearch,
		setSearch: handleSearchChange,
		locationFilter,
		setLocationFilter,
		locationOptions,
		departmentFilter,
		setDepartmentFilter,
		departmentOptions,
		vendorFilter,
		setVendorFilter,
		vendorOptions,
		hiringManagerFilter,
		setHiringManagerFilter,
		hiringManagerOptions,
		toggleStatFilter,
		filtersExpanded,
		setFiltersExpanded,
		filterConfigs,
	};
}
