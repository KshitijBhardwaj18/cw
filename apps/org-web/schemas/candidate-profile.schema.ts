import { requiredPhoneSchema, zipCodeSchema } from "@repo/shared";
import { z } from "zod";

export const editCandidateProfileSchema = z.object({
	fullName: z.string().trim().min(1, "Name is required").max(200),
	phoneNumber: requiredPhoneSchema,
	address: z.string(),
	city: z.string(),
	state: z.string(),
	zipCode: zipCodeSchema,
});

export type EditCandidateProfileFormValues = z.infer<
	typeof editCandidateProfileSchema
>;

export const editProfessionalInformationSchema = z.object({
	occupationId: z.string().uuid("Occupation is required"),
	specialtyIds: z.array(z.string().uuid()),
	locationIds: z.array(z.string().uuid()),
	yearsOfExperience: z.coerce
		.number({ invalid_type_error: "Enter a valid number" })
		.int()
		.min(0)
		.max(50)
		.optional(),
	preferredShiftTypes: z.array(z.string()),
	willingToRelocate: z.boolean(),
});

export type ProfessionalFormValues = z.infer<
	typeof editProfessionalInformationSchema
>;
