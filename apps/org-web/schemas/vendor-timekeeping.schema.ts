import { z } from "zod";

const timeRegex = /^(0?[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

export const vendorTimekeepingSchema = z.object({
	startTime: z.string().regex(timeRegex, "Invalid time format (HH:mm)"),
	endTime: z.string().regex(timeRegex, "Invalid time format (HH:mm)"),
	payCodeId: z.string().uuid("Select a valid pay code").nullable().optional(),
	note: z
		.string()
		.max(500, "Note must be under 500 characters")
		.optional()
		.nullable(),
});

export type VendorTimekeepingFormValues = z.infer<
	typeof vendorTimekeepingSchema
>;
