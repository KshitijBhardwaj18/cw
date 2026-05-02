import { requiredPhoneSchema, VendorUserRole } from "@repo/shared";
import { z } from "zod";

export const vendorUserRoleSchema = z.nativeEnum(VendorUserRole);

export const addVendorUserSchema = z.object({
	fullName: z
		.string()
		.min(1, "Full name is required")
		.max(120, "Full name must be 120 characters or less")
		.trim(),
	email: z.string().min(1, "Email is required").email("Enter a valid email"),
	phone: requiredPhoneSchema,
	role: vendorUserRoleSchema,
	department: z.string().uuid("Select a department"),
});

export type AddVendorUserFormValues = z.infer<typeof addVendorUserSchema>;
