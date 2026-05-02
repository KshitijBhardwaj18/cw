"use client";

import { useCallback, useMemo, useState } from "react";
import type { FilterFieldConfig } from "@/components/general/FilterBar";
import type { SpendTrendChartPoint } from "@/components/spend-analytics/SpendTrendComparisonCard";
import {
	SPEND_ANALYTICS_DEFAULT_FILTERS,
	SPEND_ANALYTICS_FILTER_FIELDS,
} from "@/constants/spend-analytics";
import { useOrgContext } from "@/contexts/org-context";
import {
	useSpendAnalyticsList,
	useSpendAnalyticsSummary,
	useSpendOpenCommittedBreakdown,
} from "@/queries/billing.queries";
import { useOrgDepartmentsForUsers } from "@/queries/organizations.queries";
import {
	monthLabelsForQuarterContaining,
	spendByMonthIndexInQuarter,
} from "@/utils/spend-analytics-aggregations";
import {
	isSpendCustomRangeComplete,
	quarterStartFromPeriodFrom,
	spendAnalyticsQueryFromFilters,
	spendAnalyticsScopeFromFilters,
} from "@/utils/spend-analytics-api-query";

const DETAIL_LIST_LIMIT = 500;

function uniqueCostCenterOptions(
	departments: { costCenter?: string | null }[],
): { value: string; label: string }[] {
	const byKey = new Map<string, string>();
	for (const d of departments) {
		const raw = d.costCenter?.trim();
		if (!raw) continue;
		const key = raw.toLowerCase();
		if (!byKey.has(key)) byKey.set(key, raw);
	}
	return [...byKey.entries()]
		.sort((a, b) =>
			a[1].localeCompare(b[1], undefined, { sensitivity: "base" }),
		)
		.map(([, label]) => ({ value: label, label }));
}

