import type {
	OrgDepartmentOption,
	OrgLocationOption,
	OrgOccupationOption,
	PaginatedShiftTemplatesResponse,
	ShiftTemplateListItem,
} from "@repo/shared";
import { ApiClient } from "@/lib/api-client";

type OccupationsResponse = {
	data: {
		id: string;
		occupation: { id: string; name: string; acronym: string | null };
		specialties?: {
			id: string;
			specialty: { id: string; name: string; acronym: string };
		}[];
	}[];
};

type PaginatedResponse<T> = { data: T[] };

import type {
	ShiftBillingConfigurationFormValues,
	ShiftTemplateFormValues,
} from "@/schemas/shift-template.schema";

export type ShiftTemplatesQuery = {
	search?: string;
	page?: number;
	limit?: number;
};

const SHIFT_TEMPLATES_API_URL = "/api/org/shift-templates";
export class ShiftTemplatesService {
	static async list(query: ShiftTemplatesQuery = {}) {
		return ApiClient.get<PaginatedShiftTemplatesResponse>(
			`${SHIFT_TEMPLATES_API_URL}`,
			query,
		);
	}

	static async findOne(id: string) {
		return ApiClient.get<ShiftTemplateListItem>(
			`${SHIFT_TEMPLATES_API_URL}/${id}`,
		);
	}

	static async create(values: ShiftTemplateFormValues) {
		return ApiClient.post<ShiftTemplateListItem>(`${SHIFT_TEMPLATES_API_URL}`, {
			templateName: values.templateName,
			occupationId: values.occupationId,
			departmentId: values.departmentId,
			locationId: values.locationId,
			shiftType: values.shiftType,
			durationHours: values.durationHours,
			baseRate: values.baseRate,
			limitShiftVisibility: values.limitShiftVisibility,
			visibilityUnlockHours: values.visibilityUnlockHours,
			baseBillRate: values.baseBillRate,
			vendorRateMarkupPercent: values.vendorRateMarkupPercent,
			offerIncentive: values.offerIncentive,
			incentiveByHour: values.incentiveByHour,
			incentiveByShift: values.incentiveByShift,
		});
	}

	static async update(id: string, values: Partial<ShiftTemplateFormValues>) {
		return ApiClient.patch<ShiftTemplateListItem>(
			`${SHIFT_TEMPLATES_API_URL}/${id}`,
			{
				templateName: values.templateName,
				occupationId: values.occupationId,
				departmentId: values.departmentId,
				locationId: values.locationId,
				shiftType: values.shiftType,
				durationHours: values.durationHours,
				baseRate: values.baseRate,
				limitShiftVisibility: values.limitShiftVisibility,
				visibilityUnlockHours: values.visibilityUnlockHours,
				baseBillRate: values.baseBillRate,
				vendorRateMarkupPercent: values.vendorRateMarkupPercent,
				offerIncentive: values.offerIncentive,
				incentiveByHour: values.incentiveByHour,
				incentiveByShift: values.incentiveByShift,
			},
		);
	}

	static async updateBilling(
		id: string,
		values: ShiftBillingConfigurationFormValues,
	) {
		return ApiClient.patch<ShiftTemplateListItem>(
			`${SHIFT_TEMPLATES_API_URL}/${id}/billing`,
			{
				baseBillRate: values.baseBillRate,
				vendorRateMarkupPercent: values.vendorRateMarkupPercent,
				offerIncentive: values.offerIncentive,
				incentiveByHour: values.incentiveByHour,
				incentiveByShift: values.incentiveByShift,
			},
		);
	}

	static async remove(id: string) {
		return ApiClient.delete<void>(`${SHIFT_TEMPLATES_API_URL}/${id}`);
	}

	static async getOccupations(): Promise<OrgOccupationOption[]> {
		const res = await ApiClient.get<OccupationsResponse>(
			`/api/org/occupations`,
			{ idsOnly: false, limit: 100 },
		);
		return res.data.map((row) => ({
			id: row.occupation.id,
			organizationOccupationId: row.id,
			name: row.occupation.name,
			acronym: row.occupation.acronym ?? "",
			organizationSpecialties: (row.specialties ?? []).map((s) => ({
				id: s.id,
				name: s.specialty.name,
			})),
		}));
	}

	static async getDepartments(): Promise<OrgDepartmentOption[]> {
		const res = await ApiClient.get<PaginatedResponse<OrgDepartmentOption>>(
			`/api/org/departments`,
			{ limit: 100 },
		);
		return res.data;
	}

	static async getLocations(): Promise<OrgLocationOption[]> {
		const res = await ApiClient.get<PaginatedResponse<OrgLocationOption>>(
			`/api/org/locations`,
			{ limit: 100 },
		);
		return res.data;
	}
}
