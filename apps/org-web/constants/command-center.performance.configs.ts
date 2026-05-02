import { Clock3, Gauge, UserSquare2, UsersRound } from "lucide-react";
import type {
	PerformanceDateRangeOption,
	PerformanceMetricType,
	PerformanceSummaryStatCardConfig,
} from "@/types/command-center";

export const PERFORMANCE_DATE_RANGE_OPTIONS: PerformanceDateRangeOption[] = [
	{ value: "last-30-days", label: "Last 30 Days" },
	{ value: "last-quarter", label: "Last Quarter" },
	{ value: "custom-date-range", label: "Custom Date Range" },
];

export const PERFORMANCE_SUMMARY_STAT_CARDS: PerformanceSummaryStatCardConfig[] =
	[
		{
			key: "active-candidates",
			label: "Active Candidates",
			toneClassName: "bg-blue-100 text-blue-600",
			icon: UsersRound,
		},
		{
			key: "vendor-supplied",
			label: "Vendor-Supplied",
			toneClassName: "bg-violet-100 text-violet-600",
			icon: UserSquare2,
		},
		{
			key: "avg-response-time",
			label: "Avg Response Time",
			unitLabel: "days",
			toneClassName: "bg-green-100 text-green-600",
			icon: Clock3,
		},
		{
			key: "fill-rate",
			label: "Fill Rate",
			toneClassName: "bg-cyan-100 text-cyan-700",
			icon: Gauge,
		},
	];

export const PERFORMANCE_METRIC_TYPE_LABELS: Record<
	PerformanceMetricType,
	string
> = {
	RECRUITMENT_EFFICIENCY: "Recruitment Efficiency",
	COMPLIANCE: "Compliance",
	QUALITY_OF_SERVICE: "Quality of Service",
};
