"use client";

import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useSearchWithFilters } from "@repo/ui/hooks/use-search-with-filters";
import { useTabSwitch } from "@repo/ui/hooks/use-tab-switch";
import { useCallback, useMemo, useState } from "react";
import { CANDIDATE_SHIFTS_TABS } from "@/constants/candidate/shifts";
import {
	useCandidateAvailableShifts,
	useCandidateMyShifts,
	useCandidateShiftCounts,
	useClaimShift,
} from "@/queries/candidate-shifts.queries";

type ShiftTab =
	(typeof CANDIDATE_SHIFTS_TABS)[keyof typeof CANDIDATE_SHIFTS_TABS];

export const CANDIDATE_SHIFTS_PARAMS = {
	TAB: "csTab",
	SEARCH: "csSearch",
	DATE: "date",
	PAGE_SIZE: "ps",
	AVAILABLE_PAGE: "avPage",
	MY_SHIFTS_PAGE: "myPage",
} as const;

export function useCandidateShifts() {
	const [activeTab, setActiveTab] = useTabSwitch<ShiftTab>(
		Object.values(CANDIDATE_SHIFTS_TABS),
		{
			paramKey: CANDIDATE_SHIFTS_PARAMS.TAB,
			alsoClearParamKeys: [
				CANDIDATE_SHIFTS_PARAMS.AVAILABLE_PAGE,
				CANDIDATE_SHIFTS_PARAMS.MY_SHIFTS_PAGE,
			],
		},
	);

	const { page: availablePage, setPage: setAvailablePage } =
		usePaginationControls({
			pageParamKey: CANDIDATE_SHIFTS_PARAMS.AVAILABLE_PAGE,
			limitParamKey: CANDIDATE_SHIFTS_PARAMS.PAGE_SIZE,
			defaultLimit: 10,
		});

	const {
		page: myShiftsPage,
		setPage: setMyShiftsPage,
		limit: pageSize,
		setLimit: setPageSizeRaw,
	} = usePaginationControls({
		pageParamKey: CANDIDATE_SHIFTS_PARAMS.MY_SHIFTS_PAGE,
		limitParamKey: CANDIDATE_SHIFTS_PARAMS.PAGE_SIZE,
		defaultLimit: 10,
	});

	const {
		searchValue: localSearch,
		searchFromUrl,
		handleSearchChange: handleSearchChangeRaw,
		values,
		filterConfigs: hookFilterConfigs,
		onFilterChange: onFilterChangeRaw,
	} = useSearchWithFilters({
		pagination: { pageParamKey: CANDIDATE_SHIFTS_PARAMS.AVAILABLE_PAGE },
		search: {
			paramKey: CANDIDATE_SHIFTS_PARAMS.SEARCH,
			alsoClearParamKeys: [CANDIDATE_SHIFTS_PARAMS.MY_SHIFTS_PAGE],
		},
		filters: [
			{
				id: CANDIDATE_SHIFTS_PARAMS.DATE,
				label: "Shift Date",
				type: "date",
				defaultValue: "",
				placeholder: "dd/mm/yyyy",
			},
		],
	});

	const handleSearchChange = useCallback(
		(v: string) => {
			handleSearchChangeRaw(v);
			setMyShiftsPage(1);
		},
		[handleSearchChangeRaw, setMyShiftsPage],
	);

	const onFilterChange = useCallback(
		(
			keyOrUpdates: string | Record<string, string | null>,
			value?: string | null,
		) => {
			onFilterChangeRaw(keyOrUpdates, value);
			setMyShiftsPage(1);
		},
		[onFilterChangeRaw, setMyShiftsPage],
	);

	const setPageSize = useCallback(
		(n: number) => {
			setPageSizeRaw(n);
			setAvailablePage(1);
			setMyShiftsPage(1);
		},
		[setPageSizeRaw, setAvailablePage, setMyShiftsPage],
	);

	const dateFilter = values[CANDIDATE_SHIFTS_PARAMS.DATE] || "";

	const availableParams = useMemo(
		() => ({
			page: availablePage,
			limit: pageSize,
			search: searchFromUrl || undefined,
			date: dateFilter || undefined,
		}),
		[availablePage, pageSize, searchFromUrl, dateFilter],
	);

	const myShiftsParams = useMemo(
		() => ({
			page: myShiftsPage,
			limit: pageSize,
			search: searchFromUrl || undefined,
			date: dateFilter || undefined,
		}),
		[myShiftsPage, pageSize, searchFromUrl, dateFilter],
	);

	const availableQuery = useCandidateAvailableShifts(availableParams);
	const myShiftsQuery = useCandidateMyShifts(myShiftsParams);
	const countsQuery = useCandidateShiftCounts();
	const claimMutation = useClaimShift();

	const handleClaimShift = (
		shiftId: string,
		onSuccess?: () => void,
		onError?: (message: string) => void,
	) => {
		claimMutation.mutate(shiftId, {
			onSuccess: () => {
				onSuccess?.();
			},
			onError: (err) => {
				onError?.(err instanceof Error ? err.message : "Failed to claim shift");
			},
		});
	};

	const [filtersExpanded, setFiltersExpanded] = useState(false);

	const filterConfigs = useMemo(() => {
		return hookFilterConfigs.map((cfg) => {
			if (cfg.id === CANDIDATE_SHIFTS_PARAMS.DATE) {
				return {
					...cfg,
					onValueChange: (v: string) => {
						onFilterChange(CANDIDATE_SHIFTS_PARAMS.DATE, v);
					},
				};
			}
			return cfg;
		});
	}, [hookFilterConfigs, onFilterChange]);

	return {
		activeTab,
		setActiveTab,

		searchQuery: localSearch,
		setSearchQuery: handleSearchChange,
		dateFilter,
		setDateFilter: (v: string) =>
			onFilterChange(CANDIDATE_SHIFTS_PARAMS.DATE, v),
		filtersExpanded,
		setFiltersExpanded,

		availableShiftsData: availableQuery.data,
		availableShiftsLoading: availableQuery.isPending,
		availablePage,
		setAvailablePage,

		myShiftsData: myShiftsQuery.data,
		myShiftsLoading: myShiftsQuery.isPending,
		myShiftsPage,
		setMyShiftsPage,

		pageSize,
		setPageSize,

		counts: countsQuery.data,
		countsLoading: countsQuery.isPending,

		handleClaimShift,
		isClaimingShift: claimMutation.isPending,
		filterConfigs,
	};
}
