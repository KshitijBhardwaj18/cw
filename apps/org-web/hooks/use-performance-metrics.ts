"use client";

import { useQuery } from "@tanstack/react-query";
import { parseAsString, useQueryStates } from "nuqs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CommandCenterService } from "@/services/command-center.service";
import type { PerformanceDateRangeKey } from "@/types/command-center";

export const PERFORMANCE_PARAMS = {
	RANGE: "performanceRange",
	START_DATE: "performanceStartDate",
	END_DATE: "performanceEndDate",
} as const;

const DEFAULT_RANGE: PerformanceDateRangeKey = "last-30-days";

export function usePerformanceMetrics() {
	const [params, setParams] = useQueryStates({
		[PERFORMANCE_PARAMS.RANGE]: parseAsString.withDefault(DEFAULT_RANGE),
		[PERFORMANCE_PARAMS.START_DATE]: parseAsString.withDefault(""),
		[PERFORMANCE_PARAMS.END_DATE]: parseAsString.withDefault(""),
	});

	const rangeParam = params[PERFORMANCE_PARAMS.RANGE];
	const selectedRange: PerformanceDateRangeKey =
		rangeParam === "last-quarter" ||
		rangeParam === "custom-date-range" ||
		rangeParam === "last-30-days"
			? (rangeParam as PerformanceDateRangeKey)
			: DEFAULT_RANGE;

	const startDateFromUrl = params[PERFORMANCE_PARAMS.START_DATE];
	const endDateFromUrl = params[PERFORMANCE_PARAMS.END_DATE];

	const [startDate, setStartDate] = useState(startDateFromUrl);
	const [endDate, setEndDate] = useState(endDateFromUrl);

	useEffect(() => {
		setStartDate(startDateFromUrl);
		setEndDate(endDateFromUrl);
	}, [startDateFromUrl, endDateFromUrl]);

	const handleRangeChange = useCallback(
		(range: PerformanceDateRangeKey) => {
			if (range === "custom-date-range") {
				setParams({
					[PERFORMANCE_PARAMS.RANGE]: range,
					[PERFORMANCE_PARAMS.START_DATE]: startDate || null,
					[PERFORMANCE_PARAMS.END_DATE]: endDate || null,
				});
				return;
			}

			setParams({
				[PERFORMANCE_PARAMS.RANGE]: range,
				[PERFORMANCE_PARAMS.START_DATE]: null,
				[PERFORMANCE_PARAMS.END_DATE]: null,
			});
		},
		[endDate, startDate, setParams],
	);

	const applyCustomDateRange = useCallback(() => {
		if (!startDate || !endDate) {
			return;
		}

		if (startDate > endDate) {
			return;
		}

		setParams({
			[PERFORMANCE_PARAMS.RANGE]: "custom-date-range",
			[PERFORMANCE_PARAMS.START_DATE]: startDate,
			[PERFORMANCE_PARAMS.END_DATE]: endDate,
		});
	}, [endDate, startDate, setParams]);

	const isCustom = selectedRange === "custom-date-range";

	const performanceQuery = useQuery({
		queryKey: [
			"command-center",
			"performance",
			selectedRange,
			isCustom ? startDate : "",
			isCustom ? endDate : "",
		],
		queryFn: () =>
			CommandCenterService.getPerformance({
				range: selectedRange,
				startDate: isCustom ? startDate : undefined,
				endDate: isCustom ? endDate : undefined,
			}),
		enabled: !isCustom || (Boolean(startDate) && Boolean(endDate)),
	});

	const summaryStats = useMemo(
		() => performanceQuery.data?.summaryStats ?? [],
		[performanceQuery.data?.summaryStats],
	);

	const groupedMetrics = useMemo(
		() => performanceQuery.data?.groupedMetrics ?? [],
		[performanceQuery.data?.groupedMetrics],
	);

	return {
		selectedRange,
		startDate,
		endDate,
		setStartDate,
		setEndDate,
		handleRangeChange,
		applyCustomDateRange,
		summaryStats,
		groupedMetrics,
		lastRefreshedAt: performanceQuery.data?.lastRefreshedAt ?? null,
		isLoading: performanceQuery.isLoading,
		isError: performanceQuery.isError,
		showCustomDateInputs: isCustom,
	};
}
