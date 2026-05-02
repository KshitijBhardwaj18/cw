import { z } from "zod";

export const projectFormSchema = z.object({
	name: z
		.string()
		.min(1, "Project name is required")
		.max(100, "Project name must be 100 characters or less")
		.trim(),
	description: z
		.string()
		.max(300, "Description must be 300 characters or less")
		.trim(),
	status: z.enum(["Active", "Inactive"]),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
