import { optionalPhoneSchema, UserStatus, VendorUserRole } from "@repo/shared";
import { z } from "zod";

export const vendorUserEditFormSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	title: z.string().min(1, "Job title is required"),
	officePhone: optionalPhoneSchema,
	phoneNumber: optionalPhoneSchema,
	role: z.nativeEnum(VendorUserRole, { required_error: "Role is required" }),
	status: z.nativeEnum(UserStatus, { required_error: "Status is required" }),
});

export type VendorUserEditFormValues = z.infer<typeof vendorUserEditFormSchema>;
