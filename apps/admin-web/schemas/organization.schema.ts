import type {
	LocationType,
	OrganizationIndustry,
	OrganizationTimezone,
	OrganizationType,
} from "@repo/shared";
import {
	MemberRole,
	optionalPhoneSchema,
	requiredPhoneSchema,
	zipCodeSchema,
} from "@repo/shared";
import { z } from "zod";
import { userFormSchema } from "./user.schema";

export const locationSchemaBase = z.object({
	locationName: z.string().trim().min(1, "Location name is required"),
	address: z.string().trim().min(1, "Address is required"),
	city: z.string().trim().min(1, "City is required"),
	state: z.string().trim().min(1, "State is required"),
	zipCode: zipCodeSchema.min(1, "Zip code is required"),
	locationType: z.string().min(1, "Location type is required"),
	phone: optionalPhoneSchema,
	email: z.union([z.string().email("Invalid email"), z.literal("")]).optional(),
	costCenter: z.string().trim().optional(),
});

const locationSchema = locationSchemaBase;

/** Schema for add/edit location dialog (uses `name` for API) */
export const locationFormSchema = z.object({
	name: z.string().trim().min(1, "Location name is required"),
	address: z.string().trim().min(1, "Address is required"),
	city: z.string().trim().min(1, "City is required"),
	state: z.string().trim().min(1, "State is required"),
	zipCode: zipCodeSchema.min(1, "Zip code is required"),
	locationType: z.string().min(1, "Location type is required"),
	phone: optionalPhoneSchema,
	email: z.union([z.string().email("Invalid email"), z.literal("")]).optional(),
	costCenter: z.string().trim().optional(),
});

export type LocationFormSchemaValues = z.infer<typeof locationFormSchema>;

export const createOrganizationSchema = z.object({
	organizationName: z.string().trim().min(1, "Organization name is required"),
	email: z.string().trim().min(1, "Email is required").email("Invalid email"),
	phone: requiredPhoneSchema,
	industry: z.string().min(1, "Industry is required"),
	organizationType: z.string().min(1, "Organization type is required"),
	timeZone: z.string().min(1, "Timezone is required"),
	website: z.string().trim().url("Invalid URL").optional().or(z.literal("")),
	agreementRenewalDate: z.string().optional(),
	description: z.string().optional(),
	locations: z
		.array(locationSchema)
		.min(1, "At least one valid location is required"),
});

export type LocationFormValues = z.infer<typeof locationSchema>;

/** API payload for creating a location (uses `name` not `locationName`) */
export interface CreateLocationPayload {
	name: string;
	address: string;
	city: string;
	state: string;
	zipCode: string;
	locationType: (typeof LocationType)[keyof typeof LocationType];
	phone?: string;
	email?: string;
	costCenter?: string;
	photoUrl?: string;
}

/** API payload for updating a location (all optional) */
export type UpdateLocationPayload = Partial<CreateLocationPayload>;

export const addOrganizationSchemaBase = createOrganizationSchema;

export const addOrganizationSchema = addOrganizationSchemaBase;

export type AddOrganizationFormValues = z.infer<typeof addOrganizationSchema>;

export const enrollOrgUserSchema = z.object({
	firstName: userFormSchema.shape.firstName,
	lastName: userFormSchema.shape.lastName,
	title: userFormSchema.shape.title,
	email: userFormSchema.shape.email,
	officePhone: userFormSchema.shape.officePhone,
	phoneNumber: userFormSchema.shape.phoneNumber,
	role: z.nativeEnum(MemberRole, {
		errorMap: () => ({ message: "Role is required" }),
	}),
});

export type EnrollOrgUserFormValues = z.infer<typeof enrollOrgUserSchema>;

/** Schema for updating organization (all fields optional) */
export const updateOrganizationSchemaBase = z.object({
	name: z.string().trim().min(1, "Organization name is required").optional(),
	email: z
		.string()
		.trim()
		.min(1, "Email is required")
		.email("Invalid email")
		.optional(),
	phone: optionalPhoneSchema,
	industry: z.string().min(1, "Industry is required").optional(),
	organizationType: z
		.string()
		.min(1, "Organization type is required")
		.optional(),
	timeZone: z.string().min(1, "Timezone is required").optional(),
	website: z.string().trim().url("Invalid URL").optional().or(z.literal("")),
	agreementRenewalDate: z.string().optional(),
	description: z.string().optional(),
	isActive: z.boolean().optional(),
	expectedAnnualSpend: z.number().optional().nullable(),
});

export type UpdateOrganizationFormValues = z.infer<
	typeof updateOrganizationSchemaBase
>;

/** API payload shape for create organization */
export interface CreateOrganizationPayload {
	name: string;
	email: string;
	phone: string;
	industry: (typeof OrganizationIndustry)[keyof typeof OrganizationIndustry];
	organizationType: (typeof OrganizationType)[keyof typeof OrganizationType];
	timeZone: (typeof OrganizationTimezone)[keyof typeof OrganizationTimezone];
	website?: string;
	agreementRenewalDate?: string;
	description?: string;
	locations: {
		name: string;
		address: string;
		city: string;
		state: string;
		zipCode: string;
		locationType: (typeof LocationType)[keyof typeof LocationType];
		phone?: string;
		email?: string;
		costCenter?: string;
	}[];
}

export type UpdateOrganizationPayload = Partial<
	CreateOrganizationPayload & {
		isActive: boolean;
		expectedAnnualSpend: number | null;
	}
>;
