import type {
	OccupationResponseType,
	PaginatedOccupationResponse,
} from "@repo/shared";
import { ApiClient } from "@/lib/api-client";
import type { OccupationFormValues } from "@/schemas/occupation.schema";
import type { PaginatedLinkedOrgOccupationsResponse } from "@/types/organization-occupation";

export class OccupationsService {
	static async getAllOccupations() {
		const res = await ApiClient.get<{
			data: OccupationResponseType[];
		}>("/api/occupations", { all: true });
		return res.data;
	}

	static async getOccupationsPaginated(
		page = 1,
		limit = 10,
		search?: string,
		status?: "ACTIVE" | "INACTIVE",
		organizationId?: string,
	) {
		return ApiClient.get<PaginatedOccupationResponse>("/api/occupations", {
			page,
			limit,
			...(search?.trim() && { search: search.trim() }),
			...(status && { status }),
			...(organizationId && { organizationId }),
		});
	}

	static async createOccupation(data: OccupationFormValues) {
		return ApiClient.post<OccupationResponseType, OccupationFormValues>(
			"/api/occupations",
			data,
		);
	}

	static async updateOccupation(
		id: string,
		data: Partial<OccupationFormValues>,
	) {
		return ApiClient.patch<
			OccupationResponseType,
			Partial<OccupationFormValues>
		>(`/api/occupations/${id}`, data);
	}

	static async deleteOccupation(id: string) {
		return ApiClient.delete(`/api/occupations/${id}`);
	}

	// Org-scoped
	static async getLinkedOccupationsPaginated(
		organizationId: string,
		page = 1,
		limit = 10,
		search?: string,
	) {
		const safePage =
			typeof page === "number" && Number.isFinite(page) && page >= 1
				? Math.trunc(page)
				: 1;
		const safeLimit =
			typeof limit === "number" &&
			Number.isFinite(limit) &&
			limit >= 1 &&
			limit <= 100
				? Math.trunc(limit)
				: 10;
		return ApiClient.get<PaginatedLinkedOrgOccupationsResponse>(
			`/api/occupations/org/${organizationId}`,
			{
				page: safePage,
				limit: safeLimit,
				...(search?.trim() && { search: search.trim() }),
			},
		);
	}

	static async getLinkedOccupationIds(organizationId: string) {
		const res = await ApiClient.get<{ ids: string[] }>(
			`/api/occupations/org/${organizationId}`,
			{ idsOnly: true },
		);
		return res.ids;
	}

	static async replaceOccupationsForOrganization(
		organizationId: string,
		occupationIds: string[],
	) {
		return ApiClient.put(`/api/occupations/org/${organizationId}`, {
			occupationIds,
		});
	}
}
