import { MetricType } from "@repo/shared";

export const METRIC_TYPE_OPTIONS: { value: MetricType; label: string }[] = [
	{ value: MetricType.RECRUITMENT_EFFICIENCY, label: "Recruitment Efficiency" },
	{ value: MetricType.COMPLIANCE, label: "Compliance" },
	{ value: MetricType.QUALITY_OF_SERVICE, label: "Quality of Service" },
];
