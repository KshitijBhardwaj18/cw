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

export const inviteCandidateSchema = z.object({
	name: z.string().min(1, "Candidate name is required").trim(),
	occupationId: z.string().uuid("Please select an occupation"),
	specialtyIds: z.array(z.string().uuid()),
	email: z.string().email("Please enter a valid email address"),
	phoneNumber: requiredPhoneSchema,
	workforceType: z.enum(workforceTypeOptions, {
		required_error: "Workforce type is required",
	}),
});

export type InviteCandidateFormValues = z.infer<typeof inviteCandidateSchema>;
