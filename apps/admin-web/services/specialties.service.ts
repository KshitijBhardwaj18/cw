import type {
	PagePaginatedResponse,
	PaginatedSpecialtyResponse,
	SpecialtyResponseType,
} from "@repo/shared";
import { ApiClient } from "@/lib/api-client";
import type { SpecialtyFormValues } from "@/schemas/specialty.schema";
import type { PaginatedLinkedOrgSpecialtiesResponse } from "@/types/organization-specialty";
import type { OccupationScopedSpecialtyResponse } from "@/types/specialty";

export class SpecialtiesService {
	static async getAllSpecialties() {
		const res =
			await ApiClient.get<PaginatedSpecialtyResponse>("/api/specialties");
		return res.data;
	}

	static async getSpecialtiesPaginated(page = 1, limit = 10, search?: string) {
		return ApiClient.get<PaginatedSpecialtyResponse>("/api/specialties", {
			page,
			limit,
			...(search?.trim() && { search: search.trim() }),
		});
	}

	static async createSpecialty(data: SpecialtyFormValues) {
		return ApiClient.post<SpecialtyResponseType, SpecialtyFormValues>(
			"/api/specialties",
			data,
		);
	}

	static async updateSpecialty(id: string, data: Partial<SpecialtyFormValues>) {
		return ApiClient.patch<SpecialtyResponseType, Partial<SpecialtyFormValues>>(
			`/api/specialties/${id}`,
			data,
		);
	}

	static async deleteSpecialty(id: string) {
		return ApiClient.delete(`/api/specialties/${id}`);
	}

	static async getOrganizationSpecialtiesPaginated(
		organizationId: string,
		page = 1,
		limit = 10,
		search?: string,
	) {
		return ApiClient.get<PaginatedLinkedOrgSpecialtiesResponse>(
			`/api/specialties/org/${organizationId}`,
			{
				page,
				limit,
				...(search?.trim() && { search: search.trim() }),
			},
		);
	}

	// Org occupation scoped
	static async getSpecialtiesForOccupationPaginated(
		occupationId: string,
		page = 1,
		limit = 10,
		search?: string,
		organizationOccupationId?: string,
	) {
		return ApiClient.get<
			PagePaginatedResponse<OccupationScopedSpecialtyResponse>
		>(`/api/specialties/occupation/${occupationId}`, {
			page,
			limit,
			...(search?.trim() && { search: search.trim() }),
			...(organizationOccupationId && { organizationOccupationId }),
		});
	}

	static async replaceSpecialtiesForOrgOccupation(
		organizationId: string,
		orgOccupationId: string,
		specialtyIds: string[],
	) {
		return ApiClient.put(
			`/api/specialties/org/${organizationId}/occupation/${orgOccupationId}`,
			{ specialtyIds },
		);
	}
}
