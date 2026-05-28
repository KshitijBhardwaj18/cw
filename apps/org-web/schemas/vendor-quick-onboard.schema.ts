import {
	requiredPhoneSchema,
	VendorCandidateWorkforceType,
} from "@repo/shared";
import { z } from "zod";

export const quickOnboardCandidateSchema = z.object({
	firstName: z.string().min(1, "First name is required").trim(),
	lastName: z.string().min(1, "Last name is required").trim(),
	occupationId: z.string().uuid("Please select an occupation"),
	specialtyId: z.string().uuid("Please select a specialty"),
	email: z.string().email("Please enter a valid email address"),
	phoneNumber: requiredPhoneSchema,
	workforceType: z.nativeEnum(VendorCandidateWorkforceType, {
		required_error: "Workforce type is required",
	}),
});

export type QuickOnboardCandidateFormValues = z.infer<
	typeof quickOnboardCandidateSchema
>;
