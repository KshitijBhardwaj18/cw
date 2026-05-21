"use client";

import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useSearchWithFilters } from "@repo/ui/hooks/use-search-with-filters";
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

const GRIEVANCE_PARAMS = {
	SEARCH: "gSearch",
	PAGE: "gPage",
	TYPE: "grievanceType",
	STATUS: "grievanceStatus",
} as const;

export function useGrievancesPage(orgId: string) {
	const { page, limit, setPage } = usePaginationControls({
		pageParamKey: GRIEVANCE_PARAMS.PAGE,
		defaultLimit: GRIEVANCES_PAGE_SIZE,
	});

	const {
		searchValue: localSearch,
		searchFromUrl,
		handleSearchChange,
		values,
		filterConfigs,
		onFilterChange,
	} = useSearchWithFilters({
		search: { paramKey: GRIEVANCE_PARAMS.SEARCH },
		pagination: { pageParamKey: GRIEVANCE_PARAMS.PAGE },
		filters: [
			{
				id: GRIEVANCE_PARAMS.TYPE,
				label: "Type",
				type: "select",
				defaultValue: "all",
				options: GRIEVANCE_TYPE_FILTER_OPTIONS,
			},
			{
				id: GRIEVANCE_PARAMS.STATUS,
				label: "Status",
				type: "select",
				defaultValue: "all",
				options: GRIEVANCE_STATUS_FILTER_OPTIONS,
			},
		],
	});

	const [filtersExpanded, setFiltersExpanded] = useState(true);

	const typeFilter = values[GRIEVANCE_PARAMS.TYPE] || "all";
	const statusFilter = values[GRIEVANCE_PARAMS.STATUS] || "all";

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
			limit,
		}),
		[page, limit, searchFromUrl, typeFilter, statusFilter],
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
			onFilterChange(GRIEVANCE_PARAMS.STATUS, key === "ALL" ? "all" : key);
		},
		[onFilterChange],
	);

	return {
		localSearch,
		handleSearchChange,
		filtersExpanded,
		setFiltersExpanded,
		filterConfigs,
		summaryCounts,
		activeSummaryKey,
		setStatusFilterFromSummary,
		paginatedRows,
		totalFiltered,
		totalPages,
		page,
		setPage,
		isLoading: countsResult.isLoading || listResult.isLoading,
		isError: countsResult.isError || listResult.isError,
	};
}
