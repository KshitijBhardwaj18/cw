import { OccupationStatus, OrganizationIndustry } from "@repo/shared";
import { z } from "zod";

export const OccupationFormSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Name is required")
		.max(100, "Name must be less than 100 characters"),
	code: z
		.string()
		.trim()
		.min(1, "Code is required")
		.max(50, "Code must be less than 50 characters"),
	industry: z.nativeEnum(OrganizationIndustry).optional().nullable(),
	acronym: z
		.string()
		.trim()
		.min(1, "Acronym is required")
		.max(20, "Acronym must be less than 20 characters"),
	description: z
		.string()
		.trim()
		.max(500, "Description must be less than 500 characters")
		.optional()
		.nullable(),
	status: z.nativeEnum(OccupationStatus),
	hasSpecialty: z.boolean(),
	specialtyIds: z.array(z.string().uuid()).optional(),
});

export type OccupationFormValues = z.infer<typeof OccupationFormSchema>;
