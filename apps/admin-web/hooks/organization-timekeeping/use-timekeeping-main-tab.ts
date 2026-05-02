"use client";

import type { DataSourceFilter } from "@repo/ui/general/timekeeping/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DATA_SOURCE_OPTIONS } from "@/constants/timekeeping";
import {
	useEntriesGrouped,
	useEntryStatusCounts,
	useTimekeepingStats,
} from "@/queries/organization-timekeeping.queries";
import type { ApprovalStatusFilter } from "@/types/timekeeping";
import type { TimekeepingSharedDisputes } from "./use-timekeeping-shared-disputes";
import type { TimekeepingUrlState } from "./use-timekeeping-url-state";
import { GROUPED_PAGE_SIZE, toLocationTimekeeping } from "./utils";

export function useTimekeepingMainTab(
	organizationId: string,
	urlState: TimekeepingUrlState,
	disputes: TimekeepingSharedDisputes,
) {
	const orgId = organizationId;
	const {
		localSearch,
		searchFromUrl,
		handleSearchChange,
		isFiltersExpanded,
		setIsFiltersExpanded,
		dataSourceFilter,
		setDataSourceFilter,
		groupedStatusFilter,
		setGroupedStatusFilter: pushGroupedStatus,
	} = urlState;

	const [groupedPage, setGroupedPage] = useState(1);

	// biome-ignore lint/correctness/useExhaustiveDependencies: reset list pages when debounced search changes
	useEffect(() => {
		setGroupedPage(1);
	}, [searchFromUrl]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: reset when data source filter changes
	useEffect(() => {
		setGroupedPage(1);
	}, [dataSourceFilter]);

	const setGroupedStatusFilter = useCallback(
		(v: ApprovalStatusFilter) => {
			setGroupedPage(1);
			pushGroupedStatus(v);
		},
		[pushGroupedStatus],
	);

	const groupedQuery = useEntriesGrouped(orgId, {
		dataSource: dataSourceFilter === "ALL" ? undefined : dataSourceFilter,
		status: groupedStatusFilter === "ALL" ? undefined : groupedStatusFilter,
		search: searchFromUrl || undefined,
		page: groupedPage,
		limit: GROUPED_PAGE_SIZE,
	});

	const entryCountFilters = useMemo(
		() => ({
			search: searchFromUrl || undefined,
			dataSource: dataSourceFilter === "ALL" ? undefined : dataSourceFilter,
		}),
		[searchFromUrl, dataSourceFilter],
	);

	const statsQuery = useTimekeepingStats(orgId);
	const entryCountsQuery = useEntryStatusCounts(orgId, entryCountFilters);

	const filteredLocations = useMemo(
		() => (groupedQuery.data?.data ?? []).map(toLocationTimekeeping),
		[groupedQuery.data],
	);

	const groupedTotalPages = groupedQuery.data?.totalPages ?? 1;

	const locationStatusCounts = useMemo<
		Record<ApprovalStatusFilter, number>
	>(() => {
		const c = entryCountsQuery.data ?? {};
		const p = c.PENDING ?? 0;
		const a = c.APPROVED ?? 0;
		const d = c.DISPUTED ?? 0;
		return {
			ALL: p + a + d,
			PENDING: p,
			APPROVED: a,
			DISPUTED: d,
			REJECTED: c.REJECTED ?? 0,
		};
	}, [entryCountsQuery.data]);

	const timekeepingStats = useMemo(() => {
		const s = statsQuery.data;
		return {
			totalEntries: s?.totalEntries ?? 0,
			fileUploads: s?.fileUploads ?? 0,
			mobileApps: s?.mobileApps ?? 0,
			totalHours: s?.totalHours ?? 0,
			openDisputes: s?.openDisputes ?? 0,
		};
	}, [statsQuery.data]);

	const filterConfigs = useMemo(
		() => [
			{
				id: "timekeeping-filter-source",
				label: "Data Source",
				value: dataSourceFilter,
				onValueChange: (v: string) =>
					setDataSourceFilter(v as DataSourceFilter),
				placeholder: "All",
				options: DATA_SOURCE_OPTIONS.map((o) => ({
					value: o.value,
					label: o.label,
				})),
			},
		],
		[dataSourceFilter, setDataSourceFilter],
	);

	return {
		searchQuery: localSearch,
		setSearchQuery: handleSearchChange,
		isFiltersExpanded,
		setIsFiltersExpanded,
		groupedStatusFilter,
		setGroupedStatusFilter,
		groupedPage,
		setGroupedPage,
		groupedTotalPages,
		filteredLocations,
		locationStatusCounts,
		timekeepingStats,
		filterConfigs,
		openDisputeDialog: disputes.openDisputeDialog,
		openApproveDialog: disputes.openApproveDialog,
		isDisputeDialogOpen: disputes.isDisputeDialogOpen,
		setIsDisputeDialogOpen: disputes.setIsDisputeDialogOpen,
		selectedDisputeLog: disputes.selectedDisputeLog,
		selectedDisputeWorker: disputes.selectedDisputeWorker,
		isApproveDialogOpen: disputes.isApproveDialogOpen,
		setIsApproveDialogOpen: disputes.setIsApproveDialogOpen,
		selectedApproveLog: disputes.selectedApproveLog,
		selectedApproveWorker: disputes.selectedApproveWorker,
		submitDispute: disputes.submitDispute,
		confirmApproval: disputes.confirmApproval,
	};
}

export type TimekeepingMainTabState = ReturnType<typeof useTimekeepingMainTab>;
