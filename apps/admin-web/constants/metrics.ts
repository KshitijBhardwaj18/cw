import type { MetricType } from "@repo/db";

export const METRIC_TYPE_OPTIONS: { value: MetricType; label: string }[] = [
	{ value: "RECRUITMENT_EFFICIENCY", label: "Recruitment Efficiency" },
	{ value: "COMPLIANCE", label: "Compliance" },
	{ value: "QUALITY_OF_SERVICE", label: "Quality of Service" },
];
