import { TagType } from "@repo/shared";
import { z } from "zod";

export const tagFormBaseSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Tag name is required")
		.max(200, "Name must be less than 200 characters"),
	type: z.nativeEnum(TagType, {
		required_error: "Tag type is required",
	}),
	description: z.string().trim().max(500).optional().nullable(),
	showOnSubmission: z.boolean(),
});

export const tagFormSchema = tagFormBaseSchema;

export type TagFormValues = z.infer<typeof tagFormSchema>;

export type CreateTagPayload = TagFormValues;
