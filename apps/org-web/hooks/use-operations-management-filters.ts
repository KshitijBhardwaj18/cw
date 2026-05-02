"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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

const FILTER_PARAM = "opsFilter";
const PAGE_PARAM = "opsPage";
const LIMIT_PARAM = "opsLimit";
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

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
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const filterParam = searchParams.get(FILTER_PARAM);
	const pageParam = Number(searchParams.get(PAGE_PARAM) ?? DEFAULT_PAGE);
	const limitParam = Number(searchParams.get(LIMIT_PARAM) ?? DEFAULT_LIMIT);
	const page =
		Number.isFinite(pageParam) && pageParam > 0 ? pageParam : DEFAULT_PAGE;
	const limit =
		Number.isFinite(limitParam) && limitParam > 0 && limitParam <= 100
			? limitParam
			: DEFAULT_LIMIT;
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

	const buildUrlWithFilter = useCallback(
		(filterKey?: OperationsManagementFilterKey | null) => {
			const nextParams = new URLSearchParams(searchParams.toString());
			nextParams.set(PAGE_PARAM, String(DEFAULT_PAGE));
			nextParams.set(LIMIT_PARAM, String(limit));

			if (!filterKey) {
				nextParams.delete(FILTER_PARAM);
			} else {
				nextParams.set(FILTER_PARAM, filterKey);
			}

			const nextQuery = nextParams.toString();
			return nextQuery ? `${pathname}?${nextQuery}` : pathname;
		},
		[limit, pathname, searchParams],
	);

	const handlePaginationChange = useCallback(
		(nextPage: number, nextPageSize: number) => {
			const nextParams = new URLSearchParams(searchParams.toString());
			nextParams.set(PAGE_PARAM, String(nextPage));
			nextParams.set(LIMIT_PARAM, String(nextPageSize));
			const nextQuery = nextParams.toString();
			router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
				scroll: false,
			});
		},
		[pathname, router, searchParams],
	);

	const handleFilterChange = useCallback(
		(nextFilter: string) => {
			if (
				!ALL_FILTER_KEYS.includes(nextFilter as OperationsManagementFilterKey)
			) {
				return;
			}

			if (nextFilter === activeFilterKey) {
				router.push(buildUrlWithFilter(null), { scroll: false });
				return;
			}

			router.push(
				buildUrlWithFilter(nextFilter as OperationsManagementFilterKey),
				{
					scroll: false,
				},
			);
		},
		[activeFilterKey, buildUrlWithFilter, router],
	);

	const clearFilter = useCallback(() => {
		router.push(buildUrlWithFilter(null), { scroll: false });
	}, [buildUrlWithFilter, router]);

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
		page: operationsQuery.data?.page ?? page,
		limit: operationsQuery.data?.limit ?? limit,
		isLoading: operationsQuery.isLoading,
		isError: operationsQuery.isError,
		handleFilterChange,
		handlePaginationChange,
		clearFilter,
	};
}
