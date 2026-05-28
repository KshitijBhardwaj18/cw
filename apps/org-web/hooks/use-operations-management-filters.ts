"use client";

import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { useCallback, useMemo } from "react";
import {
	CANDIDATE_PROCESSING_ISSUE_STAT_CARDS,
	REQUISITION_PERFORMANCE_STAT_CARDS,
} from "@/constants/command-center";
import { CommandCenterService } from "@/services/command-center.service";
import type {
	CandidateProcessingFilterKey,
	OperationsManagementFilterCategory,
	OperationsManagementFilterKey,
	RequisitionPerformanceFilterKey,
} from "@/types/command-center";

export const OPS_PARAMS = {
	FILTER: "opsFilter",
	PAGE: "opsPage",
	LIMIT: "opsLimit",
} as const;
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const REQUISITION_FILTER_KEYS = REQUISITION_PERFORMANCE_STAT_CARDS.map(
	(card) => card.key,
) as RequisitionPerformanceFilterKey[];

const CANDIDATE_FILTER_KEYS = CANDIDATE_PROCESSING_ISSUE_STAT_CARDS.map(
	(card) => card.key,
) as CandidateProcessingFilterKey[];

const ALL_FILTER_KEYS = [
	...REQUISITION_FILTER_KEYS,
	...CANDIDATE_FILTER_KEYS,
] as OperationsManagementFilterKey[];

export function useOperationsManagementFilters() {
	const { page, limit, setPage, setLimit } = usePaginationControls({
		pageParamKey: OPS_PARAMS.PAGE,
		limitParamKey: OPS_PARAMS.LIMIT,
		defaultLimit: DEFAULT_LIMIT,
		pageSizeOptions: PAGE_SIZE_OPTIONS,
	});

	const [filterParam, setFilterParam] = useQueryState(OPS_PARAMS.FILTER);

	const activeFilterKey: OperationsManagementFilterKey | null =
		ALL_FILTER_KEYS.includes(filterParam as OperationsManagementFilterKey)
			? (filterParam as OperationsManagementFilterKey)
			: null;

	const activeCategory: OperationsManagementFilterCategory | null =
		activeFilterKey == null
			? null
			: REQUISITION_FILTER_KEYS.includes(
						activeFilterKey as RequisitionPerformanceFilterKey,
					)
				? "requisition-performance"
				: "candidate-processing-issues";

	const hasActiveFilter = activeFilterKey != null;

	const operationsQuery = useQuery({
		queryKey: ["command-center", "operations", activeFilterKey, page, limit],
		queryFn: () =>
			CommandCenterService.getOperations({
				filterKey: activeFilterKey ?? undefined,
				page,
				limit,
			}),
		refetchOnMount: "always",
		refetchOnWindowFocus: true,
	});

	const requisitionCountsByFilter = useMemo(
		() =>
			operationsQuery.data?.requisitionCountsByFilter ?? {
				"slow-time-to-fill": 0,
				"no-submissions": 0,
				"low-submissions": 0,
			},
		[operationsQuery.data?.requisitionCountsByFilter],
	);

	const candidateCountsByFilter = useMemo(
		() =>
			operationsQuery.data?.candidateCountsByFilter ?? {
				"overdue-submissions": 0,
				"aging-qualified": 0,
				"aging-shortlisted": 0,
				"interview-delayed": 0,
				"offer-pending": 0,
				"overdue-offers": 0,
				"delayed-onboarding": 0,
			},
		[operationsQuery.data?.candidateCountsByFilter],
	);

	const requisitionRows = operationsQuery.data?.requisitionRows ?? [];
	const candidateRows = operationsQuery.data?.candidateRows ?? [];
	const activeFilterMeta = operationsQuery.data?.activeFilterMeta ?? null;
	const resolvedActiveCategory: OperationsManagementFilterCategory | null =
		operationsQuery.data?.activeCategory ?? activeCategory;

	const handlePaginationChange = useCallback(
		(nextPage: number, nextPageSize: number) => {
			setPage(nextPage);
			setLimit(nextPageSize);
		},
		[setPage, setLimit],
	);

	const handleFilterChange = useCallback(
		(nextFilter: string) => {
			if (
				!ALL_FILTER_KEYS.includes(nextFilter as OperationsManagementFilterKey)
			) {
				return;
			}

			if (nextFilter === activeFilterKey) {
				setFilterParam(null);
				setPage(DEFAULT_PAGE);
				return;
			}

			setFilterParam(nextFilter);
			setPage(DEFAULT_PAGE);
		},
		[activeFilterKey, setFilterParam, setPage],
	);

	const clearFilter = useCallback(() => {
		setFilterParam(null);
		setPage(DEFAULT_PAGE);
	}, [setFilterParam, setPage]);

	return {
		activeFilterKey,
		hasActiveFilter,
		activeCategory: resolvedActiveCategory,
		activeFilterMeta,
		requisitionCountsByFilter,
		candidateCountsByFilter,
		requisitionRows,
		candidateRows,
		rowsTotal: operationsQuery.data?.rowsTotal ?? 0,
		page,
		setPage,
		limit,
		setLimit,
		pageSizeOptions: PAGE_SIZE_OPTIONS,
		isLoading: operationsQuery.isLoading,
		isError: operationsQuery.isError,
		requisitionAttentionRulesConfigured:
			operationsQuery.data?.requisitionAttentionRulesConfigured ?? true,
		candidateAgingRulesConfigured:
			operationsQuery.data?.candidateAgingRulesConfigured ?? true,
		requisitionCardDescriptions:
			operationsQuery.data?.requisitionCardDescriptions,
		candidateCardDescriptions: operationsQuery.data?.candidateCardDescriptions,
		requisitionCardConfigured: operationsQuery.data?.requisitionCardConfigured,
		candidateCardConfigured: operationsQuery.data?.candidateCardConfigured,
		requisitionCardActive: operationsQuery.data?.requisitionCardActive,
		candidateCardActive: operationsQuery.data?.candidateCardActive,
		handleFilterChange,
		handlePaginationChange,
		clearFilter,
	};
}
