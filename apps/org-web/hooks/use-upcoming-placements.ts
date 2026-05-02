"use client";

import { useDebouncedCallback } from "@tanstack/react-pacer";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useOrgContext } from "@/contexts/org-context";
import { useUrlFilters } from "@/hooks/use-url-filters";
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

export function useUpcomingPlacements() {
	const { id: orgId } = useOrgContext();
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);

	const { getValue, updateValues } = useUrlFilters({
		paramMap: {
			search: "search",
			location: "upcomingLocation",
			department: "upcomingDepartment",
			vendor: "upcomingVendor",
			hiringManager: "upcomingHiringManager",
			status: "upcomingStatus",
		},
	});

	const statParam = getValue("status", "");
	const activeStatKey: UpcomingPlacementStatKey | null =
		statParam &&
		UPCOMING_STAT_KEYS.includes(statParam as UpcomingPlacementStatKey)
			? (statParam as UpcomingPlacementStatKey)
			: null;

	const searchFromUrl = getValue("search", "");
	const locationFilter = getValue("location", "all");
	const departmentFilter = getValue("department", "all");
	const vendorFilter = getValue("vendor", "all");
	const hiringManagerFilter = getValue("hiringManager", "all");
	const [search, setSearch] = useState(searchFromUrl);
	const [filtersExpanded, setFiltersExpanded] = useState(false);

	useEffect(() => {
		setSearch(searchFromUrl);
	}, [searchFromUrl]);

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
			setPage(1);
			updateValues({
				status: activeStatKey === nextKey ? undefined : nextKey,
			});
		},
		[activeStatKey, updateValues],
	);

	const debouncedReplaceSearch = useDebouncedCallback(
		(value: string) => {
			setPage(1);
			updateValues({ search: value || undefined }, { navigation: "replace" });
		},
		{ wait: 300 },
	);

	const handleSearchChange = useCallback(
		(value: string) => {
			setSearch(value);
			debouncedReplaceSearch(value);
		},
		[debouncedReplaceSearch],
	);

	const setLocationFilter = useCallback(
		(value: string) => {
			setPage(1);
			updateValues({ location: value === "all" ? undefined : value });
		},
		[updateValues],
	);

	const setDepartmentFilter = useCallback(
		(value: string) => {
			setPage(1);
			updateValues({ department: value === "all" ? undefined : value });
		},
		[updateValues],
	);

	const setVendorFilter = useCallback(
		(value: string) => {
			setPage(1);
			updateValues({ vendor: value === "all" ? undefined : value });
		},
		[updateValues],
	);

	const setHiringManagerFilter = useCallback(
		(value: string) => {
			setPage(1);
			updateValues({ hiringManager: value === "all" ? undefined : value });
		},
		[updateValues],
	);

	const filterConfigs = useMemo(
		() => [
			{
				id: "upcoming-filter-location",
				label: "Location",
				value: locationFilter,
				onValueChange: setLocationFilter,
				placeholder: "All Locations",
				options: locationOptions,
			},
			{
				id: "upcoming-filter-department",
				label: "Department",
				value: departmentFilter,
				onValueChange: setDepartmentFilter,
				placeholder: "All Departments",
				options: departmentOptions,
			},
			{
				id: "upcoming-filter-vendor",
				label: "Vendor",
				value: vendorFilter,
				onValueChange: setVendorFilter,
				placeholder: "All Vendors",
				options: vendorOptions,
			},
			{
				id: "upcoming-filter-hiring-manager",
				label: "Hiring Manager",
				value: hiringManagerFilter,
				onValueChange: setHiringManagerFilter,
				placeholder: "All Hiring Managers",
				options: hiringManagerOptions,
			},
		],
		[
			departmentFilter,
			departmentOptions,
			hiringManagerFilter,
			hiringManagerOptions,
			locationFilter,
			locationOptions,
			setDepartmentFilter,
			setHiringManagerFilter,
			setLocationFilter,
			setVendorFilter,
			vendorFilter,
			vendorOptions,
		],
	);

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
		search,
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
