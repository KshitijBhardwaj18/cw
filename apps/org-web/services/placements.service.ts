import type { PagePaginatedResponse } from "@repo/shared";
import type { PlacementOfferHistoryResponse } from "@/constants/placement-offer-history";
import { ApiClient } from "@/lib/api-client";
import type {
	EndPlacementInput,
	PlacementCardItem,
	PlacementDetailItem,
	PlacementNote,
	PlacementTab,
	PlacementTask,
} from "@/types/placement";
import type {
	AvailableComplianceListItem,
	PlacementComplianceResponse,
} from "@/types/placement-compliance";

const BASE = "/api/org/placements";

export type CredentialsQuery = {
	search?: string;
	status?: "EXPIRING_SOON" | "EXPIRED" | "CRITICAL";
	locationId?: string;
	departmentId?: string;
	vendorId?: string;
	hiringManagerId?: string;
	page?: number;
	limit?: number;
};

export type CredentialRow = {
	id: string;
	placementId: string;
	complianceListItemId: string;
	candidateId: string;
	workerName: string;
	credentialName: string;
	credentialType: string;
	jobTitle: string;
	location: string | null;
	expiryDate: string;
	expiryMeta: string;
	status: "EXPIRING_SOON" | "EXPIRED" | "CRITICAL";
	department: string | null;
	vendor: string | null;
	hiringManager: string | null;
};

export type CredentialCounts = {
	EXPIRING_SOON: number;
	EXPIRED: number;
	CRITICAL: number;
};

export type CredentialsListResponse = PagePaginatedResponse<CredentialRow>;

export type UpcomingComplianceQuery = {
	search?: string;
	complianceStatus?: "COMPLETE" | "IN_PROGRESS" | "MISSING";
	locationId?: string;
	departmentId?: string;
	vendorId?: string;
	hiringManagerId?: string;
	page?: number;
	limit?: number;
};

export type UpcomingComplianceRow = {
	id: string;
	candidateName: string;
	candidateInitials: string;
	jobTitle: string;
	location: string | null;
	department: string | null;
	vendor: string | null;
	hiringManager: string | null;
	startDate: string;
	startMeta: string;
	complianceStatus: "COMPLETE" | "IN_PROGRESS" | "MISSING";
	progressCompleted: number;
	progressTotal: number;
	missingItems: string;
};

export type UpcomingComplianceCounts = {
	TOTAL_UPCOMING: number;
	READY_TO_START: number;
	IN_PROGRESS: number;
	MISSING_ITEMS: number;
};

export type UpcomingComplianceListResponse =
	PagePaginatedResponse<UpcomingComplianceRow>;

export type PlacementCredentialDetail = {
	candidateName: string;
	jobTitle: string;
	location: string;
	department: string;
	vendor: string | null;
	hiringManager: string;
	startDate: string;
	status: string;
	summary: PlacementComplianceResponse["summary"];
	categories: PlacementComplianceResponse["categories"];
};

export type PlacementsQuery = {
	tab?: PlacementTab;
	search?: string;
	workforceType?: string;
	compliance?: string;
	vendorId?: string;
	page?: number;
	limit?: number;
};

export type PlacementsResponse = PagePaginatedResponse<PlacementCardItem>;

export type PlacementTabCounts = {
	upcoming: number;
	active: number;
	completed: number;
	/** All placements matching list scope (org / optional vendor filter). */
	total: number;
	/** Status ACTIVE only (excludes ENDING_SOON). */
	activeOnly: number;
	/** Status ENDING_SOON only. */
	endingSoon: number;
};

export class PlacementsService {
	static async getPlacements(
		query: PlacementsQuery = {},
	): Promise<PlacementsResponse> {
		return ApiClient.get<PlacementsResponse>(BASE, query);
	}

	static async getPlacementDetail(
		placementId: string,
	): Promise<PlacementDetailItem> {
		return ApiClient.get<PlacementDetailItem>(`${BASE}/${placementId}`);
	}

	static async getPlacementOfferHistory(
		placementId: string,
	): Promise<PlacementOfferHistoryResponse> {
		return ApiClient.get<PlacementOfferHistoryResponse>(
			`${BASE}/${placementId}/offer-history`,
		);
	}

	static async getPlacementNotes(
		placementId: string,
	): Promise<PlacementNote[]> {
		return ApiClient.get<PlacementNote[]>(`${BASE}/${placementId}/notes`);
	}

	static async getPlacementTasks(
		placementId: string,
	): Promise<PlacementTask[]> {
		return ApiClient.get<PlacementTask[]>(`${BASE}/${placementId}/tasks`);
	}

	static async createPlacementNote(
		placementId: string,
		body: { content: string; createdByRole?: string },
	): Promise<PlacementNote> {
		return ApiClient.post<PlacementNote>(`${BASE}/${placementId}/notes`, body);
	}

