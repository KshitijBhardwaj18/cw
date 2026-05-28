import type { PagePaginatedResponse, TimesheetEntryStatus } from "@repo/shared";
import { ApiClient } from "@/lib/api-client";

const BASE = "/api/org/timekeeping/vendor";

export type VendorTimekeepingMetrics = {
	totalShifts: number;
	pendingReview: number;
	errors: number;
	totalHours: number;
};

export type VendorTimekeepingStatus =
	| "draft"
	| "submitted"
	| "approved"
	| "rejected"
	| "disputed";

export type VendorTimekeepingEntry = {
	id: string;
	candidateId: string;
	candidateName: string;
	jobTitle: string;
	organization: string;
	date: string;
	startTime: string;
	endTime: string;
	totalHours: number;
	note: string | null;
	payCode: {
		id: string;
		code: string;
		description: string;
	} | null;
	vendorStatus: VendorTimekeepingStatus;
};

export type VendorPayCodeOption = {
	id: string;
	code: string;
	description: string;
	multiplier: number | null;
};

export type VendorTimekeepingEntriesQuery = {
	page?: number;
	limit?: number;
	search?: string;
	status?: TimesheetEntryStatus;
};

export type UpdateVendorTimekeepingEntryInput = {
	clockIn?: string;
	clockOut?: string;
	notes?: string | null;
	payCodeId?: string | null;
};

export class VendorTimekeepingService {
	static async getMetrics(): Promise<VendorTimekeepingMetrics> {
		return ApiClient.get<VendorTimekeepingMetrics>(`${BASE}/metrics`);
	}

	static async listEntries(
		query: VendorTimekeepingEntriesQuery,
	): Promise<PagePaginatedResponse<VendorTimekeepingEntry>> {
		return ApiClient.get<PagePaginatedResponse<VendorTimekeepingEntry>>(
			`${BASE}/entries`,
			query as Record<string, unknown>,
		);
	}

	static async updateEntry(
		entryId: string,
		body: UpdateVendorTimekeepingEntryInput,
	): Promise<VendorTimekeepingEntry> {
		return ApiClient.patch<VendorTimekeepingEntry>(
			`${BASE}/entries/${entryId}`,
			body,
		);
	}

	static async getPayCodes(): Promise<VendorPayCodeOption[]> {
		return ApiClient.get<VendorPayCodeOption[]>(`${BASE}/pay-codes`);
	}

	static async submitDrafts(entryIds?: string[]): Promise<{ updated: number }> {
		return ApiClient.post<{ updated: number }>(`${BASE}/submit`, {
			entryIds,
		});
	}

	static async internalUpload(file: File) {
		const formData = new FormData();
		formData.append("file", file);
		return ApiClient.request<{
			jobId: string;
			fileName: string;
			status: string;
		}>({
			method: "POST",
			url: `${BASE}/internal-upload`,
			data: formData,
		});
	}

	static async getUploadJob(jobId: string) {
		return ApiClient.get<{
			id: string;
			status: string;
			result: {
				created: number;
				skipped: number;
				failed: number;
				errors: { row: number; message: string }[];
			} | null;
			completedAt: string | null;
		}>(`${BASE}/internal-upload/${jobId}`);
	}
}
