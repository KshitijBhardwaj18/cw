import type { MspResponseType, PaginatedMspsResponse } from "@repo/shared";
import { ApiClient } from "@/lib/api-client";
import type {
	AddDocumentPayload,
	AddNotePayload,
	VendorDocumentWithUser,
	VendorNoteWithDetails,
} from "@/types/vendor";

export class MspsService {
	static async getMsps(page = 1, limit = 8, search?: string) {
		const params: Record<string, number | string> = { page, limit };
		if (search?.trim()) params.search = search.trim();
		return ApiClient.get<PaginatedMspsResponse>("/api/msps", params);
	}

	static async getMspById(id: string) {
		return ApiClient.get<MspResponseType | null>(`/api/msps/${id}`);
	}

	static async createMsp(formData: FormData) {
		return ApiClient.post<MspResponseType, FormData>("/api/msps", formData);
	}

	static async updateMsp(id: string, formData: FormData) {
		return ApiClient.patch<MspResponseType, FormData>(
			`/api/msps/${id}`,
			formData,
		);
	}

	static async getMsaSignedUrl(mspId: string): Promise<{ signedUrl: string }> {
		return ApiClient.get<{ signedUrl: string }>(
			`/api/msps/${mspId}/msa-signed-url`,
		);
	}

	static async deleteMsp(id: string) {
		return ApiClient.delete(`/api/msps/${id}`);
	}

	static async getMspDocuments(
		mspId: string,
		search?: string,
	): Promise<VendorDocumentWithUser[]> {
		const params: Record<string, string> = {};
		if (search?.trim()) params.search = search.trim();
		return ApiClient.get<VendorDocumentWithUser[]>(
			`/api/msps/${mspId}/documents`,
			params,
		);
	}

	static async addMspDocument(
		mspId: string,
		payload: Omit<AddDocumentPayload, "url">,
		file: File,
	) {
		const formData = new FormData();
		formData.append("name", payload.name);
		formData.append("type", payload.type);
		if (payload.description)
			formData.append("description", payload.description);
		formData.append("document", file);

		return ApiClient.post(`/api/msps/${mspId}/documents`, formData);
	}

	static async getMspNotes(
		mspId: string,
		search?: string,
	): Promise<VendorNoteWithDetails[]> {
		const params: Record<string, string> = {};
		if (search?.trim()) params.search = search.trim();
		return ApiClient.get<VendorNoteWithDetails[]>(
			`/api/msps/${mspId}/notes`,
			params,
		);
	}

	static async addMspNote(mspId: string, payload: AddNotePayload) {
		return ApiClient.post(`/api/msps/${mspId}/notes`, payload);
	}
}
