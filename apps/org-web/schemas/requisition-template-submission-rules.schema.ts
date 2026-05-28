import { WorkflowType } from "@repo/shared";
import { z } from "zod";

export const WHO_CAN_SUBMIT_VALUES = [
	"ALL_VENDORS",
	"SELECTED_VENDORS",
] as const;

export const APPROVER_ROLE_VALUES = [
	"EXECUTIVE",
	"HIRING_MANAGER",
	"OPERATIONS",
	"OPERATIONS_MANAGER",
	"PROGRAM_MANAGER",
	"TECHNICAL_MANAGER",
	"COMPLIANCE_MANAGER",
] as const;

export const requisitionTemplateSubmissionRulesBaseSchema = z.object({
	approvalRequired: z.boolean(),
	approverRole: z.enum(APPROVER_ROLE_VALUES).optional(),
	workflowType: z.nativeEnum(WorkflowType),
	whoCanSubmit: z.enum(WHO_CAN_SUBMIT_VALUES),
	selectedVendorIds: z.array(z.string()),
	internalNotes: z.string().optional(),
});

export const requisitionTemplateSubmissionRulesSchema =
	requisitionTemplateSubmissionRulesBaseSchema.superRefine((data, ctx) => {
		if (data.approvalRequired && !data.approverRole) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Select approver role",
				path: ["approverRole"],
			});
		}
		if (
			data.workflowType !== WorkflowType.CANDIDATE_ONLY &&
			data.whoCanSubmit === "SELECTED_VENDORS" &&
			data.selectedVendorIds.length === 0
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Select at least one vendor",
				path: ["selectedVendorIds"],
			});
		}
	});

export type RequisitionTemplateSubmissionRulesFormValues = z.infer<
	typeof requisitionTemplateSubmissionRulesBaseSchema
>;
