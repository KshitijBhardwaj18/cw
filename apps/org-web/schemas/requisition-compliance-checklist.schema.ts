import { z } from "zod";

export const checklistTemplateFormSchema = z.object({
	templateName: z
		.string()
		.trim()
		.min(1, "Template name is required")
		.max(200, "Name must be less than 200 characters"),
	description: z
		.string()
		.trim()
		.max(500, "Description must be less than 500 characters")
		.optional()
		.default(""),
});

export type ChecklistTemplateFormValues = z.infer<
	typeof checklistTemplateFormSchema
>;
