import { useLocalDebouncedSearch } from "@repo/ui/hooks/use-local-debounced-search";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useVendorTimekeepingColumns } from "@/hooks/tables/use-vendor-timekeeping-columns";
import {
	useSubmitVendorTimekeepingDrafts,
	useUpdateVendorTimekeepingEntry,
	useVendorTimekeepingEntries,
	useVendorTimekeepingMetrics,
	useVendorTimekeepingPayCodes,
} from "@/queries/vendor-timekeeping.queries";
import type { VendorTimekeepingFormValues } from "@/schemas/vendor-timekeeping.schema";
import type { VendorTimekeepingEntry } from "@/types/vendor-timekeeping";

const SEARCH_DEBOUNCE_MS = 300;
const DEFAULT_LIMIT = 20;
const PAGE_SIZE_OPTIONS = [10, 20, 50];

export type UseVendorTimekeepingOptions = {
	/** When false, row edit actions are omitted (Vendor View Only). */
	allowEditActions?: boolean;
};

export function useVendorTimekeeping(options?: UseVendorTimekeepingOptions) {
	const allowEditActions = options?.allowEditActions ?? true;
	const [editEntry, setEditEntry] = useState<VendorTimekeepingEntry | null>(
		null,
	);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(DEFAULT_LIMIT);
	const {
		search,
		debouncedSearch,
		setSearch: setSearchBase,
	} = useLocalDebouncedSearch("", { wait: SEARCH_DEBOUNCE_MS });

	const metricsQuery = useVendorTimekeepingMetrics();
	const payCodesQuery = useVendorTimekeepingPayCodes();
	const entriesQuery = useVendorTimekeepingEntries({
		page,
		limit,
		search: debouncedSearch.trim() || undefined,
	});

	const updateEntry = useUpdateVendorTimekeepingEntry();
	const submitDrafts = useSubmitVendorTimekeepingDrafts();

	const handleEditRow = (entry: VendorTimekeepingEntry) => {
		setEditEntry(entry);
		setIsEditDialogOpen(true);
	};

	const { columns } = useVendorTimekeepingColumns({
		onEditRow: allowEditActions ? handleEditRow : undefined,
	});

	const setSearchAndResetPage = useCallback(
		(v: string) => {
			setSearchBase(v);
			setPage(1);
		},
		[setSearchBase],
	);

	const setLimitAndResetPage = (l: number) => {
		setLimit(l);
		setPage(1);
	};

	const handleSaveEdit = (updated: VendorTimekeepingFormValues) => {
		if (!editEntry) return;
		updateEntry.mutate(
			{
				entryId: editEntry.id,
				body: {
					clockIn: updated.startTime,
					clockOut: updated.endTime,
					notes: updated.note?.trim() ? updated.note.trim() : null,
					payCodeId: updated.payCodeId ?? null,
				},
			},
			{
				onSuccess: () => {
					toast.success("Time entry updated");
					setIsEditDialogOpen(false);
				},
				onError: (err) => {
					toast.error(err instanceof Error ? err.message : "Update failed");
				},
			},
		);
	};

	const closeEditDialog = () => setIsEditDialogOpen(false);

	const handleSubmitAllPending = () => {
		submitDrafts.mutate(undefined, {
			onSuccess: (res) => {
				toast.success(
					res.updated === 0
						? "No draft entries to submit"
						: `Submitted ${res.updated} draft${res.updated === 1 ? "" : "s"}`,
				);
			},
			onError: (err) => {
				toast.error(err instanceof Error ? err.message : "Submit failed");
			},
		});
	};

	return {
		columns,
		editEntry,
		isEditDialogOpen,
		handleSaveEdit,
		closeEditDialog,
		metrics: metricsQuery.data,
		isMetricsLoading: metricsQuery.isLoading,
		entries: entriesQuery.data?.data ?? [],
		payCodeOptions: (payCodesQuery.data ?? []).map((p) => ({
			id: p.id,
			code: p.code,
			description: p.description,
		})),
		totalEntries: entriesQuery.data?.total ?? 0,
		pageCount: entriesQuery.data?.totalPages ?? 1,
		page,
		setPage,
		limit,
		setLimit: setLimitAndResetPage,
		pageSizeOptions: PAGE_SIZE_OPTIONS,
		search,
		setSearch: setSearchAndResetPage,
		isEntriesLoading: entriesQuery.isLoading,
		isEntriesError: entriesQuery.isError,
		handleSubmitAllPending,
		isSubmitting: submitDrafts.isPending,
	};
}
