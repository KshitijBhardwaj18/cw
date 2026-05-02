import { z } from "zod";

export const CONDITION_OPTIONS = [
	{ value: "EQUALS", label: "Equals" },
	{ value: "CONTAINS", label: "Contains" },
	{ value: "LESS_THAN", label: "Less than" },
	{ value: "GREATER_THAN", label: "Greater than" },
	{ value: "NOT_EQUALS", label: "Doesn't equal" },
] as const;

export const CATEGORY_OPTIONS = [
	{ value: "Nursing", label: "Nursing" },
	{ value: "ICU", label: "ICU" },
	{ value: "Credentials", label: "Credentials" },
] as const;

const taggingRuleFormBaseSchema = z.object({
	ruleName: z.string().min(1, "Rule name is required"),
	questionSourceType: z.enum(["OCCUPATION", "SPECIALTY"]),
	organizationOccupationId: z.string().optional(),
	organizationSpecialtyId: z.string().optional(),
	questionId: z.string().min(1, "Trigger question is required"),
	condition: z.enum([
		"EQUALS",
		"CONTAINS",
		"LESS_THAN",
		"GREATER_THAN",
		"NOT_EQUALS",
	]),
	triggerValue: z.string().min(1, "Trigger value is required"),
	tagId: z.string().min(1, "Tag to apply is required"),
	category: z.string().min(1, "Category is required"),
	showOnSubmission: z.boolean(),
});

export const taggingRuleFormSchema = taggingRuleFormBaseSchema.superRefine(
	(data, ctx) => {
		if (data.questionSourceType === "OCCUPATION") {
			if (!data.organizationOccupationId) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Occupation is required",
					path: ["organizationOccupationId"],
				});
			}
		} else {
			if (!data.organizationSpecialtyId) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Specialty is required",
					path: ["organizationSpecialtyId"],
				});
			}
		}
	},
);

export { taggingRuleFormBaseSchema };

export type TaggingRuleFormValues = z.infer<typeof taggingRuleFormSchema>;
