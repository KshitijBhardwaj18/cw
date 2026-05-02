import type { TagType } from "@repo/db";
import { z } from "zod";
import { TAG_TYPE_OPTIONS } from "@/constants/tags";

const TAG_TYPE_VALUES = TAG_TYPE_OPTIONS.map((o) => o.value) as [
	TagType,
	...TagType[],
];

export const tagFormBaseSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Tag name is required")
		.max(200, "Name must be less than 200 characters"),
	type: z.enum(TAG_TYPE_VALUES, {
		required_error: "Tag type is required",
	}),
	description: z.string().trim().max(500).optional().nullable(),
	showOnSubmission: z.boolean(),
});

export const tagFormSchema = tagFormBaseSchema;

export type TagFormValues = z.infer<typeof tagFormSchema>;

export type CreateTagPayload = TagFormValues;
