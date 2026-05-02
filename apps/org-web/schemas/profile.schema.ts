import { requiredPhoneSchema } from "@repo/shared";
import { z } from "zod";

export const editProfileSchema = z.object({
	name: z.string().trim().min(1, "Full name is required"),
	phoneNumber: requiredPhoneSchema,
	officePhone: requiredPhoneSchema,
	timeZone: z.string(),
});

export type EditProfileFormValues = z.infer<typeof editProfileSchema>;
