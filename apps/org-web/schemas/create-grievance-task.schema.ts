import { z } from "zod";

const TASK_CATEGORY_VALUES = [
	"INVESTIGATION_REQUIRED",
	"DOCUMENTATION_REVIEW",
	"EMPLOYEE_INTERVIEW",
	"CORRECTIVE_ACTION",
	"PERFORMANCE_IMPROVEMENT_PLAN",
	"POLICY_REVIEW",
	"TRAINING_REQUIRED",
	"FOLLOW_UP_MEETING",
] as const;

export const createGrievanceTaskSchema = z
	.object({
		category: z.string(),
		assignTo: z.string().min(1, "Select a user"),
		description: z
			.string()
			.min(1, "Task description is required")
			.max(8000, "Description must be 8000 characters or less")
			.trim(),
	})
	.superRefine((data, ctx) => {
		if (!data.category.trim()) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Select a task category",
				path: ["category"],
			});
			return;
		}
		if (!(TASK_CATEGORY_VALUES as readonly string[]).includes(data.category)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Select a task category",
				path: ["category"],
			});
		}
	});

export type CreateGrievanceTaskFormValues = z.infer<
	typeof createGrievanceTaskSchema
>;
