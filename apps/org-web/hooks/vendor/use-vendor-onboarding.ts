import { useLocalDebouncedSearch } from "@repo/ui/hooks/use-local-debounced-search";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
	useVendorOnboardingList,
	useVendorOnboardingMetrics,
} from "@/queries/vendor-onboarding.queries";
import {
	toWeekGroupFromListResponse,
	VendorOnboardingService,
} from "@/services/vendor-onboarding.service";

const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 10;

export function useVendorOnboarding() {
	const [weekBucket, setWeekBucket] = useState<"1" | "2" | "3" | "all">("all");
	const [page, setPage] = useState(1);
	const {
		search,
		debouncedSearch,
		setSearch: setSearchBase,
	} = useLocalDebouncedSearch("", { wait: SEARCH_DEBOUNCE_MS });

	const setSearchAndReset = useCallback(
		(v: string) => {
			setSearchBase(v);
			setPage(1);
		},
		[setSearchBase],
	);

	const listQuery = useVendorOnboardingList({
		weekBucket,
		page,
		limit: PAGE_SIZE,
		search: debouncedSearch.trim() || undefined,
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

	const setWeekBucketAndReset = (v: "1" | "2" | "3" | "all") => {
		setWeekBucket(v);
		setPage(1);
	};

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
		pageSize: PAGE_SIZE,
		weekBucket,
		setWeekBucket: setWeekBucketAndReset,
		search,
		setSearch: setSearchAndReset,
		sendOnboardingReminder: (placementId: string) =>
			reminderMutation.mutate(placementId),
		isReminderPending: reminderMutation.isPending,
	};
}
