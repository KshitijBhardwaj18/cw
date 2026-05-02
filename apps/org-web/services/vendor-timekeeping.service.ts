import type { PagePaginatedResponse } from "@repo/shared";
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
}
