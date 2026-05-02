import { DepartmentType } from "@repo/shared";
import { z } from "zod";

export const departmentFormSchema = z.object({
	locationId: z.string().uuid("Please select a location"),
	name: z.string().trim().min(1, "Department name is required"),
	departmentType: z.nativeEnum(DepartmentType, {
		errorMap: () => ({ message: "Department type is required" }),
	}),
	costCenter: z.string().trim().optional(),
	organizationOccupationId: z.string().uuid().optional().or(z.literal("")),
	organizationSpecialtyId: z.string().uuid().optional().or(z.literal("")),
	relatedUserIds: z.array(z.string().uuid()).optional(),
});

export type DepartmentFormSchemaValues = z.infer<typeof departmentFormSchema>;

export interface CreateDepartmentPayload {
	locationId: string;
	name: string;
	departmentType: (typeof DepartmentType)[keyof typeof DepartmentType];
	costCenter?: string;
	organizationOccupationId?: string | null;
	organizationSpecialtyId?: string | null;
	relatedUserIds?: string[];
}

export type UpdateDepartmentPayload = Partial<CreateDepartmentPayload>;
