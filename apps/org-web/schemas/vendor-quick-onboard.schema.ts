import { CandidateWorkforceType, requiredPhoneSchema } from "@repo/shared";
import { z } from "zod";

const workforceTypeOptions = [
	CandidateWorkforceType.INTERNAL_FULL_TIME,
	CandidateWorkforceType.INTERNAL_PART_TIME,
	CandidateWorkforceType.INTERNAL_PRN,
	CandidateWorkforceType.INTERNAL_FLOAT_POOL,
	CandidateWorkforceType.INTERNAL_VOLUNTEER,
	CandidateWorkforceType.EXTERNAL_1099,
	CandidateWorkforceType.EXTERNAL_EOR,
	CandidateWorkforceType.EXTERNAL_VENDOR_LTO,
	CandidateWorkforceType.EXTERNAL_VENDOR_PER_DIEM,
] as const satisfies readonly CandidateWorkforceType[];

export const quickOnboardCandidateSchema = z.object({
	firstName: z.string().min(1, "First name is required").trim(),
	lastName: z.string().min(1, "Last name is required").trim(),
	occupationId: z.string().uuid("Please select an occupation"),
	specialtyId: z.string().uuid("Please select a specialty"),
	email: z.string().email("Please enter a valid email address"),
	phoneNumber: requiredPhoneSchema,
	workforceType: z.enum(workforceTypeOptions, {
		required_error: "Workforce type is required",
	}),
});

export type QuickOnboardCandidateFormValues = z.infer<
	typeof quickOnboardCandidateSchema
>;
