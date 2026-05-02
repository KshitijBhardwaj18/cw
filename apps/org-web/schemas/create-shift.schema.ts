import { z } from "zod";

export const createShiftSchema = z.object({
	date: z.string().min(1, "Date is required"),
	startTime: z.string().min(1, "Start time is required"),
	endTime: z.string().min(1, "End time is required"),
	occupation: z.string().min(1, "Occupation is required"),
	specialtyId: z.string().uuid().optional().or(z.literal("")),
	shiftRatePerHour: z.coerce.number().min(0, "Shift rate must be 0 or greater"),
	vendorRatePerHour: z.coerce
		.number()
		.min(0, "Vendor rate must be 0 or greater"),
	shiftType: z.string().min(1, "Shift type is required"),
	totalShiftHours: z.coerce
		.number()
		.min(1, "Total shift hours must be at least 1"),
});

export type CreateShiftFormValues = z.infer<typeof createShiftSchema>;
