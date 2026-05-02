import { z } from "zod";

export const jobPostingTemplateSelectionSchema = z.object({
	templateId: z.string().min(1, "Template selection is required"),
});

export type JobPostingTemplateSelectionValues = z.infer<
	typeof jobPostingTemplateSelectionSchema
>;
