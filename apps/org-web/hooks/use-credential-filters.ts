"use client";

import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useSearchWithFilters } from "@repo/ui/hooks/use-search-with-filters";
import { useCallback, useMemo, useState } from "react";
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

export const CRED_PARAMS = {
	SEARCH: "credSearch",
	PAGE: "credPage",
	LIMIT: "credLimit",
	LOCATION: "location",
	DEPARTMENT: "department",
	VENDOR: "vendor",
	HIRING_MANAGER: "hiringManager",
	STATUS: "status",
} as const;

export function useCredentialFilters() {
	const { page, limit, setPage, setLimit } = usePaginationControls({
		pageParamKey: CRED_PARAMS.PAGE,
		limitParamKey: CRED_PARAMS.LIMIT,
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
		search: { paramKey: CRED_PARAMS.SEARCH },
		pagination: { pageParamKey: CRED_PARAMS.PAGE },
		filters: [
			{
				id: CRED_PARAMS.LOCATION,
				label: "Location",
				type: "select",
				defaultValue: "all",
			},
			{
				id: CRED_PARAMS.DEPARTMENT,
				label: "Department",
				type: "select",
				defaultValue: "all",
			},
			{
				id: CRED_PARAMS.VENDOR,
				label: "Vendor",
				type: "select",
				defaultValue: "all",
			},
			{
				id: CRED_PARAMS.HIRING_MANAGER,
				label: "Hiring Manager",
				type: "select",
				defaultValue: "all",
			},
			{
				id: CRED_PARAMS.STATUS,
				label: "Status",
				type: "select",
				defaultValue: "all",
			},
		],
	});

	const [filtersExpanded, setFiltersExpanded] = useState(false);

	const locationFilter = values[CRED_PARAMS.LOCATION] || "all";
	const departmentFilter = values[CRED_PARAMS.DEPARTMENT] || "all";
	const vendorFilter = values[CRED_PARAMS.VENDOR] || "all";
	const hiringManagerFilter = values[CRED_PARAMS.HIRING_MANAGER] || "all";
	const statusFilterRaw = values[CRED_PARAMS.STATUS];
	const statusFilter =
		statusFilterRaw &&
		VALID_STATUSES.includes(statusFilterRaw as CredentialStatus)
			? (statusFilterRaw as CredentialStatus)
			: null;

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

	const { data: countsData } = usePlacementCredentialCounts(baseFilters);
	const { data, isLoading } = usePlacementCredentials(listQuery);

	const totalCount = data?.total ?? 0;
	const pageCount = Math.ceil(totalCount / limit) || 1;

	const locationsQuery = useOrganizationLocationsForOnboarding();
	const departmentsQuery = useOrgDepartmentsForUsers();
	const vendorsQuery = useOrgVendors();
	const membersQuery = useOrgMembersForPicker();

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

	const toggleStatusFilter = useCallback(
		(nextStatus: CredentialStatus) => {
			onFilterChange(
				CRED_PARAMS.STATUS,
				statusFilter === nextStatus ? "all" : nextStatus,
			);
		},
		[statusFilter, onFilterChange],
	);

	const filterConfigs = useMemo(() => {
		return hookFilterConfigs
			.filter((cfg) => cfg.id !== CRED_PARAMS.STATUS)
			.map((cfg) => {
				switch (cfg.id) {
					case CRED_PARAMS.LOCATION:
						return {
							...cfg,
							options: locationOptions,
							placeholder: "All Locations",
						};
					case CRED_PARAMS.DEPARTMENT:
						return {
							...cfg,
							options: departmentOptions,
							placeholder: "All Departments",
						};
					case CRED_PARAMS.VENDOR:
						return {
							...cfg,
							options: vendorOptions,
							placeholder: "All Vendors",
						};
					case CRED_PARAMS.HIRING_MANAGER:
						return {
							...cfg,
							options: hiringManagerOptions,
							placeholder: "All Hiring Managers",
						};
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
		localSearch,
		handleSearchChange,
		filtersExpanded,
		setFiltersExpanded,
		filterConfigs,
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
		setPage,
		setLimit,
		isLoading,
		statusFilter,
		toggleStatusFilter,
		onFilterChange,
	};
}
