import { requiredPhoneSchema, VendorUserRole } from "@repo/shared";
import { z } from "zod";

export const vendorUserRoleSchema = z.nativeEnum(VendorUserRole);

export const addVendorUserSchema = z.object({
	firstName: z
		.string()
		.min(1, "First name is required")
		.max(60, "First name must be 60 characters or less")
		.trim(),
	lastName: z
		.string()
		.min(1, "Last name is required")
		.max(60, "Last name must be 60 characters or less")
		.trim(),
	email: z.string().min(1, "Email is required").email("Enter a valid email"),
	phone: requiredPhoneSchema,
	role: vendorUserRoleSchema,
	department: z.string().uuid("Select a department"),
});

export type AddVendorUserFormValues = z.infer<typeof addVendorUserSchema>;
