import type {
	OrgDepartmentOption,
	OrgLocationOption,
	OrgOccupationOption,
	PaginatedShiftTemplatesResponse,
	ShiftTemplateListItem,
} from "@repo/shared";
import { ApiClient } from "@/lib/api-client";
import type { OrgEnabledSpecialtyOption } from "./onboarding.service";

type OccupationsResponse = {
	data: {
		id: string;
		occupation: { id: string; name: string; acronym: string | null };
		specialties?: {
			id: string;
			specialty: { id: string; name: string; acronym: string | null };
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
			visibilityUnlockDuration: values.visibilityUnlockDuration,
			visibilityUnlockUnit: values.visibilityUnlockUnit,
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
				visibilityUnlockDuration: values.visibilityUnlockDuration,
				visibilityUnlockUnit: values.visibilityUnlockUnit,
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

	static async getSpecialtiesForOrgOccupation(
		organizationOccupationId: string,
	): Promise<OrgEnabledSpecialtyOption[]> {
		return ApiClient.get<OrgEnabledSpecialtyOption[]>(
			`/api/org/occupations/${organizationOccupationId}/specialties`,
		);
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
				specialtyId: s.specialty.id,
				name: s.specialty.name,
				acronym: s.specialty.acronym ?? null,
			})),
		}));
	}

	static async getDepartments(options?: {
		limit?: number;
		organizationOccupationId?: string;
		organizationSpecialtyId?: string;
	}): Promise<OrgDepartmentOption[]> {
		const limit = options?.limit ?? 100;
		const res = await ApiClient.get<PaginatedResponse<OrgDepartmentOption>>(
			`/api/org/departments`,
			{
				limit,
				...(options?.organizationOccupationId
					? { organizationOccupationId: options.organizationOccupationId }
					: {}),
				...(options?.organizationSpecialtyId
					? { organizationSpecialtyId: options.organizationSpecialtyId }
					: {}),
			},
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
