import { z } from "zod";
import type { RequisitionTemplateStatus } from "@/types/requisition-template";

const REQUISITION_STATUS_VALUES: [
	RequisitionTemplateStatus,
	...RequisitionTemplateStatus[],
] = ["DRAFT", "ACTIVE"];

export const requisitionTemplateDetailsSchema = z.object({
	templateName: z
		.string()
		.trim()
		.min(1, "Template name is required")
		.max(200, "Template name must be less than 200 characters"),
	occupationId: z.string().uuid("Occupation is required"),
	specialtyId: z.string().uuid("Specialty is required"),
	departmentId: z.string().uuid("Department is required"),
	unitName: z.string().trim().max(200).optional().nullable(),
	jobDescription: z
		.string()
		.trim()
		.min(1, "Job description is required")
		.max(5000, "Job description must be less than 5000 characters"),
	benefitsPerks: z.array(z.string().trim()),
	status: z.enum(REQUISITION_STATUS_VALUES, {
		required_error: "Status is required",
	}),
});

export type RequisitionTemplateDetailsFormValues = z.infer<
	typeof requisitionTemplateDetailsSchema
>;
