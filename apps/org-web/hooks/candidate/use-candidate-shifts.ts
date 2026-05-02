"use client";

import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { useUrlQueryState } from "@repo/ui/hooks/use-url-query-state";
import { useSearchParams } from "next/navigation";
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

const TAB_VALUES = new Set<string>(Object.values(CANDIDATE_SHIFTS_TABS));

export function useCandidateShifts() {
	const searchParams = useSearchParams();
	const { pushParams } = useUrlQueryState();
	const { localSearch, searchFromUrl, handleSearchChange } = useDebouncedSearch(
		{
			paramKey: "csSearch",
			pageParamKey: null,
			alsoClearParamKeys: ["avPage", "myPage"],
		},
	);

	const dateFilter = searchParams.get("date") ?? "";

	const pageSizeParam = Number(searchParams.get("ps") ?? "10");
	const pageSize =
		Number.isFinite(pageSizeParam) && pageSizeParam > 0 ? pageSizeParam : 10;

	const tabParam = searchParams.get("csTab");
	const activeTab: ShiftTab =
		tabParam && TAB_VALUES.has(tabParam)
			? (tabParam as ShiftTab)
			: CANDIDATE_SHIFTS_TABS.AVAILABLE;

	const avPageParam = Number(searchParams.get("avPage") ?? "1");
	const availablePage =
		Number.isFinite(avPageParam) && avPageParam > 0 ? avPageParam : 1;
	const myPageParam = Number(searchParams.get("myPage") ?? "1");
	const myShiftsPage =
		Number.isFinite(myPageParam) && myPageParam > 0 ? myPageParam : 1;

	const [filtersExpanded, setFiltersExpanded] = useState(false);

	const setDateFilterAndResetPages = useCallback(
		(value: string) => {
			const clear = !value;
			pushParams({ date: clear ? null : value, avPage: null, myPage: null });
		},
		[pushParams],
	);

	const setActiveTab = useCallback(
		(value: ShiftTab) => {
			pushParams({ csTab: value, avPage: null, myPage: null });
		},
		[pushParams],
	);

	const setAvailablePage = useCallback(
		(p: number) => {
			pushParams({ avPage: String(p) });
		},
		[pushParams],
	);

	const setMyShiftsPage = useCallback(
		(p: number) => {
			pushParams({ myPage: String(p) });
		},
		[pushParams],
	);

	const setPageSize = useCallback(
		(n: number) => {
			pushParams({ ps: String(n), avPage: null, myPage: null });
		},
		[pushParams],
	);

	const availableParams = {
		page: availablePage,
		limit: pageSize,
		search: searchFromUrl || undefined,
		date: dateFilter || undefined,
	};

	const myShiftsParams = {
		page: myShiftsPage,
		limit: pageSize,
		search: searchFromUrl || undefined,
		date: dateFilter || undefined,
	};

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

	const filterConfigs = useMemo(
		() => [
			{
				id: "candidate-shifts-date",
				label: "Shift Date",
				value: dateFilter,
				onValueChange: setDateFilterAndResetPages,
				type: "date" as const,
				placeholder: "dd/mm/yyyy",
			},
		],
		[dateFilter, setDateFilterAndResetPages],
	);

	return {
		activeTab,
		setActiveTab,

		searchQuery: localSearch,
		setSearchQuery: handleSearchChange,
		dateFilter,
		setDateFilter: setDateFilterAndResetPages,
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
