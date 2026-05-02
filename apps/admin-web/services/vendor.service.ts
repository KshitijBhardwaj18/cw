import type { Occupation } from "@repo/db";
import type { PagePaginatedResponse } from "@repo/shared";
import { ApiClient } from "@/lib/api-client";
import type {
	AddDocumentPayload,
	AddNotePayload,
	AddVendorUserPayload,
	CreateVendorPayload,
	SetOccupationsPayload,
	UpdateVendorPayload,
	UpdateVendorUserPayload,
	Vendor,
	VendorDetail,
	VendorDocumentWithUser,
	VendorNoteWithDetails,
} from "@/types/vendor";

export class VendorService {
	static async create(payload: CreateVendorPayload, logoFile?: File) {
		const formData = new FormData();
		formData.append("data", JSON.stringify(payload));
		if (logoFile) formData.append("logo", logoFile);
		return ApiClient.post<Vendor>("/api/vendors", formData);
	}

	static async update(
		id: string,
		payload: UpdateVendorPayload,
		logoFile?: File,
	) {
		const formData = new FormData();
		formData.append("data", JSON.stringify(payload));
		if (logoFile) formData.append("logo", logoFile);
		return ApiClient.patch<Vendor>(`/api/vendors/${id}`, formData);
	}

	static async delete(id: string) {
		return ApiClient.delete(`/api/vendors/${id}`);
	}

	static async getAll(params?: {
		page?: number;
		limit?: number;
		search?: string;
	}) {
		const filtered = params
			? Object.fromEntries(
					Object.entries(params).filter(
						([, v]) => v !== undefined && v !== null && v !== "",
					),
				)
			: undefined;
		return ApiClient.get<PagePaginatedResponse<Vendor>>(
			"/api/vendors",
			filtered,
		);
	}

	static async getById(id: string) {
		return ApiClient.get<VendorDetail>(`/api/vendors/${id}`);
	}

	static async getVendorUsers(vendorId: string, search?: string) {
		const params = search?.trim() ? { search: search.trim() } : undefined;
		return ApiClient.get<VendorDetail["vendorUsers"]>(
			`/api/vendors/${vendorId}/users`,
			params,
		);
	}

	static async getVendorDocuments(
		vendorId: string,
		filters?: {
			search?: string;
			type?: string;
			dateFrom?: string;
			dateTo?: string;
		},
	) {
		const params: Record<string, string> = { vendorId };
		if (filters?.search?.trim()) params.search = filters.search.trim();
		if (filters?.type) params.type = filters.type;
		if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
		if (filters?.dateTo) params.dateTo = filters.dateTo;
		return ApiClient.get<VendorDocumentWithUser[]>("/api/documents", params);
	}

	static async setOccupations(
		vendorId: string,
		payload: SetOccupationsPayload,
	) {
		return ApiClient.post(`/api/vendors/${vendorId}/occupations`, payload);
	}

	static async addUser(vendorId: string, payload: AddVendorUserPayload) {
		return ApiClient.post(`/api/vendors/${vendorId}/users`, payload);
	}

	static async updateUser(
		vendorId: string,
		vendorUserId: string,
		payload: UpdateVendorUserPayload,
	) {
		return ApiClient.patch(
			`/api/vendors/${vendorId}/users/${vendorUserId}`,
			payload,
		);
	}

	static async addDocument(
		vendorId: string,
		payload: Omit<AddDocumentPayload, "url">,
		file: File,
	) {
		const formData = new FormData();
		formData.append("vendorId", vendorId);
		formData.append("name", payload.name);
		formData.append("type", payload.type);
		if (payload.description)
			formData.append("description", payload.description);
		formData.append("document", file);
		return ApiClient.post("/api/documents", formData);
	}

	static async getDocumentSignedUrl(
		documentId: string,
	): Promise<{ signedUrl: string }> {
		return ApiClient.get<{ signedUrl: string }>(
			`/api/documents/${documentId}/signed-url`,
		);
	}

	static async deleteDocument(documentId: string) {
		return ApiClient.delete(`/api/documents/${documentId}`);
	}

	static async getVendorNotes(
		vendorId: string,
		filters?: {
			search?: string;
			type?: string;
			dateFrom?: string;
			dateTo?: string;
		},
	) {
		const params: Record<string, string> = { vendorId };
		if (filters?.search?.trim()) params.search = filters.search.trim();
		if (filters?.type) params.type = filters.type;
		if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
		if (filters?.dateTo) params.dateTo = filters.dateTo;
		return ApiClient.get<VendorNoteWithDetails[]>("/api/notes", params);
	}

	static async addNote(vendorId: string, payload: AddNotePayload) {
		return ApiClient.post("/api/notes", { ...payload, vendorId });
	}

	static async updateNote(
		noteId: string,
		payload: { type?: string; notes?: string },
	) {
		return ApiClient.patch(`/api/notes/${noteId}`, payload);
	}

	static async deleteNote(noteId: string) {
		return ApiClient.delete(`/api/notes/${noteId}`);
	}

	static async getOccupations() {
		const res = await ApiClient.get<{ data: Occupation[] } | Occupation[]>(
			"/api/occupations",
			{ all: "true" },
		);
		return Array.isArray(res) ? res : (res.data ?? []);
	}
}
