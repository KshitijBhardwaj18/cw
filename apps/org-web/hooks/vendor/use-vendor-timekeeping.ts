"use client";

import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useState } from "react";
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

const DEFAULT_LIMIT = 20;
const PAGE_SIZE_OPTIONS = [10, 20, 50];

export type UseVendorTimekeepingOptions = {
	/** When false, row edit actions are omitted (Vendor View Only). */
	allowEditActions?: boolean;
};

export const VT_PARAMS = {
	PAGE: "vtPage",
	LIMIT: "vtLimit",
	SEARCH: "vtSearch",
} as const;

export function useVendorTimekeeping(options?: UseVendorTimekeepingOptions) {
	const allowEditActions = options?.allowEditActions ?? true;
	const [editEntry, setEditEntry] = useState<VendorTimekeepingEntry | null>(
		null,
	);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

	const { page, setPage, limit, setLimit } = usePaginationControls({
		pageParamKey: VT_PARAMS.PAGE,
		limitParamKey: VT_PARAMS.LIMIT,
		defaultLimit: DEFAULT_LIMIT,
		pageSizeOptions: PAGE_SIZE_OPTIONS,
	});

	const { localSearch, searchFromUrl, handleSearchChange } = useDebouncedSearch(
		{
			paramKey: VT_PARAMS.SEARCH,
			pageParamKey: VT_PARAMS.PAGE,
		},
	);

	const metricsQuery = useVendorTimekeepingMetrics();
	const payCodesQuery = useVendorTimekeepingPayCodes();
	const entriesQuery = useVendorTimekeepingEntries({
		page,
		limit,
		search: searchFromUrl.trim() || undefined,
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
		setLimit,
		pageSizeOptions: PAGE_SIZE_OPTIONS,
		search: localSearch,
		setSearch: handleSearchChange,
		isEntriesLoading: entriesQuery.isLoading,
		isEntriesError: entriesQuery.isError,
		handleSubmitAllPending,
		isSubmitting: submitDrafts.isPending,
	};
}
