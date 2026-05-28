import { OrganizationVendorStatus } from "@repo/shared";
import { z } from "zod";

export const organizationVendorFormSchema = z.object({
	vendorId: z.string().min(1, "Please select a vendor"),
	status: z.nativeEnum(OrganizationVendorStatus, {
		errorMap: () => ({ message: "Status is required" }),
	}),
	startDate: z.string().optional(),
	notes: z.string().optional(),
});

export type OrganizationVendorFormSchemaValues = z.infer<
	typeof organizationVendorFormSchema
>;

export interface CreateOrganizationVendorPayload {
	vendorId: string;
	status: OrganizationVendorStatus;
	startDate?: string;
	notes?: string;
}

export type UpdateOrganizationVendorPayload = Partial<
	Omit<CreateOrganizationVendorPayload, "vendorId">
>;
