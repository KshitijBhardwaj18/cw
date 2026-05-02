import { z } from "zod";

const SHIFT_TYPE_VALUES = [
	"DAYS",
	"EVENINGS",
	"NIGHTS",
	"ROTATING",
	"WEEKENDS_ONLY",
] as const;

const INTERVIEW_TYPE_VALUES = [
	"NO_INTERVIEW",
	"CLIENT_INTERVIEW",
	"INTERNAL_INTERVIEW",
] as const;

export const jobPostingDetailsSchema = z.object({
	requisitionName: z
		.string()
		.trim()
		.min(1, "Requisition name is required")
		.max(200, "Requisition name must be less than 200 characters"),
	location: z.string().uuid("Select a location"),
	department: z.string().uuid("Select a department"),
	unitName: z.string().trim().max(200).optional().nullable(),
	occupation: z.string().uuid("Select an occupation"),
	specialty: z.string(),
	shiftType: z.enum(SHIFT_TYPE_VALUES, {
		required_error: "Shift type is required",
	}),
	startDate: z.string().min(1, "Start date is required"),
	endDate: z.string().optional().nullable(),
	lengthWeeks: z.number().int().min(1, "Length must be at least 1 week"),
	startTime: z.string().min(1, "Start time is required"),
	endTime: z.string().min(1, "End time is required"),
	shiftHours: z.number().min(0.5).max(24),
	shiftsPerWeek: z.number().int().min(1).max(7),
	hoursPerWeek: z.number().min(0).max(168),
	billRate: z.number().int().min(1),
	numberOfPositions: z.number().int().min(1),
	incentiveType: z.string().optional(),
	incentiveAmount: z.number().int().min(0).optional().nullable(),
	interviewRequired: z.enum(INTERVIEW_TYPE_VALUES).optional().nullable(),
	hiringManagerId: z.string().min(1, "Hiring manager is required"),
	description: z
		.string()
		.trim()
		.min(1, "Description is required")
		.max(5000, "Description must be less than 5000 characters"),
	benefitsPerks: z.array(z.string().trim()),
	complianceTemplateId: z.string().min(1, "Compliance checklist is required"),
});

export type JobPostingDetailsValues = z.infer<typeof jobPostingDetailsSchema>;
