import {
	CertifiedBusinessClassification,
	DocumentType,
	NoteType,
	OrganizationIndustry,
	optionalPhoneSchema,
	zipCodeSchema,
} from "@repo/shared";
import { z } from "zod";

export const vendorProfileSchema = z.object({
	logoUrl: z.string().optional().default(""),
	name: z.string().min(1, "Vendor name is required"),
	industries: z
		.array(z.nativeEnum(OrganizationIndustry))
		.min(1, "Select at least one industry"),
	certifiedBusinessClassifications: z
		.array(z.nativeEnum(CertifiedBusinessClassification))
		.optional()
		.default([]),
	about: z
		.string()
		.max(1000, "About must be 1000 characters or less")
		.optional()
		.default(""),
	isActive: z.boolean().default(true),
	taxId: z.string().optional().default(""),
	phoneNumber: optionalPhoneSchema.default(""),
	website: z.string().optional().default(""),
	address: z
		.object({
			street: z.string().min(1, "Street is required"),
			city: z.string().min(1, "City is required"),
			state: z.string().min(1, "State is required"),
			zipCode: zipCodeSchema.min(1, "Zip code is required"),
			country: z.string().min(1, "Country is required"),
		})
		.nullable()
		.optional()
		.default(null),
	annualRevenue: z.number().nullable().optional().default(null),
	employeeCount: z.number().int().nullable().optional().default(null),
	createdDate: z.date().default(() => new Date()),
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
