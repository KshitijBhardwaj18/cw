import { InterviewType } from "@repo/shared";
import { z } from "zod";

export const requisitionTemplateCompensationSchema = z.object({
	billRate: z
		.number({ required_error: "Bill rate is required" })
		.int("Bill rate must be a whole number")
		.min(1, "Bill rate must be at least 1"),
	numberOfPositions: z
		.number({ required_error: "Number of positions is required" })
		.int("Must be a whole number")
		.min(1, "Number of positions must be at least 1"),
	incentiveType: z.string().optional(),
	incentiveAmount: z
		.number()
		.int("Incentive amount must be a whole number")
		.min(0, "Incentive amount cannot be negative")
		.optional()
		.nullable(),
	interviewRequired: z.nativeEnum(InterviewType).optional().nullable(),
	hiringManagerId: z.string().optional().nullable(),
});

export type RequisitionTemplateCompensationFormValues = z.infer<
	typeof requisitionTemplateCompensationSchema
>;
