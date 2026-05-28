import { MetricType } from "@repo/shared";
import { z } from "zod";

export const metricFormBaseSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Metric name is required")
		.max(200, "Name must be less than 200 characters"),
	type: z.nativeEnum(MetricType, {
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
