import { z } from "zod";

export const SUPPORT_CATEGORY_VALUES = [
	"APPLICATION_QUESTIONS",
	"DOCUMENT_UPLOAD",
	"TIMECARD_ISSUES",
	"PAYMENT_QUESTIONS",
	"TECHNICAL_SUPPORT",
	"OTHER",
] as const;

export type SupportCategoryValue = (typeof SUPPORT_CATEGORY_VALUES)[number];

export const SUPPORT_CATEGORY_OPTIONS: readonly {
	value: SupportCategoryValue;
	label: string;
}[] = [
	{ value: "APPLICATION_QUESTIONS", label: "Application Questions" },
	{ value: "DOCUMENT_UPLOAD", label: "Document Upload" },
	{ value: "TIMECARD_ISSUES", label: "Timecard Issues" },
	{ value: "PAYMENT_QUESTIONS", label: "Payment Questions" },
	{ value: "TECHNICAL_SUPPORT", label: "Technical Support" },
	{ value: "OTHER", label: "Other" },
] as const;

export const supportRequestSchema = z.object({
	category: z
		.string()
		.min(1, "Please select a category")
		.refine((v) => (SUPPORT_CATEGORY_VALUES as readonly string[]).includes(v), {
			message: "Please select a category",
		}),
	subject: z
		.string()
		.min(1, "Subject is required")
		.max(200, "Subject must be 200 characters or less")
		.trim(),
	message: z
		.string()
		.min(1, "Message is required")
		.max(5000, "Message must be 5000 characters or less")
		.trim(),
});

export type SupportRequestFormValues = z.infer<typeof supportRequestSchema>;