	static async createPlacementTask(
		placementId: string,
		body: {
			title: string;
			description?: string;
			dueDate?: string;
			assignedToId?: string;
		},
	): Promise<PlacementTask> {
		return ApiClient.post<PlacementTask>(`${BASE}/${placementId}/tasks`, body);
	}

	static async completePlacementTask(
		placementId: string,
		taskId: string,
	): Promise<PlacementTask> {
		return ApiClient.patch<PlacementTask>(
			`${BASE}/${placementId}/tasks/${taskId}`,
			{},
		);
	}

	static async getPlacementCompliance(
		placementId: string,
	): Promise<PlacementComplianceResponse> {
		return ApiClient.get<PlacementComplianceResponse>(
			`${BASE}/${placementId}/compliance`,
		);
	}

	static async getAvailableComplianceItems(
		placementId: string,
		search?: string,
	): Promise<{ data: AvailableComplianceListItem[] }> {
		return ApiClient.get<{ data: AvailableComplianceListItem[] }>(
			`${BASE}/${placementId}/compliance/available-items`,
			search?.trim() ? { search: search.trim() } : undefined,
		);
	}

	static async addPlacementComplianceItem(
		placementId: string,
		body: { complianceListItemId: string },
	): Promise<PlacementComplianceResponse> {
		return ApiClient.post<PlacementComplianceResponse>(
			`${BASE}/${placementId}/compliance/items`,
			body,
		);
	}

	static async bulkAddPlacementComplianceItems(
		placementId: string,
		body: { complianceListItemIds: string[] },
	): Promise<PlacementComplianceResponse> {
		return ApiClient.post<PlacementComplianceResponse>(
			`${BASE}/${placementId}/compliance/items/bulk`,
			body,
		);
	}

	static async removePlacementComplianceItem(
		placementId: string,
		placementComplianceItemId: string,
	): Promise<PlacementComplianceResponse> {
		return ApiClient.delete<PlacementComplianceResponse>(
			`${BASE}/${placementId}/compliance/items/${placementComplianceItemId}`,
		);
	}

	static async getPlacementCounts(): Promise<PlacementTabCounts> {
		return ApiClient.get<PlacementTabCounts>(`${BASE}/counts`);
	}

	static async endPlacement(
		placementId: string,
		body: EndPlacementInput,
	): Promise<{ success: boolean }> {
		return ApiClient.patch<{ success: boolean }>(
			`${BASE}/${placementId}/end`,
			body,
		);
	}

	static async getCredentialCounts(
		query: Omit<CredentialsQuery, "status" | "page" | "limit"> = {},
	): Promise<CredentialCounts> {
		return ApiClient.get<CredentialCounts>(`${BASE}/credentials/counts`, query);
	}

	static async getCredentialsList(
		query: CredentialsQuery = {},
	): Promise<CredentialsListResponse> {
		return ApiClient.get<CredentialsListResponse>(`${BASE}/credentials`, query);
	}

	static async getUpcomingComplianceCounts(
		query: Omit<
			UpcomingComplianceQuery,
			"complianceStatus" | "page" | "limit"
		> = {},
	): Promise<UpcomingComplianceCounts> {
		return ApiClient.get<UpcomingComplianceCounts>(
			`${BASE}/upcoming-compliance/counts`,
			query,
		);
	}

	static async getUpcomingCompliance(
		query: UpcomingComplianceQuery = {},
	): Promise<UpcomingComplianceListResponse> {
		return ApiClient.get<UpcomingComplianceListResponse>(
			`${BASE}/upcoming-compliance`,
			query,
		);
	}

	static async getPlacementCredentialDetail(
		placementId: string,
	): Promise<PlacementCredentialDetail> {
		return ApiClient.get<PlacementCredentialDetail>(
			`${BASE}/${placementId}/credential-detail`,
		);
	}

	static async updateCandidateComplianceStatus(
		placementId: string,
		complianceListItemId: string,
		body: { status: string; notes?: string; expiryDate?: string },
	): Promise<PlacementComplianceResponse> {
		return ApiClient.patch<PlacementComplianceResponse>(
			`${BASE}/${placementId}/compliance-items/${complianceListItemId}/status`,
			body,
		);
	}

	static async uploadCandidateComplianceDocument(
		placementId: string,
		complianceListItemId: string,
		file: File,
		expiryDate?: string,
	): Promise<PlacementComplianceResponse> {
		const form = new FormData();
		form.append("file", file);
		if (expiryDate) form.append("expiryDate", expiryDate);
		return ApiClient.post<PlacementComplianceResponse>(
			`${BASE}/${placementId}/compliance-items/${complianceListItemId}/document`,
			form,
		);
	}
}
