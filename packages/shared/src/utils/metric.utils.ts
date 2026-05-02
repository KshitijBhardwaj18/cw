export type MetricValueUnit = "percent" | "days" | "ratio";
export type MetricGoalDirection = "higher_is_better" | "lower_is_better";
export type MetricKeyLike =
	| "REJECTION_PERCENTAGE"
	| "FILL_RATE_LONG_TERM_REQS"
	| "FILL_RATE_SHIFTS"
	| "SUBMIT_TO_OFFER_RATIO"
	| "AVG_TIME_TO_FIRST_SUBMISSION"
	| "AVG_TIME_PUBLISH_TO_ACCEPT"
	| "PERCENT_INCOMPLETE_ASSIGNMENTS"
	| "EXPIRED_CREDENTIALING_PERCENT"
	| "ON_TIME_STARTS_PERCENT"
	| "BACK_OUT_PERCENTAGE"
	| "PERFORMANCE_GRIEVANCE_PERCENT"
	| "GRIEVANCE_PERCENTAGE";

export const METRIC_KEY_METADATA: Record<
	MetricKeyLike,
	{ unit: MetricValueUnit; direction: MetricGoalDirection }
> = {
	REJECTION_PERCENTAGE: {
		unit: "percent",
		direction: "lower_is_better",
	},
	FILL_RATE_LONG_TERM_REQS: {
		unit: "percent",
		direction: "higher_is_better",
	},
	FILL_RATE_SHIFTS: {
		unit: "percent",
		direction: "higher_is_better",
	},
	SUBMIT_TO_OFFER_RATIO: {
		unit: "ratio",
		direction: "higher_is_better",
	},
	AVG_TIME_TO_FIRST_SUBMISSION: {
		unit: "days",
		direction: "lower_is_better",
	},
	AVG_TIME_PUBLISH_TO_ACCEPT: {
		unit: "days",
		direction: "lower_is_better",
	},
	PERCENT_INCOMPLETE_ASSIGNMENTS: {
		unit: "percent",
		direction: "lower_is_better",
	},
	EXPIRED_CREDENTIALING_PERCENT: {
		unit: "percent",
		direction: "lower_is_better",
	},
	ON_TIME_STARTS_PERCENT: {
		unit: "percent",
		direction: "higher_is_better",
	},
	BACK_OUT_PERCENTAGE: {
		unit: "percent",
		direction: "lower_is_better",
	},
	PERFORMANCE_GRIEVANCE_PERCENT: {
		unit: "percent",
		direction: "lower_is_better",
	},
	GRIEVANCE_PERCENTAGE: {
		unit: "percent",
		direction: "lower_is_better",
	},
};

function getMetricMetadata(metricKey: string) {
	return (
		METRIC_KEY_METADATA[metricKey as MetricKeyLike] ?? {
			unit: "percent" as const,
			direction: "lower_is_better" as const,
		}
	);
}

export function metricGoalSuffix(metricKey: string): string {
	const unit = getMetricMetadata(metricKey).unit;
	if (unit === "percent") return "%";
	if (unit === "days") return "days";
	return "";
}

export function isHigherBetterMetric(metricKey: string): boolean {
	return getMetricMetadata(metricKey).direction === "higher_is_better";
}

export function formatMetricValue(metricKey: string, value: number): string {
	const normalized = Number.isFinite(value) ? value : 0;
	const unit = getMetricMetadata(metricKey).unit;
	if (unit === "days") return `${normalized.toFixed(2)} days`;
	if (unit === "percent") return `${normalized.toFixed(2)}%`;
	return normalized.toFixed(2);
}
