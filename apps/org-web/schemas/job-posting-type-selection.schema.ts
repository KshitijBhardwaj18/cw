import { RequisitionType } from "@repo/shared";
import { z } from "zod";

export const jobPostingTypeSelectionSchema = z.object({
	type: z.nativeEnum(RequisitionType, {
		required_error: "Requisition type is required",
		invalid_type_error: "Requisition type is required",
	}),
});

export type JobPostingTypeSelectionValues = z.infer<
	typeof jobPostingTypeSelectionSchema
>;
