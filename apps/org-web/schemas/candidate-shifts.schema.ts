import { z } from "zod";

const shiftTimecardSegmentSchema = z.object({
	workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	isOvertime: z.boolean(),
	start: z.string(),
	end: z.string(),
	breakMin: z
		.number()
		.int()
		.min(0)
		.max(24 * 60),
});

export const submitShiftTimecardSchema = z.object({
	entries: z.array(shiftTimecardSegmentSchema).min(1),
	notes: z.string().optional(),
	submit: z.boolean().default(false),
});

export type SubmitShiftTimecardFormValues = z.infer<
	typeof submitShiftTimecardSchema
>;
