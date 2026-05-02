import { z } from "zod";

const REQUISITION_TYPE_VALUES = [
	"LONG_TERM_ORDER",
	"PER_DIEM",
	"PERMANENT_ROLE",
	"INTERNAL_FLEX_POOL",
] as const;

export const jobPostingTypeSelectionSchema = z.object({
	type: z.enum(REQUISITION_TYPE_VALUES, {
		required_error: "Requisition type is required",
		invalid_type_error: "Requisition type is required",
	}),
});

export type JobPostingTypeSelectionValues = z.infer<
	typeof jobPostingTypeSelectionSchema
>;
