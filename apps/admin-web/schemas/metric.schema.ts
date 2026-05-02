import type { MetricType } from "@repo/db";
import { z } from "zod";
import { METRIC_TYPE_OPTIONS } from "@/constants/metrics";

const METRIC_TYPE_VALUES = METRIC_TYPE_OPTIONS.map((o) => o.value) as [
	MetricType,
	...MetricType[],
];

export const metricFormBaseSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Metric name is required")
		.max(200, "Name must be less than 200 characters"),
	type: z.enum(METRIC_TYPE_VALUES, {
		required_error: "Metric type is required",
	}),
	formula: z
		.string()
		.trim()
		.min(1, "Formula is required")
		.max(500, "Formula must be less than 500 characters"),
	status: z.boolean(),
});

export const metricFormSchema = metricFormBaseSchema;

export type MetricFormValues = z.infer<typeof metricFormSchema>;
