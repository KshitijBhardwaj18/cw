"use client";

import { Button } from "@repo/ui/components/button";
import { DatePicker } from "@repo/ui/components/date-picker";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { format } from "date-fns";
import {
	PERFORMANCE_DATE_RANGE_OPTIONS,
	PERFORMANCE_METRIC_TYPE_LABELS,
	PERFORMANCE_SUMMARY_STAT_CARDS,
} from "@/constants/command-center.performance.configs";
import { usePerformanceMetrics } from "@/hooks/use-performance-metrics";
import type {
	PerformanceDateRangeKey,
	PerformanceSummaryStatKey,
} from "@/types/command-center";
import { PerformanceMetricCard } from "./PerformanceMetricCard";
import { PerformanceSummaryStatCard } from "./PerformanceSummaryStatCard";
import { PerformanceMetricsCardsSkeleton } from "./PerformanceTabCardsSkeleton";

function todayYmdLocal(): string {
	return format(new Date(), "yyyy-MM-dd");
}

export const PerformanceTab = () => {
	const {
		selectedRange,
		startDate,
		endDate,
		setStartDate,
		setEndDate,
		handleRangeChange,
		applyCustomDateRange,
		summaryStats,
		groupedMetrics,
		showCustomDateInputs,
		isLoading,
	} = usePerformanceMetrics();

	const todayYmd = todayYmdLocal();
	const hasRangeOrderError = Boolean(
		startDate && endDate && startDate > endDate,
	);
	const hasFutureDateError = Boolean(
		(startDate && startDate > todayYmd) || (endDate && endDate > todayYmd),
	);
	const startDateMax = endDate && endDate <= todayYmd ? endDate : todayYmd;
	const canApplyCustomRange = Boolean(
		startDate && endDate && !hasRangeOrderError && !hasFutureDateError,
	);

	const summaryValueByKey = summaryStats.reduce<
		Record<PerformanceSummaryStatKey, string>
	>(
		(acc, item) => {
			acc[item.key] = item.value;
			return acc;
		},
		{
			"active-candidates": "0",
			"vendor-supplied": "0",
			"avg-response-time": "0",
			"fill-rate": "0%",
		},
	);

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="space-y-1.5">
					<h3 className="text-xl font-semibold">Performance Metrics</h3>
					<p className="text-muted-foreground text-sm">
						Track key performance indicators against organizational goals
					</p>
				</div>

				<Select
					value={selectedRange}
					onValueChange={(value) =>
						handleRangeChange(value as PerformanceDateRangeKey)
					}
				>
					<SelectTrigger className="w-52">
						<SelectValue placeholder="Last 30 Days" />
					</SelectTrigger>
					<SelectContent>
						{PERFORMANCE_DATE_RANGE_OPTIONS.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{showCustomDateInputs ? (
				<div className="space-y-3 border p-4">
					<div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]">
						<div className="space-y-1.5">
							<label
								htmlFor="performance-custom-start"
								className="text-xs font-medium"
							>
								Start Date
							</label>
							<DatePicker
								id="performance-custom-start"
								className="h-9"
								value={startDate}
								onChange={setStartDate}
								placeholder="Pick start date"
								max={startDateMax}
								clearable
								aria-invalid={hasRangeOrderError || hasFutureDateError}
							/>
						</div>
						<div className="space-y-1.5">
							<label
								htmlFor="performance-custom-end"
								className="text-xs font-medium"
							>
								End Date
							</label>
							<DatePicker
								id="performance-custom-end"
								className="h-9"
								value={endDate}
								onChange={setEndDate}
								placeholder="Pick end date"
								min={startDate || undefined}
								max={todayYmd}
								clearable
								aria-invalid={hasRangeOrderError || hasFutureDateError}
							/>
						</div>
						<div className="flex items-end">
							<Button
								type="button"
								onClick={applyCustomDateRange}
								disabled={!canApplyCustomRange}
							>
								Apply
							</Button>
						</div>
					</div>
					{hasRangeOrderError ? (
						<p className="text-destructive text-sm" role="alert">
							Start date must be on or before end date.
						</p>
					) : null}
					{hasFutureDateError && !hasRangeOrderError ? (
						<p className="text-destructive text-sm" role="alert">
							Dates cannot be in the future.
						</p>
					) : null}
				</div>
			) : null}

			{isLoading ? (
				<PerformanceMetricsCardsSkeleton />
			) : (
				<>
					<div className="space-y-3">
						<p className="text-lg font-semibold">Workforce Summary</p>
						<p className="text-muted-foreground text-sm">
							Key workforce metrics and performance
						</p>
						<div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
							{PERFORMANCE_SUMMARY_STAT_CARDS.map((card) => (
								<PerformanceSummaryStatCard
									key={card.key}
									card={card}
									valueByKey={summaryValueByKey}
								/>
							))}
						</div>
					</div>

					{groupedMetrics.map((group) => (
						<div key={group.type} className="space-y-3">
							<div className="flex items-center gap-3">
								<p className="text-lg font-semibold">
									{PERFORMANCE_METRIC_TYPE_LABELS[group.type]}
								</p>
								<div className="bg-primary/60 h-px flex-1" />
							</div>
							<div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
								{group.metrics.map((metric) => (
									<PerformanceMetricCard key={metric.id} metric={metric} />
								))}
							</div>
						</div>
					))}
				</>
			)}
		</div>
	);
};
