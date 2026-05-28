import {
	CandidateExperienceBand,
	requiredPhoneSchema,
	ShiftType,
	zipCodeSchema,
} from "@repo/shared";
import { z } from "zod";

export type ShiftTypeValue = ShiftType;

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
	experienceBand: z.nativeEnum(CandidateExperienceBand).nullable().optional(),
	preferredShiftTypes: z.array(z.nativeEnum(ShiftType)),
	willingToRelocate: z.boolean(),
});

export type ProfessionalFormValues = z.infer<
	typeof editProfessionalInformationSchema
>;
