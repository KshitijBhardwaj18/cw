import { useEffect, useMemo, useState } from "react";
import { useOrgContext } from "@/contexts/org-context";
import { usePlacementFilters } from "@/hooks/use-placement-filters";
import {
	usePlacementCounts,
	usePlacements,
} from "@/queries/placements.queries";
import { useOrgVendors } from "@/queries/talent-community.queries";
import type { PlacementTabCounts as PlacementDashboardCounts } from "@/services/placements.service";
import type { PlacementTab } from "@/types/placement";

const CARDS_PER_PAGE = 6;
export const PAGE_SIZE_OPTIONS = [6, 12, 18, 24];

export const PLACEMENT_TAB_ORDER = [
	"upcoming",
	"active",
	"completed",
] as const satisfies readonly PlacementTab[];

export interface UsePlacementsPageOptions {
	fixedVendorId?: string;
	/** Defaults to all tabs (vendor dashboard). Org UI passes CASL-filtered tabs. */
	allowedTabs?: PlacementTab[];
}

export function usePlacementsPage(options: UsePlacementsPageOptions) {
	const { id: orgId } = useOrgContext();
	const allowedTabs = options.allowedTabs ?? [...PLACEMENT_TAB_ORDER];

	const [activeTab, setActiveTab] = useState<PlacementTab>(
		() => allowedTabs[0] ?? "active",
	);

	useEffect(() => {
		if (allowedTabs.length === 0) {
			return;
		}
		if (!allowedTabs.includes(activeTab)) {
			setActiveTab(allowedTabs[0]);
		}
	}, [allowedTabs, activeTab]);

	const queryEnabled =
		allowedTabs.length > 0 && allowedTabs.includes(activeTab);

	const {
		search,
		setSearch,
		filtersExpanded,
		setFiltersExpanded,
		page,
		setPage,
		limit,
		setLimit,
		workforceTypeFilter,
		setWorkforceTypeFilter,
		complianceFilter,
		setComplianceFilter,
		vendorFilter,
		setVendorFilter,
		query,
		resetPage,
	} = usePlacementFilters({ defaultLimit: CARDS_PER_PAGE });

	const effectiveQuery = options.fixedVendorId
		? { ...query, vendorId: options.fixedVendorId }
		: query;

	const { data, isLoading, isError } = usePlacements(
		orgId,
		{
			tab: activeTab,
			...effectiveQuery,
		},
		{ enabled: queryEnabled },
	);

	const { data: countsData } = usePlacementCounts(orgId, {
		enabled: allowedTabs.length > 0,
	});
	const vendorsQuery = useOrgVendors(orgId);
	const vendorOptions = useMemo(() => {
		const items = vendorsQuery.data ?? [];
		return [
			{ value: "all", label: "All Vendors" },
			...items.map((v) => ({ value: v.id, label: v.name })),
		];
	}, [vendorsQuery.data]);

	const placements = data?.data ?? [];
	const totalCount = data?.total ?? 0;
	const pageCount = Math.ceil(totalCount / limit) || 1;
	const placementCounts: PlacementDashboardCounts = countsData ?? {
		upcoming: 0,
		active: 0,
		completed: 0,
		total: 0,
		activeOnly: 0,
		endingSoon: 0,
	};

	const tabCounts = {
		upcoming: placementCounts.upcoming,
		active: placementCounts.active,
		completed: placementCounts.completed,
	};

	const hasActiveFilters = Boolean(
		search.trim() ||
			workforceTypeFilter !== "all" ||
			complianceFilter !== "all" ||
			vendorFilter !== "all",
	);

	const handleTabChange = (tab: PlacementTab) => {
		if (!allowedTabs.includes(tab)) {
			return;
		}
		setActiveTab(tab);
		resetPage();
	};

	const filterConfigs = useMemo(
		() => [
			{
				id: "placement-filter-workforce-type",
				label: "Workforce Type",
				value: workforceTypeFilter,
				onValueChange: setWorkforceTypeFilter,
				placeholder: "All",
				options: [
					{ value: "all", label: "All Types" },
					{ value: "INTERNAL_STAFF", label: "Internal Staff" },
					{ value: "PER_DIEM", label: "Per Diem" },
					{ value: "AGENCY_VENDOR", label: "Agency Vendor" },
					{ value: "TRAVEL_NURSES", label: "Travel Nurses" },
					{ value: "PREVIOUS_WORKERS", label: "Previous Workers" },
				],
			},
			{
				id: "placement-filter-compliance",
				label: "Compliance Status",
				value: complianceFilter,
				onValueChange: setComplianceFilter,
				placeholder: "All",
				options: [
					{ value: "all", label: "All Status" },
					{ value: "complete", label: "Complete" },
					{ value: "incomplete", label: "Incomplete" },
				],
			},
			...(options.fixedVendorId
				? []
				: [
						{
							id: "placement-filter-vendor",
							label: "Vendor",
							value: vendorFilter,
							onValueChange: setVendorFilter,
							placeholder: "All Vendors",
							options: vendorOptions,
						},
					]),
		],
		[
			complianceFilter,
			options.fixedVendorId,
			setComplianceFilter,
			setVendorFilter,
			setWorkforceTypeFilter,
			vendorFilter,
			vendorOptions,
			workforceTypeFilter,
		],
	);

	return {
		orgId,
		activeTab,
		handleTabChange,
		placementCounts,
		tabCounts: tabCounts as Record<PlacementTab, number>,
		placements,
		totalCount,
		pageCount,
		isLoading,
		isError,
		search,
		setSearch,
		filtersExpanded,
		setFiltersExpanded,
		workforceTypeFilter,
		setWorkforceTypeFilter,
		complianceFilter,
		setComplianceFilter,
		vendorFilter,
		setVendorFilter,
		vendorOptions,
		hasActiveFilters,
		page,
		setPage,
		limit,
		setLimit,
		filterConfigs,
	};
}
