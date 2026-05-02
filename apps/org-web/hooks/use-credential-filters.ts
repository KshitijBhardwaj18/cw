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
	usePlacementCredentialCounts,
	usePlacementCredentials,
} from "@/queries/placements.queries";
import { useOrgVendors } from "@/queries/talent-community.queries";
import type { CredentialStatus } from "@/types/credentials";

const VALID_STATUSES: CredentialStatus[] = [
	"EXPIRING_SOON",
	"EXPIRED",
	"CRITICAL",
];

const DEFAULT_PAGE_SIZE = 10;

export function useCredentialFilters() {
	const { id: orgId } = useOrgContext();
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);

	const { getValue, updateValues } = useUrlFilters({
		paramMap: {
			search: "search",
			location: "location",
			department: "department",
			vendor: "vendor",
			hiringManager: "hiringManager",
			status: "status",
		},
		resetOnChange: ["page"],
	});

	const searchFromUrl = getValue("search", "");
	const [search, setSearch] = useState(searchFromUrl);
	const [filtersExpanded, setFiltersExpanded] = useState(false);

	useEffect(() => {
		setSearch(searchFromUrl);
	}, [searchFromUrl]);

	const locationFilter = getValue("location", "all");
	const departmentFilter = getValue("department", "all");
	const vendorFilter = getValue("vendor", "all");
	const hiringManagerFilter = getValue("hiringManager", "all");

	const statusParam = getValue("status", "");
	const statusFilter =
		statusParam && VALID_STATUSES.includes(statusParam as CredentialStatus)
			? (statusParam as CredentialStatus)
			: null;

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

	const baseFilters = {
		locationId: locationFilter !== "all" ? locationFilter : undefined,
		departmentId: departmentFilter !== "all" ? departmentFilter : undefined,
		vendorId: vendorFilter !== "all" ? vendorFilter : undefined,
		hiringManagerId:
			hiringManagerFilter !== "all" ? hiringManagerFilter : undefined,
	};

	const listQuery = {
		...baseFilters,
		search: searchFromUrl || undefined,
		status: statusFilter ?? undefined,
		page,
		limit,
	};

	const { data: countsData } = usePlacementCredentialCounts(orgId, baseFilters);
	const { data, isLoading } = usePlacementCredentials(orgId, listQuery);

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

	const toggleStatusFilter = useCallback(
		(nextStatus: CredentialStatus) => {
			setPage(1);
			updateValues({
				status: statusFilter === nextStatus ? undefined : nextStatus,
			});
		},
		[statusFilter, updateValues],
	);

	const filterConfigs = useMemo(
		() => [
			{
				id: "credentials-filter-location",
				label: "Location",
				value: locationFilter,
				onValueChange: setLocationFilter,
				placeholder: "All Locations",
				options: locationOptions,
			},
			{
				id: "credentials-filter-department",
				label: "Department",
				value: departmentFilter,
				onValueChange: setDepartmentFilter,
				placeholder: "All Departments",
				options: departmentOptions,
			},
			{
				id: "credentials-filter-vendor",
				label: "Vendor",
				value: vendorFilter,
				onValueChange: setVendorFilter,
				placeholder: "All Vendors",
				options: vendorOptions,
			},
			{
				id: "credentials-filter-hiring-manager",
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
		search,
		setSearch: handleSearchChange,
		filtersExpanded,
		setFiltersExpanded,
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
		statusFilter,
		toggleStatusFilter,
		countsByStatus: countsData ?? {
			EXPIRING_SOON: 0,
			EXPIRED: 0,
			CRITICAL: 0,
		},
		credentialRows: data?.data ?? [],
		totalCount,
		page,
		pageCount,
		limit,
		onPaginationChange: (p: number, size: number) => {
			setPage(p);
			setLimit(size);
		},
		isLoading,
		filterConfigs,
	};
}
