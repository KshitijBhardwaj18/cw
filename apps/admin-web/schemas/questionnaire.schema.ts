import { QuestionType } from "@repo/shared";
import { z } from "zod";
import { QUESTION_TYPE_REQUIRES_OPTIONS } from "@/constants/questionnaire";

const questionFormBaseSchema = z.object({
	questionText: z
		.string()
		.trim()
		.min(1, "Question text is required")
		.max(500, "Question text must be less than 500 characters"),
	type: z.nativeEnum(QuestionType),
	options: z.array(z.string()),
	required: z.boolean(),
	includeInSubmission: z.boolean(),
});

export const questionFormSchema = questionFormBaseSchema.superRefine(
	(data, ctx) => {
		if (QUESTION_TYPE_REQUIRES_OPTIONS.includes(data.type)) {
			const validOptions = data.options.filter((o) => o.trim().length > 0);
			if (validOptions.length === 0) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "At least one option is required for this question type",
					path: ["options"],
				});
			}
		}
	},
);

export type QuestionFormValues = z.infer<typeof questionFormSchema>;

export { questionFormBaseSchema };
