import type {
	PerformanceMetricsResponse,
	PerformanceSummaryStatsResponse,
} from "@/types/command-center";

const BASE_METRICS_GROUPS: PerformanceMetricsResponse["data"] = [
	{
		type: "RECRUITMENT_EFFICIENCY",
		metrics: [
			{
				id: "rejection-percentage",
				type: "RECRUITMENT_EFFICIENCY",
				title: "Rejection Percentage",
				goal: "15%",
				current: "12%",
				status: "MEETING_GOAL",
			},
			{
				id: "fill-rate-long-term-req",
				type: "RECRUITMENT_EFFICIENCY",
				title: "Fill Rate (Long Term Req)",
				goal: "85%",
				current: "88%",
				status: "MEETING_GOAL",
			},
			{
				id: "fill-rate-shifts",
				type: "RECRUITMENT_EFFICIENCY",
				title: "Fill Rate (Shifts)",
				goal: "90%",
				current: "87%",
				status: "BELOW_GOAL",
			},
			{
				id: "submit-to-offer-ratio",
				type: "RECRUITMENT_EFFICIENCY",
				title: "Submit to Offer Ratio",
				goal: "0.30",
				current: "0.28",
				status: "BELOW_GOAL",
			},
			{
				id: "avg-time-to-first-submission",
				type: "RECRUITMENT_EFFICIENCY",
				title: "Avg Time to 1st Submission",
				goal: "3 days",
				current: "2.5 days",
				status: "MEETING_GOAL",
			},
			{
				id: "avg-time-publish-to-accept",
				type: "RECRUITMENT_EFFICIENCY",
				title: "Avg Time from Publish to Accept",
				goal: "14 days",
				current: "12 days",
				status: "MEETING_GOAL",
			},
		],
	},
	{
		type: "COMPLIANCE",
		metrics: [
			{
				id: "incomplete-assignments",
				type: "COMPLIANCE",
				title: "Percent of Incomplete Assignments",
				goal: "5%",
				current: "3%",
				status: "MEETING_GOAL",
			},
			{
				id: "expired-credentialing",
				type: "COMPLIANCE",
				title: "Expired Credentialing %",
				goal: "5%",
				current: "1.5%",
				status: "MEETING_GOAL",
			},
			{
				id: "on-time-starts",
				type: "COMPLIANCE",
				title: "On Time Starts %",
				goal: "95%",
				current: "96%",
				status: "MEETING_GOAL",
			},
		],
	},
	{
		type: "QUALITY_OF_SERVICE",
		metrics: [
			{
				id: "backout-percentage",
				type: "QUALITY_OF_SERVICE",
				title: "Back Out Percentage",
				goal: "5%",
				current: "4%",
				status: "MEETING_GOAL",
			},
			{
				id: "performance-grievance",
				type: "QUALITY_OF_SERVICE",
				title: "Performance Grievance %",
				goal: "3%",
				current: "2.5%",
				status: "MEETING_GOAL",
			},
			{
				id: "grievance-percentage",
				type: "QUALITY_OF_SERVICE",
				title: "Grievance Percentage",
				goal: "8%",
				current: "6%",
				status: "MEETING_GOAL",
			},
			{
				id: "quality-incomplete-assignments",
				type: "QUALITY_OF_SERVICE",
				title: "Percent of Incomplete Assignments",
				goal: "5%",
				current: "3%",
				status: "MEETING_GOAL",
			},
		],
	},
];

export const MOCK_PERFORMANCE_SUMMARY_BY_RANGE: Record<
	"last-30-days" | "last-quarter" | "custom-date-range",
	PerformanceSummaryStatsResponse
> = {
	"last-30-days": {
		data: [
			{ key: "active-candidates", value: "148" },
			{ key: "vendor-supplied", value: "62" },
			{ key: "avg-response-time", value: "2.3" },
			{ key: "fill-rate", value: "78%" },
		],
	},
	"last-quarter": {
		data: [
			{ key: "active-candidates", value: "402" },
			{ key: "vendor-supplied", value: "168" },
			{ key: "avg-response-time", value: "2.8" },
			{ key: "fill-rate", value: "75%" },
		],
	},
	"custom-date-range": {
		data: [
			{ key: "active-candidates", value: "96" },
			{ key: "vendor-supplied", value: "39" },
			{ key: "avg-response-time", value: "2.1" },
			{ key: "fill-rate", value: "81%" },
		],
	},
};

export const MOCK_PERFORMANCE_METRICS_BY_RANGE: Record<
	"last-30-days" | "last-quarter" | "custom-date-range",
	PerformanceMetricsResponse
> = {
	"last-30-days": {
		data: BASE_METRICS_GROUPS,
	},
	"last-quarter": {
		data: BASE_METRICS_GROUPS.map((group) => ({
			...group,
			metrics: group.metrics.map((metric) => {
				if (metric.id === "fill-rate-shifts") {
					return { ...metric, current: "85%" };
				}
				if (metric.id === "submit-to-offer-ratio") {
					return { ...metric, current: "0.26" };
				}
				return metric;
			}),
		})),
	},
	"custom-date-range": {
		data: BASE_METRICS_GROUPS,
	},
};
