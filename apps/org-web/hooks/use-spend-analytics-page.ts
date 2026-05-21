"use client";

import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useTabSwitch } from "@repo/ui/hooks/use-tab-switch";
import { parseAsString, useQueryStates } from "nuqs";
import { useCallback, useMemo } from "react";
import type { FilterFieldConfig } from "@/components/general/FilterBar";
import type { SpendTrendChartPoint } from "@/components/spend-analytics/SpendTrendComparisonCard";
import { SPEND_ANALYTICS_FILTER_FIELDS } from "@/constants/spend-analytics";
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

export const SPEND_ANALYTICS_PARAMS = {
	DATE_RANGE: "dateRange",
	DATE_FROM: "dateFrom",
	DATE_TO: "dateTo",
	DEPARTMENT: "department",
	COST_CENTER: "costCenter",
	BREAKDOWN_PAGE: "bp",
	BREAKDOWN_LIMIT: "bl",
	SAVINGS_COST_CENTER: "sc",
} as const;

export function useSpendAnalyticsPage() {
	const { id: orgId } = useOrgContext();

	const [activeTab, setActiveTab] = useTabSwitch(
		["open-committed", "savings"],
		{
			alsoClearParamKeys: [
				SPEND_ANALYTICS_PARAMS.BREAKDOWN_PAGE,
				SPEND_ANALYTICS_PARAMS.BREAKDOWN_LIMIT,
				SPEND_ANALYTICS_PARAMS.SAVINGS_COST_CENTER,
			],
		},
	);

	const {
		page: breakdownPage,
		limit: breakdownLimit,
		setPage: setBreakdownPage,
		setLimit: setBreakdownLimit,
	} = usePaginationControls({
		pageParamKey: SPEND_ANALYTICS_PARAMS.BREAKDOWN_PAGE,
		limitParamKey: SPEND_ANALYTICS_PARAMS.BREAKDOWN_LIMIT,
		defaultLimit: 10,
	});

	const [params, setParams] = useQueryStates({
		[SPEND_ANALYTICS_PARAMS.DATE_RANGE]:
			parseAsString.withDefault("current-quarter"),
		[SPEND_ANALYTICS_PARAMS.DATE_FROM]: parseAsString.withDefault(""),
		[SPEND_ANALYTICS_PARAMS.DATE_TO]: parseAsString.withDefault(""),
		[SPEND_ANALYTICS_PARAMS.DEPARTMENT]: parseAsString.withDefault("all"),
		[SPEND_ANALYTICS_PARAMS.COST_CENTER]: parseAsString.withDefault("all"),
		[SPEND_ANALYTICS_PARAMS.SAVINGS_COST_CENTER]:
			parseAsString.withDefault("all"),
	});

	const { data: departments = [] } = useOrgDepartmentsForUsers(orgId);

	const dateFilterInput = useMemo(
		() => ({
			dateRange: params[SPEND_ANALYTICS_PARAMS.DATE_RANGE] ?? "current-quarter",
			dateFrom: params[SPEND_ANALYTICS_PARAMS.DATE_FROM],
			dateTo: params[SPEND_ANALYTICS_PARAMS.DATE_TO],
		}),
		[
			params[SPEND_ANALYTICS_PARAMS.DATE_RANGE],
			params[SPEND_ANALYTICS_PARAMS.DATE_FROM],
			params[SPEND_ANALYTICS_PARAMS.DATE_TO],
		],
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
			params[SPEND_ANALYTICS_PARAMS.DATE_RANGE] === "custom"
				? [
						{
							key: SPEND_ANALYTICS_PARAMS.DATE_FROM,
							label: "Start date",
							type: "date" as const,
							primary: true,
							placeholder: "Start date",
							max: params[SPEND_ANALYTICS_PARAMS.DATE_TO]?.trim() || undefined,
						},
						{
							key: SPEND_ANALYTICS_PARAMS.DATE_TO,
							label: "End date",
							type: "date" as const,
							primary: true,
							placeholder: "End date",
							min:
								params[SPEND_ANALYTICS_PARAMS.DATE_FROM]?.trim() || undefined,
						},
					]
				: [];
		return [
			...[...SPEND_ANALYTICS_FILTER_FIELDS],
			...customDateFields,
			{
				key: SPEND_ANALYTICS_PARAMS.DEPARTMENT,
				label: "Department",
				type: "select" as const,
				primary: true,
				options: deptOptions,
			},
			{
				key: SPEND_ANALYTICS_PARAMS.COST_CENTER,
				label: "Cost Center",
				type: "select" as const,
				primary: true,
				options: ccOptions,
			},
		];
	}, [
		departments,
		params[SPEND_ANALYTICS_PARAMS.DATE_RANGE],
		params[SPEND_ANALYTICS_PARAMS.DATE_TO],
		params[SPEND_ANALYTICS_PARAMS.DATE_FROM],
	]);

	const scope = useMemo(
		() =>
			spendAnalyticsScopeFromFilters({
				department: params[SPEND_ANALYTICS_PARAMS.DEPARTMENT],
				costCenter: params[SPEND_ANALYTICS_PARAMS.COST_CENTER],
			}),
		[
			params[SPEND_ANALYTICS_PARAMS.DEPARTMENT],
			params[SPEND_ANALYTICS_PARAMS.COST_CENTER],
		],
	);

	const onFilterChange = useCallback(
		(key: string, value: string) => {
			if (key === SPEND_ANALYTICS_PARAMS.DATE_RANGE && value !== "custom") {
				setParams({
					[key]: value,
					[SPEND_ANALYTICS_PARAMS.DATE_FROM]: null,
					[SPEND_ANALYTICS_PARAMS.DATE_TO]: null,
				});
			} else {
				setParams({ [key]: value });
			}
		},
		[setParams],
	);

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
			all: true,
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
			page: breakdownPage,
			limit: breakdownLimit,
		};
	}, [dateFilterInput, scope, breakdownPage, breakdownLimit]);

	const { data: breakdown, isLoading: breakdownLoading } =
		useSpendOpenCommittedBreakdown(orgId, breakdownQuery, {
			enabled: spendRangeReady,
		});

	const openCommittedTotals = useMemo(
		() => ({
			open: breakdown?.totalOpenSpend ?? 0,
			committed: breakdown?.totalCommittedSpend ?? 0,
		}),
		[breakdown?.totalOpenSpend, breakdown?.totalCommittedSpend],
	);

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

	const totalSavings = summary?.totalSpend ?? 0;

	const filterValues = useMemo(() => {
		const { [SPEND_ANALYTICS_PARAMS.SAVINGS_COST_CENTER]: sc, ...rest } =
			params;
		return rest as Record<string, string>;
	}, [params]);

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
		activeTab,
		setActiveTab,
		breakdownPage,
		setBreakdownPage,
		breakdownLimit,
		setBreakdownLimit,
		savingsCostCenter: params[SPEND_ANALYTICS_PARAMS.SAVINGS_COST_CENTER],
		setSavingsCostCenter: (sc: string) =>
			setParams({ [SPEND_ANALYTICS_PARAMS.SAVINGS_COST_CENTER]: sc }),
	};
}
