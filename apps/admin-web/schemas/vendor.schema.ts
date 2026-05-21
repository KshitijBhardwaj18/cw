import {
	DocumentType,
	NoteType,
	optionalPhoneSchema,
	zipCodeSchema,
} from "@repo/shared";
import { z } from "zod";

export const vendorAddressSchema = z.object({
	street: z.string().trim().min(1, "Street address is required"),
	city: z.string().trim().min(1, "City is required"),
	state: z.string().trim().min(1, "State is required"),
	zipCode: zipCodeSchema.min(1, "ZIP code is required"),
	country: z.string().trim().optional().default(""),
});

export const vendorAddressPostalValidators = {
	street: vendorAddressSchema.shape.street,
	city: vendorAddressSchema.shape.city,
	state: vendorAddressSchema.shape.state,
	zipCode: vendorAddressSchema.shape.zipCode,
} as const;

export const vendorProfileSchema = z
	.object({
		logoUrl: z.string(),
		name: z.string().min(1, "Vendor name is required"),
		industries: z.array(z.string()).min(1, "Select at least one industry"),
		certifiedBusinessClassifications: z.array(z.string()),
		about: z.string().max(1000, "About must be 1000 characters or less"),
		isActive: z.boolean(),
		internalId: z.string(),
		createdDate: z.string(),
		taxId: z.string(),
		phoneNumber: z.string(),
		website: z.string(),
		addressStreet: z.string().trim(),
		addressCity: z.string().trim(),
		addressState: z.string().trim(),
		addressZipCode: z.string().trim(),
		addressCountry: z.string().trim(),
		annualRevenue: z.number().nullable(),
		employeeCount: z.number().int().nullable(),
	})
	.superRefine((val, ctx) => {
		const street = val.addressStreet?.trim() ?? "";
		const city = val.addressCity?.trim() ?? "";
		const state = val.addressState?.trim() ?? "";
		const zipCode = val.addressZipCode?.trim() ?? "";

		const anyFilled = Boolean(street || city || state || zipCode);
		if (!anyFilled) return;

		const requiredFields = [
			{ path: "addressStreet", label: "Street address", value: street },
			{ path: "addressCity", label: "City", value: city },
			{ path: "addressState", label: "State", value: state },
			{ path: "addressZipCode", label: "ZIP code", value: zipCode },
		] as const;

		for (const f of requiredFields) {
			if (!f.value) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `${f.label} is required when providing an address`,
					path: [f.path],
				});
			}
		}
	});

export type VendorProfileFormValues = z.infer<typeof vendorProfileSchema>;

export const vendorUserSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	title: z.string().min(1, "Title is required"),
	email: z.string().min(1, "Email is required").email("Invalid email address"),
	officePhone: optionalPhoneSchema.default(""),
	mobilePhone: optionalPhoneSchema.default(""),
	status: z.string().default("Active"),
});

export type VendorUserFormValues = z.infer<typeof vendorUserSchema>;

export const vendorDocumentSchema = z.object({
	name: z.string().min(1, "Document name is required"),
	type: z.nativeEnum(DocumentType, {
		errorMap: () => ({ message: "Document type is required" }),
	}),
	url: z.string().min(1, "File upload is required"),
	description: z.string().optional().default(""),
});

export type VendorDocumentFormValues = z.infer<typeof vendorDocumentSchema>;

export const vendorNoteSchema = z.object({
	type: z.nativeEnum(NoteType, {
		errorMap: () => ({ message: "Note type is required" }),
	}),
	notes: z.string().min(1, "Note content is required"),
});

export type VendorNoteFormValues = z.infer<typeof vendorNoteSchema>;
