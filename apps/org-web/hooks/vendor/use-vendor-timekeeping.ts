"use client";

import {
	TIMESHEET_ENTRY_STATUS_VALUES,
	TIMESHEET_ENTRY_STATUS_VENDOR_FILTER_OPTIONS,
	type TimesheetEntryStatus,
} from "@repo/shared";
import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useSearchWithFilters } from "@repo/ui/hooks/use-search-with-filters";
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

const DEFAULT_LIMIT = 10;
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const STATUS_FILTER_OPTIONS: Array<{ value: string; label: string }> = [
	{ value: "all", label: "All Statuses" },
	...TIMESHEET_ENTRY_STATUS_VENDOR_FILTER_OPTIONS,
];

const STATUS_FILTER_VALUES = new Set<TimesheetEntryStatus>(
	TIMESHEET_ENTRY_STATUS_VALUES,
);

export type UseVendorTimekeepingOptions = {
	/** When false, row edit actions are omitted (Vendor View Only). */
	allowEditActions?: boolean;
};

export const VT_PARAMS = {
	PAGE: "vtPage",
	LIMIT: "vtLimit",
	SEARCH: "vtSearch",
	STATUS: "vtStatus",
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

	const {
		searchValue: localSearch,
		searchFromUrl,
		handleSearchChange,
		values,
		filterConfigs,
	} = useSearchWithFilters({
		pagination: { pageParamKey: VT_PARAMS.PAGE },
		search: { paramKey: VT_PARAMS.SEARCH },
		filters: [
			{
				id: VT_PARAMS.STATUS,
				label: "Status",
				type: "select",
				defaultValue: "all",
				placeholder: "All",
				options: STATUS_FILTER_OPTIONS,
			},
		],
	});

	const [filtersExpanded, setFiltersExpanded] = useState(false);

	const rawStatus = values[VT_PARAMS.STATUS] || "all";
	const statusFilter: TimesheetEntryStatus | undefined =
		STATUS_FILTER_VALUES.has(rawStatus as TimesheetEntryStatus)
			? (rawStatus as TimesheetEntryStatus)
			: undefined;

	const metricsQuery = useVendorTimekeepingMetrics();
	const payCodesQuery = useVendorTimekeepingPayCodes();
	const entriesQuery = useVendorTimekeepingEntries({
		page,
		limit,
		search: searchFromUrl.trim() || undefined,
		...(statusFilter ? { status: statusFilter } : {}),
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

	const pageDraftIds = (entriesQuery.data?.data ?? [])
		.filter((e) => e.vendorStatus === "draft")
		.map((e) => e.id);

	const handleSubmitAllPending = () => {
		if (pageDraftIds.length === 0) {
			toast.info("No draft entries on this page to submit");
			return;
		}
		submitDrafts.mutate(pageDraftIds, {
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
		pageDraftCount: pageDraftIds.length,
		filterConfigs,
		filtersExpanded,
		setFiltersExpanded,
	};
}
