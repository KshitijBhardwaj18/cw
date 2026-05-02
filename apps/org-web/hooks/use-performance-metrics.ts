"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CommandCenterService } from "@/services/command-center.service";
import type { PerformanceDateRangeKey } from "@/types/command-center";

const RANGE_PARAM = "performanceRange";
const START_DATE_PARAM = "performanceStartDate";
const END_DATE_PARAM = "performanceEndDate";

const DEFAULT_RANGE: PerformanceDateRangeKey = "last-30-days";

export function usePerformanceMetrics() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const rangeParam = searchParams.get(RANGE_PARAM);
	const selectedRange: PerformanceDateRangeKey =
		rangeParam === "last-quarter" ||
		rangeParam === "custom-date-range" ||
		rangeParam === "last-30-days"
			? (rangeParam as PerformanceDateRangeKey)
			: DEFAULT_RANGE;

	const startDateFromUrl = searchParams.get(START_DATE_PARAM) ?? "";
	const endDateFromUrl = searchParams.get(END_DATE_PARAM) ?? "";

	const [startDate, setStartDate] = useState(startDateFromUrl);
	const [endDate, setEndDate] = useState(endDateFromUrl);

	useEffect(() => {
		setStartDate(startDateFromUrl);
		setEndDate(endDateFromUrl);
	}, [startDateFromUrl, endDateFromUrl]);

	const updateParams = useCallback(
		(next: {
			range: PerformanceDateRangeKey;
			startDate?: string;
			endDate?: string;
		}) => {
			const nextParams = new URLSearchParams(searchParams.toString());
			nextParams.set(RANGE_PARAM, next.range);

			if (next.startDate) {
				nextParams.set(START_DATE_PARAM, next.startDate);
			} else {
				nextParams.delete(START_DATE_PARAM);
			}

			if (next.endDate) {
				nextParams.set(END_DATE_PARAM, next.endDate);
			} else {
				nextParams.delete(END_DATE_PARAM);
			}

			const nextQuery = nextParams.toString();
			router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
				scroll: false,
			});
		},
		[pathname, router, searchParams],
	);

	const handleRangeChange = useCallback(
		(range: PerformanceDateRangeKey) => {
			if (range === "custom-date-range") {
				updateParams({
					range,
					startDate,
					endDate,
				});
				return;
			}

			updateParams({ range });
		},
		[endDate, startDate, updateParams],
	);

	const applyCustomDateRange = useCallback(() => {
		if (!startDate || !endDate) {
			return;
		}

		if (startDate > endDate) {
			return;
		}

		updateParams({
			range: "custom-date-range",
			startDate,
			endDate,
		});
	}, [endDate, startDate, updateParams]);

	const effectiveRange: PerformanceDateRangeKey =
		selectedRange === "custom-date-range" ? "custom-date-range" : selectedRange;

	const performanceQuery = useQuery({
		queryKey: [
			"command-center",
			"performance",
			effectiveRange,
			selectedRange === "custom-date-range" ? startDate : "",
			selectedRange === "custom-date-range" ? endDate : "",
		],
		queryFn: () =>
			CommandCenterService.getPerformance({
				range: effectiveRange,
				startDate:
					effectiveRange === "custom-date-range" ? startDate : undefined,
				endDate: effectiveRange === "custom-date-range" ? endDate : undefined,
			}),
		enabled:
			effectiveRange !== "custom-date-range" ||
			(Boolean(startDate) && Boolean(endDate)),
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
		isLoading: performanceQuery.isLoading,
		isError: performanceQuery.isError,
		showCustomDateInputs: selectedRange === "custom-date-range",
	};
}
