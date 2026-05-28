import { DelayUnit, ShiftType } from "@repo/shared";
import { z } from "zod";

const shiftTypeEnum = z.nativeEnum(ShiftType, {
	required_error: "Shift type is required",
});

export const shiftTemplateFormSchema = z
	.object({
		templateName: z
			.string()
			.trim()
			.min(1, "Template name is required")
			.max(200, "Name must be less than 200 characters"),
		occupationId: z.string().min(1, "Role is required"),
		departmentId: z.string().min(1, "Department is required"),
		locationId: z.string().min(1, "Location is required"),
		shiftType: shiftTypeEnum,
		durationHours: z.coerce
			.number()
			.min(0.5, "Duration must be at least 0.5 hours")
			.max(24, "Duration must be at most 24 hours"),
		baseRate: z.coerce.number().min(0, "Base rate must be 0 or greater"),
		limitShiftVisibility: z.boolean(),
		visibilityUnlockDuration: z.coerce.number().min(0).optional(),
		visibilityUnlockUnit: z.nativeEnum(DelayUnit).optional(),
		baseBillRate: z.coerce.number().min(0).optional(),
		vendorRateMarkupPercent: z.coerce.number().min(0).optional(),
		offerIncentive: z.boolean(),
		incentiveByHour: z.coerce.number().min(0).optional(),
		incentiveByShift: z.coerce.number().min(0).optional(),
	})
	.superRefine((data, ctx) => {
		if (!data.limitShiftVisibility) return;
		if (
			data.visibilityUnlockDuration === undefined ||
			data.visibilityUnlockDuration < 1
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["visibilityUnlockDuration"],
				message: "Duration must be at least 1 when visibility is limited",
			});
		}
		if (!data.visibilityUnlockUnit) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["visibilityUnlockUnit"],
				message: "Unit is required when visibility is limited",
			});
		}
	});

export type ShiftTemplateFormValues = z.infer<typeof shiftTemplateFormSchema>;

export const shiftBillingConfigurationFormSchema = z.object({
	baseBillRate: z.coerce.number().min(0, "Base bill rate is required"),
	vendorRateMarkupPercent: z.coerce
		.number()
		.min(0, "Vendor rate markup is required"),
	offerIncentive: z.boolean(),
	incentiveByHour: z.coerce.number().min(0).optional(),
	incentiveByShift: z.coerce.number().min(0).optional(),
});

export type ShiftBillingConfigurationFormValues = z.infer<
	typeof shiftBillingConfigurationFormSchema
>;
