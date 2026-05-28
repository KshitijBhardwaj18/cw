"use client";

import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useMutation } from "@tanstack/react-query";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useCallback } from "react";
import { toast } from "sonner";
import {
	useVendorOnboardingList,
	useVendorOnboardingMetrics,
} from "@/queries/vendor-onboarding.queries";
import {
	toWeekGroupFromListResponse,
	VendorOnboardingService,
} from "@/services/vendor-onboarding.service";

const DEFAULT_LIMIT = 10;
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export type WeekBucketType = "1" | "2" | "3" | "all";

export const VONB_PARAMS = {
	PAGE: "vOnbPage",
	LIMIT: "vOnbLimit",
	SEARCH: "vOnbSearch",
	BUCKET: "vOnbBucket",
} as const;

export function useVendorOnboarding() {
	const { page, setPage, limit, setLimit } = usePaginationControls({
		pageParamKey: VONB_PARAMS.PAGE,
		limitParamKey: VONB_PARAMS.LIMIT,
		defaultLimit: DEFAULT_LIMIT,
		pageSizeOptions: PAGE_SIZE_OPTIONS,
	});

	const { localSearch, searchFromUrl, handleSearchChange } = useDebouncedSearch(
		{
			paramKey: VONB_PARAMS.SEARCH,
			pageParamKey: VONB_PARAMS.PAGE,
		},
	);

	const [weekBucket, setWeekBucketRaw] = useQueryState(
		VONB_PARAMS.BUCKET,
		parseAsStringLiteral(["1", "2", "3", "all"]).withDefault("all"),
	);

	const setWeekBucket = useCallback(
		(v: WeekBucketType) => {
			void setWeekBucketRaw(v);
			setPage(1);
		},
		[setWeekBucketRaw, setPage],
	);

	const listQuery = useVendorOnboardingList({
		weekBucket,
		page,
		limit,
		search: searchFromUrl.trim() || undefined,
	});

	const metricsQuery = useVendorOnboardingMetrics();

	const reminderMutation = useMutation({
		mutationFn: (placementId: string) =>
			VendorOnboardingService.queueReminder(placementId),
		onSuccess: () => {
			toast.success(
				"Reminder queued — this candidate will get an email shortly.",
			);
		},
		onError: (err: unknown) => {
			toast.error(
				err instanceof Error ? err.message : "Could not queue reminder",
			);
		},
	});

	const group = listQuery.data
		? toWeekGroupFromListResponse(listQuery.data)
		: null;

	return {
		metrics: metricsQuery.data,
		isMetricsLoading: metricsQuery.isLoading,
		group,
		listQuery,
		totalRows: listQuery.data?.total ?? 0,
		pageCount: listQuery.data?.totalPages ?? 1,
		page,
		setPage,
		limit,
		setLimit,
		pageSizeOptions: PAGE_SIZE_OPTIONS,
		weekBucket,
		setWeekBucket,
		search: localSearch,
		setSearch: handleSearchChange,
		sendOnboardingReminder: (placementId: string) =>
			reminderMutation.mutate(placementId),
		isReminderPending: reminderMutation.isPending,
	};
}
