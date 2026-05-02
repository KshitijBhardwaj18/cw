import { optionalPhoneSchema, UserRole, UserStatus } from "@repo/shared";
import { z } from "zod";

export const userFormSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	title: z.string().min(1, "Job title is required"),
	email: z.string().email("Enter a valid email"),
	officePhone: optionalPhoneSchema,
	phoneNumber: optionalPhoneSchema,
	mspId: z.string().nullable().optional(),
	role: z.nativeEnum(UserRole, { required_error: "Role is required" }),
	status: z.nativeEnum(UserStatus, { required_error: "Status is required" }),
});

export type UserFormValues = z.infer<typeof userFormSchema>;
