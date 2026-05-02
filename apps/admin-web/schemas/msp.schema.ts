import {
	MSPOrganizationType,
	OrganizationIndustry,
	OrganizationTimezone,
	requiredPhoneSchema,
	zipCodeSchema,
} from "@repo/shared";
import { z } from "zod";

const addressSchema = z.object({
	street: z.string().trim().min(1, "Street is required"),
	city: z.string().trim().min(1, "City is required"),
	state: z.string().trim().min(1, "State is required"),
	zipCode: zipCodeSchema.min(1, "Zip/Postal code is required"),
	country: z.string().trim().min(1, "Country is required"),
});

export const CreateMspSchema = z
	.object({
		name: z.string().trim().min(1, "MSP name is required"),
		logo: z.string().trim().optional(),
		phoneNumber: requiredPhoneSchema,
		industry: z.nativeEnum(OrganizationIndustry),
		organizationType: z.nativeEnum(MSPOrganizationType),
		headquarters: addressSchema,
		isBillingSame: z.boolean(),
		billing: addressSchema.optional(),
		timeZone: z.nativeEnum(OrganizationTimezone),
	})
	.refine(
		(data) =>
			data.isBillingSame ||
			(data.billing != null &&
				!!data.billing.street &&
				!!data.billing.city &&
				!!data.billing.state &&
				!!data.billing.zipCode &&
				!!data.billing.country),
		{
			message: "Billing address is required when different from headquarters",
			path: ["billing"],
		},
	);

export type CreateMspPayload = z.infer<typeof CreateMspSchema>;

export const addMspSchemaBase = z.object({
	mspName: z.string().trim().min(1, "MSP name is required"),
	logo: z.string().trim().optional(),
	industry: z.string().min(1, "Industry is required"),
	organizationType: z.string().min(1, "Organization type is required"),
	headquartersStreet: z.string().trim().min(1, "Street is required"),
	headquartersCity: z.string().trim().min(1, "City is required"),
	headquartersState: z.string().trim().min(1, "State is required"),
	headquartersZipCode: zipCodeSchema.min(1, "Zip/Postal code is required"),
	headquartersCountry: z.string().trim().min(1, "Country is required"),
	billingSameAsHeadquarters: z.boolean(),
	billingStreet: z.string().trim().optional(),
	billingCity: z.string().trim().optional(),
	billingState: z.string().trim().optional(),
	billingZipCode: zipCodeSchema.or(z.literal("")).optional(),
	billingCountry: z.string().trim().optional(),
	phoneNumber: requiredPhoneSchema,
	timeZone: z.string().min(1, "Time zone is required"),
	hasMsaDocument: z.boolean(),
	msaFile: z.custom<File | undefined>().optional(),
	agreementRevisionDate: z.string().optional(),
});

export const addMspSchema = addMspSchemaBase
	.refine((data) => data.hasMsaDocument || !!data.msaFile, {
		message: "MSA document is required",
		path: ["msaFile"],
	})
	.refine(
		(data) => {
			if (!data.billingSameAsHeadquarters) {
				return (
					!!data.billingStreet?.trim() &&
					!!data.billingCity?.trim() &&
					!!data.billingState?.trim() &&
					!!data.billingZipCode?.trim() &&
					!!data.billingCountry?.trim()
				);
			}
			return true;
		},
		{
			message:
				"Billing address fields are required when different from headquarters",
			path: ["billingStreet"],
		},
	);

export type AddMspFormValues = z.infer<typeof addMspSchema>;
