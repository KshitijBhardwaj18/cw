import type {
	ComplianceResponseType,
	ComplianceSummaryResponse,
	PaginatedComplianceResponse,
} from "@repo/shared";
import { ApiClient } from "@/lib/api-client";

export class ComplianceService {
	static async getComplianceSummary(search?: string) {
		return ApiClient.get<ComplianceSummaryResponse>("/api/compliance/summary", {
			...(search?.trim() && { search: search.trim() }),
		});
	}

	static async getComplianceItemsPaginated(
		category: string,
		page = 1,
		limit = 10,
		search?: string,
	) {
		return ApiClient.get<PaginatedComplianceResponse>("/api/compliance", {
			category,
			page,
			limit,
			...(search?.trim() && { search: search.trim() }),
		});
	}

	static async getAllComplianceItems() {
		const res =
			await ApiClient.get<PaginatedComplianceResponse>("/api/compliance");
		return res.data;
	}

	static async getAllComplianceItemsPaginated(
		page = 1,
		limit = 10,
		search?: string,
		options?: { status?: "ACTIVE" | "INACTIVE" },
	) {
		return ApiClient.get<PaginatedComplianceResponse>("/api/compliance", {
			page,
			limit,
			...(search?.trim() && { search: search.trim() }),
			...(options?.status && { status: options.status }),
		});
	}

	static async getWalletTemplatePickerItems(
		page = 1,
		limit = 10,
		search?: string,
	) {
		return ApiClient.get<PaginatedComplianceResponse>(
			"/api/compliance/wallet-template-picker",
			{
				page,
				limit,
				...(search?.trim() && { search: search.trim() }),
			},
		);
	}

	static async getComplianceItemsByIds(ids: string[]) {
		if (ids.length === 0)
			return { data: [], total: 0, page: 1, limit: 0, totalPages: 0 };
		return ApiClient.get<PaginatedComplianceResponse>("/api/compliance", {
			ids: ids.join(","),
		});
	}

	static async createComplianceItem(
		formData: FormData,
	): Promise<ComplianceResponseType> {
		return ApiClient.post<ComplianceResponseType, FormData>(
			"/api/compliance",
			formData,
		);
	}

	static async updateComplianceItem(
		id: string,
		formData: FormData,
	): Promise<ComplianceResponseType> {
		return ApiClient.patch<ComplianceResponseType, FormData>(
			`/api/compliance/${id}`,
			formData,
		);
	}

	static async getComplianceFileSignedUrl(
		id: string,
	): Promise<{ signedUrl: string }> {
		return ApiClient.get<{ signedUrl: string }>(
			`/api/compliance/${id}/compliance-file-signed-url`,
		);
	}

	static async deleteComplianceItem(id: string) {
		return ApiClient.delete(`/api/compliance/${id}`);
	}

	static async downloadComplianceItemsCsv(params?: {
		category?: string;
		search?: string;
		status?: "ACTIVE" | "INACTIVE";
	}) {
		return ApiClient.getBlob("/api/compliance/export.csv", {
			...(params?.category && { category: params.category }),
			...(params?.search?.trim() && { search: params.search.trim() }),
			...(params?.status && { status: params.status }),
		});
	}
}
