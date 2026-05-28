import { DelayUnit } from "@repo/shared";
import { z } from "zod";

export const delaySchema = z.object({
	enableRoutingDelay: z.boolean(),
	delayDuration: z.coerce.number().int().min(1, "Duration must be at least 1"),
	delayUnit: z.nativeEnum(DelayUnit),
});

export type DelayFormValues = z.infer<typeof delaySchema>;
