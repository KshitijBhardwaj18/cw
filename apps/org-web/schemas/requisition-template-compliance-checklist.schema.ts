import { ComplianceChecklistItemPhase } from "@repo/shared";
import { z } from "zod";

const complianceItemUsageTypeSchema = z.nativeEnum(
	ComplianceChecklistItemPhase,
);

/** Per checklist template: compliance item id → usage type (from Edit Usage dialog). */
export const requisitionTemplateComplianceChecklistSchema = z.object({
	complianceChecklistId: z
		.string()
		.min(1, "Please select a compliance checklist"),
	itemUsages: z.record(
		z.string(),
		z.record(z.string(), complianceItemUsageTypeSchema),
	),
});

export type RequisitionTemplateComplianceChecklistFormValues = z.infer<
	typeof requisitionTemplateComplianceChecklistSchema
>;
