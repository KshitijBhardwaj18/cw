import { MatchingCriterionKey } from "@repo/shared";
import { z } from "zod";

export const MatchingCriterionItemSchema = z.object({
	matchingCriterionId: z.string(),
	key: z.nativeEnum(MatchingCriterionKey),
	name: z.string(),
	description: z.string().nullable(),
	active: z.boolean(),
	weight: z.number().int().min(0).max(100),
	matchingLogicId: z.string().nullable(),
});

export const MatchingLogicFormSchema = z
	.object({
		criteria: z.array(MatchingCriterionItemSchema),
	})
	.superRefine((data, ctx) => {
		const totalWeight = data.criteria
			.filter((c) => c.active)
			.reduce((sum, c) => sum + c.weight, 0);
		if (totalWeight !== 100) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["criteria"],
				message: "Total weight must equal 100%",
			});
		}
	});

export type MatchingCriterionItemFormValues = z.infer<
	typeof MatchingCriterionItemSchema
>;
export type MatchingLogicFormValues = z.infer<typeof MatchingLogicFormSchema>;
