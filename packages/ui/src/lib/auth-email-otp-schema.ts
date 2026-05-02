import { z } from "zod";

export const emailSchema = z.object({
	email: z
		.string()
		.trim()
		.min(1, "Email is required")
		.email("Please enter a valid email address"),
});

export type EmailFormValues = z.infer<typeof emailSchema>;

export const otpSchema = z.object({
	otp: z.string().length(6, "OTP must be 6 digits"),
});

export type OTPFormValues = z.infer<typeof otpSchema>;
