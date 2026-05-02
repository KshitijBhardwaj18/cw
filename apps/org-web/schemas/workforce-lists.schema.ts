import { z } from "zod";

export const createWorkforceListSchema = z.object({
	name: z
		.string()
		.min(1, "List name is required")
		.max(80, "List name must be 80 characters or less")
		.trim(),
	description: z
		.string()
		.max(240, "Description must be 240 characters or less")
		.trim(),
});

export const bulkTagSchema = z.object({
	tagName: z
		.string()
		.min(1, "Tag name is required")
		.max(40, "Tag name must be 40 characters or less")
		.trim(),
});

export type CreateWorkforceListFormValues = z.infer<
	typeof createWorkforceListSchema
>;
export type BulkTagFormValues = z.infer<typeof bulkTagSchema>;
