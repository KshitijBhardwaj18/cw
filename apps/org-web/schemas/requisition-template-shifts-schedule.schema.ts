import { z } from "zod";

const REQUISITION_TEMPLATE_SHIFT_TYPE_VALUES = [
	"DAYS",
	"EVENINGS",
	"NIGHTS",
	"ROTATING",
	"WEEKENDS_ONLY",
] as const;

export const requisitionTemplateShiftsScheduleSchema = z.object({
	startDate: z.string().min(1, "Start date is required"),
	lengthWeeks: z
		.number({ required_error: "Length (weeks) is required" })
		.int("Must be a whole number")
		.min(1, "Length must be at least 1 week"),
	startTime: z.string().min(1, "Start time is required"),
	endTime: z.string().min(1, "End time is required"),
	shiftType: z.enum(REQUISITION_TEMPLATE_SHIFT_TYPE_VALUES, {
		required_error: "Shift type is required",
		invalid_type_error: "Shift type is required",
	}),
	shiftHours: z
		.number({ required_error: "Shift hours is required" })
		.min(0.5, "Shift hours must be at least 0.5")
		.max(24, "Shift hours cannot exceed 24"),
	shiftsPerWeek: z
		.number({ required_error: "Shifts per week is required" })
		.int("Must be a whole number")
		.min(1, "Shifts per week must be at least 1")
		.max(7, "Shifts per week cannot exceed 7"),
	hoursPerWeek: z
		.number()
		.min(0, "Hours per week cannot be negative")
		.max(168, "Hours per week cannot exceed 168")
		.optional()
		.nullable(),
});

export type RequisitionTemplateShiftsScheduleFormValues = z.infer<
	typeof requisitionTemplateShiftsScheduleSchema
>;
