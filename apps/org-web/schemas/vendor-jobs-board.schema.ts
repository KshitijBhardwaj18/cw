import {
	isAfterOrEqual,
	requiredPhoneSchema,
	zipCodeSchema,
} from "@repo/shared";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

const questionnaireRowSchema = z.object({
	questionId: z.string().uuid(),
	questionText: z.string(),
	value: z.string(),
	scope: z.enum(["occupation", "specialty", "general"]),
});

export const reviewSubmitSchema = z.object({
	firstName: z.string(),
	lastName: z.string(),
	email: z.string().email(),
	phoneNumber: requiredPhoneSchema,
	streetAddress: z.string().min(1, "Street address is required"),
	city: z.string().min(1, "City is required"),
	state: z.string().min(1, "State is required"),
	zipCode: z.string().min(1, "ZIP code is required").and(zipCodeSchema),
	occupationId: z.string().uuid(),
	specialtyIds: z
		.array(z.string().uuid())
		.min(1, "Select at least one specialty"),
	preferredShiftsText: z.string().min(1, "Preferred shifts are required"),
	availableFrom: z.string().optional(),
	isAvailable: z.boolean(),
	questionnaire: z.array(questionnaireRowSchema),
	summaryNote: z.string().max(2000),
	rto: z
		.array(
			z.object({
				startDate: z.string().min(1),
				endDate: z.string().optional(),
				type: z.enum(["single", "range"]),
			}),
		)
		.superRefine((data, ctx) => {
			for (let i = 0; i < data.length; i++) {
				const entry = data[i];
				if (
					entry.type === "range" &&
					entry.startDate &&
					entry.endDate &&
					!isAfterOrEqual(entry.endDate, entry.startDate)
				) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: "End date must be after or equal to start date",
						path: [i, "endDate"],
					});
				}
			}
		}),
	/** Display-only in vendor review; uploads are managed in Document Wallet. */
	complianceItems: z
		.array(
			z.object({
				name: z.string(),
				status: z.enum(["verified", "expired", "missing"]),
				file: z.instanceof(File).optional(),
			}),
		)
		.optional(),
});

export type ReviewSubmitFormValues = z.infer<typeof reviewSubmitSchema>;

// Infers the form type from the configuration for 1:1 type-safety.
const _dummyForm = () =>
	useForm({
		defaultValues: {} as ReviewSubmitFormValues,
		validators: {
			onMount: reviewSubmitSchema,
			onChange: reviewSubmitSchema,
		},
	});

export type ReviewSubmitFormApi = ReturnType<typeof _dummyForm>;
