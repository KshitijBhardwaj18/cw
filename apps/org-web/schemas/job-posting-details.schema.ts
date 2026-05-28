import { InterviewType, ShiftType } from "@repo/shared";
import { z } from "zod";

/**
 * Today's calendar date in `YYYY-MM-DD` form, computed from local time.
 * Used to reject past start/end dates without timezone games. Picker emits
 * local calendar date strings, so we compare strings directly.
 */
export function todayIsoDate(): string {
	const d = new Date();
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
}

/**
 * Per-field schema (used by `.shape.<field>` for per-field validators on
 * individual inputs). Cross-field rules live on `jobPostingDetailsSchema`
 * below, which wraps this with `.superRefine` for whole-form validation.
 */
export const jobPostingDetailsFieldsSchema = z.object({
	requisitionName: z
		.string()
		.trim()
		.min(1, "Requisition name is required")
		.max(200, "Requisition name must be less than 200 characters"),
	location: z.string().uuid("Select a location"),
	department: z.string().uuid("Select a department"),
	unitName: z.string().trim().max(200).optional().nullable(),
	occupation: z.string().uuid("Select an occupation"),
	specialty: z.array(z.string().uuid()).max(50),
	shiftType: z.nativeEnum(ShiftType, {
		required_error: "Shift type is required",
	}),
	startDate: z
		.string()
		.min(1, "Start date is required")
		.refine((v) => v >= todayIsoDate(), "Start date cannot be in the past"),
	endDate: z.string().optional().nullable(),
	lengthWeeks: z.number().int().min(1, "Length must be at least 1 week"),
	startTime: z.string().min(1, "Start time is required"),
	endTime: z.string().min(1, "End time is required"),
	shiftHours: z.number().min(0.5).max(24),
	shiftsPerWeek: z.number().int().min(1).max(7),
	hoursPerWeek: z.number().min(0).max(168),
	billRate: z.number().int().min(1),
	numberOfPositions: z
		.number()
		.int("Open positions must be a whole number")
		.min(0, "Open positions cannot be negative"),
	incentiveType: z.string().optional(),
	incentiveAmount: z.number().int().min(0).optional().nullable(),
	interviewRequired: z.nativeEnum(InterviewType).optional().nullable(),
	hiringManagerId: z.string().min(1, "Hiring manager is required"),
	description: z
		.string()
		.trim()
		.min(1, "Description is required")
		.max(5000, "Description must be less than 5000 characters"),
	benefitsPerks: z.array(z.string().trim()),
	complianceTemplateId: z.string().min(1, "Compliance checklist is required"),
});

export const jobPostingDetailsSchema =
	jobPostingDetailsFieldsSchema.superRefine((data, ctx) => {
		if (data.endDate && data.endDate < data.startDate) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "End date must be on or after start date",
				path: ["endDate"],
			});
		}

		const now = new Date();
		const currentTime = now.toTimeString().slice(0, 5);
		if (data.startDate === todayIsoDate() && data.startTime < currentTime) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Start time must be in the future for today's start date",
				path: ["startTime"],
			});
		}
	});

export type JobPostingDetailsValues = z.infer<typeof jobPostingDetailsSchema>;
