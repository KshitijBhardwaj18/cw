import { z } from "zod";

export const logGrievanceSchema = z.object({
	type: z.enum(["BEHAVIORAL", "CLINICAL"]),
	workerId: z.string().min(1, "Select a worker"),
	placementId: z.string(),
	description: z
		.string()
		.min(1, "Description is required")
		.max(8000, "Description must be 8000 characters or less")
		.trim(),
});

export type LogGrievanceFormValues = z.infer<typeof logGrievanceSchema>;
