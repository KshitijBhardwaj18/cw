import {
	CandidatePreferredContractLength,
	requiredPhoneSchema,
	zipCodeSchema,
} from "@repo/shared";
import { z } from "zod";

const createAccountBaseSchema = z.object({
	firstName: z.string().trim().min(1, "First name is required"),
	lastName: z.string().trim().min(1, "Last name is required"),
	email: z
		.string()
		.trim()
		.min(1, "Email is required")
		.email("Please enter a valid email address"),
});

export const createAccountSchema = createAccountBaseSchema;

export { createAccountBaseSchema };

export type CreateAccountFormValues = z.infer<typeof createAccountSchema>;

export const contactInformationSchema = z.object({
	phone: requiredPhoneSchema,
	streetAddress: z.string().trim().min(1, "Street address is required"),
	city: z.string().trim().min(1, "City is required"),
	state: z.string().trim().min(1, "State is required"),
	zipCode: zipCodeSchema.min(1, "ZIP code is required"),
});

export type ContactInformationFormValues = z.infer<
	typeof contactInformationSchema
>;

export const professionalDetailsObjectSchema = z.object({
	occupationId: z.string().min(1, "Occupation is required"),
	yearsOfExperience: z
		.number({ invalid_type_error: "Enter a valid number" })
		.min(0, "Must be 0 or more")
		.max(50, "Must be 50 or less"),
	specialtyIds: z.array(z.string()),
	resumeFile: z.union([z.instanceof(File), z.null()]),
	preferredContractLengths: z.array(
		z.nativeEnum(CandidatePreferredContractLength),
	),
});

export const professionalDetailsSchema = professionalDetailsObjectSchema;

export type ProfessionalDetailsFormValues = z.infer<
	typeof professionalDetailsObjectSchema
>;

export const professionalDetailsInviteSchema = professionalDetailsSchema;

export type ProfessionalDetailsInviteFormValues = z.infer<
	typeof professionalDetailsInviteSchema
>;

export const locationPreferencesSchema = z.object({
	locationIds: z
		.array(z.string())
		.min(1, "Select at least one location where you're willing to work"),
});

export type LocationPreferencesFormValues = z.infer<
	typeof locationPreferencesSchema
>;

export const US_STATES = [
	"Alabama",
	"Alaska",
	"Arizona",
	"Arkansas",
	"California",
	"Colorado",
	"Connecticut",
	"Delaware",
	"Florida",
	"Georgia",
	"Hawaii",
	"Idaho",
	"Illinois",
	"Indiana",
	"Iowa",
	"Kansas",
	"Kentucky",
	"Louisiana",
	"Maine",
	"Maryland",
	"Massachusetts",
	"Michigan",
	"Minnesota",
	"Mississippi",
	"Missouri",
	"Montana",
	"Nebraska",
	"Nevada",
	"New Hampshire",
	"New Jersey",
	"New Mexico",
	"New York",
	"North Carolina",
	"North Dakota",
	"Ohio",
	"Oklahoma",
	"Oregon",
	"Pennsylvania",
	"Rhode Island",
	"South Carolina",
	"South Dakota",
	"Tennessee",
	"Texas",
	"Utah",
	"Vermont",
	"Virginia",
	"Washington",
	"West Virginia",
	"Wisconsin",
	"Wyoming",
] as const;
