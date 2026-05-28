import { useTabSwitch } from "@repo/ui/hooks/use-tab-switch";
import { useMemo } from "react";
import {
	PLACEMENT_PARAMS,
	usePlacementFilters,
} from "@/hooks/use-placement-filters";
import {
	usePlacementCounts,
	usePlacements,
} from "@/queries/placements.queries";
import { useOrgVendors } from "@/queries/talent-community.queries";
import type { PlacementTabCounts as PlacementDashboardCounts } from "@/services/placements.service";
import type { PlacementTab } from "@/types/placement";

const CARDS_PER_PAGE = 6;
export const PAGE_SIZE_OPTIONS = [6, 12, 18, 24];

const TABLE_DEFAULT_LIMIT = 10;
const TABLE_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export const PLACEMENT_TAB_ORDER = [
	"upcoming",
	"active",
	"completed",
] as const satisfies readonly PlacementTab[];

export interface UsePlacementsPageOptions {
	fixedVendorId?: string;
	/** Defaults to all tabs (vendor dashboard). Org UI passes CASL-filtered tabs. */
	allowedTabs?: PlacementTab[];
	/** Override default page size + selector options (e.g. table view uses 10/[5,10,20,50]). */
	defaultLimit?: number;
	pageSizeOptions?: number[];
}

export function usePlacementsPage(options: UsePlacementsPageOptions) {
	const allowedTabs = options.allowedTabs ?? [...PLACEMENT_TAB_ORDER];

	const [activeTab, handleTabChange] = useTabSwitch<PlacementTab>(
		allowedTabs.length > 0 ? allowedTabs : ["active"],
		{
			alsoClearParamKeys: [
				PLACEMENT_PARAMS.SEARCH,
				PLACEMENT_PARAMS.PAGE,
				PLACEMENT_PARAMS.LIMIT,
				PLACEMENT_PARAMS.COMPLIANCE,
				PLACEMENT_PARAMS.VENDOR,
			],
		},
	);

	const queryEnabled =
		allowedTabs.length > 0 && allowedTabs.includes(activeTab);

	const effectiveDefaultLimit = options.defaultLimit ?? CARDS_PER_PAGE;
	const effectivePageSizeOptions = options.pageSizeOptions ?? PAGE_SIZE_OPTIONS;

	const {
		search,
		setSearch,
		filtersExpanded,
		setFiltersExpanded,
		page,
		setPage,
		limit,
		setLimit,
		complianceFilter,
		vendorFilter,
		query,
		filterConfigs: baseFilterConfigs,
	} = usePlacementFilters({
		defaultLimit: effectiveDefaultLimit,
		pageSizeOptions: effectivePageSizeOptions,
	});

	const effectiveQuery = options.fixedVendorId
		? { ...query, vendorId: options.fixedVendorId }
		: query;

	const {
		data,
		isLoading: isPlacementsLoading,
		isError,
	} = usePlacements(
		{
			tab: activeTab,
			...effectiveQuery,
		},
		{ enabled: queryEnabled },
	);

	const { data: countsData, isLoading: isCountsLoading } = usePlacementCounts({
		enabled: allowedTabs.length > 0,
	});
	const vendorsQuery = useOrgVendors();
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
		search.trim() || complianceFilter !== "all" || vendorFilter !== "all",
	);

	const filterConfigs = useMemo(() => {
		return baseFilterConfigs
			.map((config) => {
				if (config.id === PLACEMENT_PARAMS.VENDOR) {
					if (options.fixedVendorId) return null;
					return {
						...config,
						options: vendorOptions,
					};
				}
				return config;
			})
			.filter((c): c is NonNullable<typeof c> => !!c);
	}, [baseFilterConfigs, options.fixedVendorId, vendorOptions]);

	return {
		activeTab,
		handleTabChange,
		placementCounts,
		tabCounts: tabCounts as Record<PlacementTab, number>,
		placements,
		totalCount,
		pageCount,
		isPlacementsLoading,
		isCountsLoading,
		isError,
		search,
		setSearch,
		filtersExpanded,
		setFiltersExpanded,
		complianceFilter,
		vendorFilter,
		vendorOptions,
		hasActiveFilters,
		page,
		setPage,
		limit,
		setLimit,
		pageSizeOptions: effectivePageSizeOptions,
		filterConfigs,
	};
}

export { TABLE_DEFAULT_LIMIT, TABLE_PAGE_SIZE_OPTIONS };