export function useSpendAnalyticsPage() {
	const { id: orgId } = useOrgContext();
	const [filterValues, setFilterValues] = useState<Record<string, string>>(
		SPEND_ANALYTICS_DEFAULT_FILTERS,
	);

	const { data: departments = [] } = useOrgDepartmentsForUsers(orgId);

	const dateFilterInput = useMemo(
		() => ({
			dateRange: filterValues.dateRange ?? "current-quarter",
			dateFrom: filterValues.dateFrom,
			dateTo: filterValues.dateTo,
		}),
		[filterValues.dateRange, filterValues.dateFrom, filterValues.dateTo],
	);

	const spendRangeReady = useMemo(
		() => isSpendCustomRangeComplete(dateFilterInput),
		[dateFilterInput],
	);

	const isSpendFiltersPending =
		dateFilterInput.dateRange === "custom" && !spendRangeReady;

	const filterFields = useMemo((): FilterFieldConfig[] => {
		const deptOptions: { value: string; label: string }[] = [
			{ value: "all", label: "All Departments" },
			...departments.map((d) => ({ value: d.id, label: d.name })),
		];
		const ccOptions: { value: string; label: string }[] = [
			{ value: "all", label: "All Cost Centers" },
			...uniqueCostCenterOptions(departments),
		];
		const customDateFields: FilterFieldConfig[] =
			filterValues.dateRange === "custom"
				? [
						{
							key: "dateFrom",
							label: "Start date",
							type: "date",
							primary: true,
							placeholder: "Start date",
							max: filterValues.dateTo?.trim() || undefined,
						},
						{
							key: "dateTo",
							label: "End date",
							type: "date",
							primary: true,
							placeholder: "End date",
							min: filterValues.dateFrom?.trim() || undefined,
						},
					]
				: [];
		return [
			...[...SPEND_ANALYTICS_FILTER_FIELDS],
			...customDateFields,
			{
				key: "department",
				label: "Department",
				type: "select",
				primary: true,
				options: deptOptions,
			},
			{
				key: "costCenter",
				label: "Cost Center",
				type: "select",
				primary: true,
				options: ccOptions,
			},
		];
	}, [
		departments,
		filterValues.dateFrom,
		filterValues.dateRange,
		filterValues.dateTo,
	]);

	const scope = useMemo(
		() =>
			spendAnalyticsScopeFromFilters({
				department: filterValues.department,
				costCenter: filterValues.costCenter,
			}),
		[filterValues.department, filterValues.costCenter],
	);

	const onFilterChange = useCallback((key: string, value: string) => {
		setFilterValues((prev) => {
			const next = { ...prev, [key]: value };
			if (key === "dateRange" && value !== "custom") {
				next.dateFrom = "";
				next.dateTo = "";
			}
			return next;
		});
	}, []);

	const summaryQuery = useMemo(
		() => ({
			...spendAnalyticsQueryFromFilters(dateFilterInput),
			...scope,
		}),
		[dateFilterInput, scope],
	);

	const trendCurPeriod = useMemo(
		() => spendAnalyticsQueryFromFilters({ dateRange: "current-quarter" }),
		[],
	);
	const trendLastPeriod = useMemo(
		() => spendAnalyticsQueryFromFilters({ dateRange: "last-quarter" }),
		[],
	);

	const trendCurrentQuery = useMemo(
		() => ({
			...trendCurPeriod,
			...scope,
			all: true,
		}),
		[trendCurPeriod, scope],
	);
	const trendLastQuery = useMemo(
		() => ({
			...trendLastPeriod,
			...scope,
			all: true,
		}),
		[trendLastPeriod, scope],
	);

	const detailQuery = useMemo(() => {
		const period = spendAnalyticsQueryFromFilters(dateFilterInput);
		return {
			...period,
			...scope,
			page: 1,
			limit: DETAIL_LIST_LIMIT,
		};
	}, [dateFilterInput, scope]);

	const { data: summary, isLoading: summaryLoading } = useSpendAnalyticsSummary(
		orgId,
		summaryQuery,
		{ enabled: spendRangeReady },
	);

	const { data: trendCurrentList, isLoading: trendCurrentLoading } =
		useSpendAnalyticsList(orgId, trendCurrentQuery);
	const { data: trendLastList, isLoading: trendLastLoading } =
		useSpendAnalyticsList(orgId, trendLastQuery);

	const trendLoading = trendCurrentLoading || trendLastLoading;

	const { data: detailList, isLoading: detailLoading } = useSpendAnalyticsList(
		orgId,
		detailQuery,
		{ enabled: spendRangeReady },
	);

	const breakdownQuery = useMemo(() => {
		const period = spendAnalyticsQueryFromFilters(dateFilterInput);
		return {
			...period,
			...scope,
			limit: 50,
		};
	}, [dateFilterInput, scope]);

	const { data: breakdown, isLoading: breakdownLoading } =
		useSpendOpenCommittedBreakdown(orgId, breakdownQuery, {
			enabled: spendRangeReady,
		});

	const openCommittedTotals = useMemo(() => {
		const rows = breakdown?.data ?? [];
		return rows.reduce(
			(acc, r) => {
				acc.open += r.openSpend ?? 0;
				acc.committed += r.committedSpend ?? 0;
				return acc;
			},
			{ open: 0, committed: 0 },
		);
	}, [breakdown?.data]);

	const trendChartData = useMemo((): SpendTrendChartPoint[] => {
		const curStart = quarterStartFromPeriodFrom(trendCurPeriod.periodFrom);
		const lastStart = quarterStartFromPeriodFrom(trendLastPeriod.periodFrom);
		const labels = monthLabelsForQuarterContaining(curStart);
		const curTotals = spendByMonthIndexInQuarter(
			curStart,
			trendCurrentList?.data ?? [],
		);
		const lastTotals = spendByMonthIndexInQuarter(
			lastStart,
			trendLastList?.data ?? [],
		);
		return labels.map((month, i) => ({
			month,
			currentQuarter: curTotals[i],
			lastQuarter: lastTotals[i],
		}));
	}, [
		trendCurPeriod.periodFrom,
		trendLastPeriod.periodFrom,
		trendCurrentList?.data,
		trendLastList?.data,
	]);

	const trendTotals = useMemo(() => {
		const current = trendChartData.reduce(
			(sum, p) => sum + p.currentQuarter,
			0,
		);
		const last = trendChartData.reduce((sum, p) => sum + p.lastQuarter, 0);
		return { current, last };
	}, [trendChartData]);

	const spendDeltaPct = useMemo(() => {
		if (trendTotals.last <= 0) return undefined;
		return ((trendTotals.current - trendTotals.last) / trendTotals.last) * 100;
	}, [trendTotals.current, trendTotals.last]);

	const totalSavings = useMemo(
		() => (detailList?.data ?? []).reduce((sum, r) => sum + r.totalSpend, 0),
		[detailList?.data],
	);

	return {
		orgId,
		filterFields,
		filterValues,
		onFilterChange,
		summary,
		summaryLoading,
		isSpendFiltersPending,
		trendChartData,
		trendLoading,
		detailList,
		detailLoading,
		breakdown,
		breakdownLoading,
		openCommittedTotals,
		spendDeltaPct,
		totalSavings,
	};
}
