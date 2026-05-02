import { SpecialtyStatus } from "@repo/shared";
import { z } from "zod";

export const SpecialtyFormSchema = z.object({
	acronym: z
		.string()
		.trim()
		.min(1, "Acronym is required")
		.max(20, "Acronym must be less than 20 characters"),
	name: z
		.string()
		.trim()
		.min(1, "Name is required")
		.max(100, "Name must be less than 100 characters"),
	group: z
		.string()
		.trim()
		.max(100, "Group must be less than 100 characters")
		.optional()
		.nullable(),
	description: z
		.string()
		.trim()
		.max(500, "Description must be less than 500 characters")
		.optional()
		.nullable(),
	status: z.nativeEnum(SpecialtyStatus),
	occupationIds: z
		.array(z.string().uuid())
		.min(1, "At least one occupation is required"),
});

export type SpecialtyFormValues = z.infer<typeof SpecialtyFormSchema>;
