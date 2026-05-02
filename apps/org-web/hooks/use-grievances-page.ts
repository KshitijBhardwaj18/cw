"use client";

import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { useUrlQueryState } from "@repo/ui/hooks/use-url-query-state";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import {
	GRIEVANCE_STATUS,
	GRIEVANCE_STATUS_FILTER_OPTIONS,
	GRIEVANCE_TYPE_FILTER_OPTIONS,
	GRIEVANCES_PAGE_SIZE,
	type GrievanceListRow,
	type GrievanceSummaryFilterKey,
} from "@/constants/grievances";
import { useGrievancesIndexSuspense } from "@/queries/grievances.queries";
import type { GrievanceListApiRow } from "@/services/grievances.service";

function mapApiRowToRow(r: GrievanceListApiRow): GrievanceListRow {
	return {
		id: r.id,
		grievanceNumber: r.grievanceNumber,
		type: r.type,
		candidateId: r.candidateId,
		workerName: r.workerName,
		placementId: r.placementId,
		placementLabel: r.placementLabel,
		description: r.description,
		status: r.status,
		createdAt: r.createdAt,
	};
}

export interface GrievanceSummaryCounts {
	total: number;
	open: number;
	inProgress: number;
	resolved: number;
}

export function useGrievancesPage(orgId: string) {
	const searchParams = useSearchParams();
	const { pushParams } = useUrlQueryState();
	const { localSearch, searchFromUrl, handleSearchChange } = useDebouncedSearch(
		{ paramKey: "gSearch", pageParamKey: "gPage" },
	);

	const pageParam = Number(searchParams.get("gPage") ?? "1");
	const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

	const typeFilter = searchParams.get("grievanceType") ?? "all";
	const statusFilter = searchParams.get("grievanceStatus") ?? "all";

	const [filtersExpanded, setFiltersExpanded] = useState(true);

	const listQuery = useMemo(
		() => ({
			search: searchFromUrl.trim() || undefined,
			type:
				typeFilter === "all"
					? undefined
					: (typeFilter as "BEHAVIORAL" | "CLINICAL"),
			status:
				statusFilter === "all"
					? undefined
					: (statusFilter as "OPEN" | "IN_PROGRESS" | "RESOLVED"),
			page,
			limit: GRIEVANCES_PAGE_SIZE,
		}),
		[page, searchFromUrl, typeFilter, statusFilter],
	);

	const [countsResult, listResult] = useGrievancesIndexSuspense(
		orgId,
		listQuery,
	);
	const countsData = countsResult.data;
	const listData = listResult.data;

	const summaryCounts: GrievanceSummaryCounts = countsData ?? {
		total: 0,
		open: 0,
		inProgress: 0,
		resolved: 0,
	};

	const paginatedRows: GrievanceListRow[] = useMemo(
		() => (listData?.data ?? []).map(mapApiRowToRow),
		[listData?.data],
	);

	const totalFiltered = listData?.total ?? 0;
	const totalPages = listData?.totalPages ?? 1;

	const activeSummaryKey: GrievanceSummaryFilterKey = useMemo(() => {
		if (statusFilter === GRIEVANCE_STATUS.OPEN) return GRIEVANCE_STATUS.OPEN;
		if (statusFilter === GRIEVANCE_STATUS.IN_PROGRESS)
			return GRIEVANCE_STATUS.IN_PROGRESS;
		if (statusFilter === GRIEVANCE_STATUS.RESOLVED)
			return GRIEVANCE_STATUS.RESOLVED;
		return "ALL";
	}, [statusFilter]);

	const setStatusFilterFromSummary = useCallback(
		(key: GrievanceSummaryFilterKey) => {
			if (key === "ALL") {
				pushParams({ grievanceStatus: null, gPage: null });
				return;
			}
			pushParams({ grievanceStatus: key, gPage: null });
		},
		[pushParams],
	);

	const setTypeFilterAndResetPage = useCallback(
		(value: string) => {
			const clear = !value || value === "all";
			pushParams({ grievanceType: clear ? null : value, gPage: null });
		},
		[pushParams],
	);

	const setStatusFilterAndResetPage = useCallback(
		(value: string) => {
			const clear = !value || value === "all";
			pushParams({ grievanceStatus: clear ? null : value, gPage: null });
		},
		[pushParams],
	);

	const setPage = useCallback(
		(p: number) => {
			pushParams({ gPage: String(p) });
		},
		[pushParams],
	);

	const filterConfigs = useMemo(
		() => [
			{
				id: "grievance-type",
				label: "Grievance type",
				value: typeFilter,
				onValueChange: setTypeFilterAndResetPage,
				placeholder: "All",
				options: GRIEVANCE_TYPE_FILTER_OPTIONS,
			},
			{
				id: "grievance-status",
				label: "Status",
				value: statusFilter,
				onValueChange: setStatusFilterAndResetPage,
				placeholder: "All",
				options: GRIEVANCE_STATUS_FILTER_OPTIONS,
			},
		],
		[
			setStatusFilterAndResetPage,
			setTypeFilterAndResetPage,
			statusFilter,
			typeFilter,
		],
	);

	return {
		search: localSearch,
		setSearch: handleSearchChange,
		typeFilter,
		setTypeFilter: setTypeFilterAndResetPage,
		statusFilter,
		setStatusFilter: setStatusFilterAndResetPage,
		setStatusFilterFromSummary,
		activeSummaryKey,
		filtersExpanded,
		setFiltersExpanded,
		page,
		setPage,
		totalPages,
		summaryCounts,
		paginatedRows,
		totalFiltered,
		filterConfigs,
	};
}
