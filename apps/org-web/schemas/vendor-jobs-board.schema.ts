import {
	isAfterOrEqual,
	requiredPhoneSchema,
	ShiftType,
	zipCodeSchema,
} from "@repo/shared";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import type { ShiftTypeKey } from "@/constants/shifts";

const questionnaireRowSchema = z.object({
	questionId: z.string().uuid(),
	questionText: z.string(),
	value: z.string(),
	scope: z.enum(["occupation", "specialty", "general"]),
});

/** Same as Prisma `ShiftType` / org shift constants. */
export type VendorJobBoardShiftType = ShiftTypeKey;

export const candidateProfileSchema = z.object({
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
	preferredShiftTypes: z
		.array(z.nativeEnum(ShiftType))
		.min(1, "Select at least one preferred shift type"),
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
});

export const reviewSubmitSchema = candidateProfileSchema.extend({
	complianceItems: z
		.array(
			z.object({
				name: z.string(),
				status: z.enum(["verified", "expired", "missing"]),
				file: z.instanceof(File).optional(),
			}),
		)
		.superRefine((data, ctx) => {
			for (let i = 0; i < data.length; i++) {
				const item = data[i];
				if (item.status !== "verified" && !item.file) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: "File is required",
						path: [i, "file"],
					});
				}
			}
		}),
});

export type ReviewSubmitFormValues = z.infer<typeof reviewSubmitSchema>;

export const reviewSubmitPostalAutosuggestValidators = {
	street: candidateProfileSchema.shape.streetAddress,
	city: candidateProfileSchema.shape.city,
	state: candidateProfileSchema.shape.state,
	zipCode: candidateProfileSchema.shape.zipCode,
} as const;

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
