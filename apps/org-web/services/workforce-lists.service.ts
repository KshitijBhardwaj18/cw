import type { CandidateWorkforceType } from "@repo/shared";
import { ApiClient } from "@/lib/api-client";

export type WorkforceListsQuery = {
	search?: string;
	page?: number;
	limit?: number;
};

export type WorkforceListCardResponseItem = {
	id: string;
	name: string;
	description: string;
	memberCount: number;
	updatedAt: string;
};

export type WorkforceListsResponse = {
	data: WorkforceListCardResponseItem[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
};

export type WorkforceListDetailResponse = WorkforceListCardResponseItem;

export type WorkforceListMembersQuery = {
	search?: string;
	workforceType?: CandidateWorkforceType;
	occupationId?: string;
	tagIds?: string[];
	page?: number;
	limit?: number;
};

export type WorkforceListMemberResponseItem = {
	id: string;
	candidateId: string;
	name: string;
	email: string;
	occupation: string;
	workforceType: CandidateWorkforceType | null;
	tags: string[];
	addedAt: string;
};

export type WorkforceListMembersResponse = {
	data: WorkforceListMemberResponseItem[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
};

export type AvailableCandidateResponseItem = {
	id: string;
	name: string;
	email: string;
	workforceType: CandidateWorkforceType | null;
	occupation: string;
	specialty: string;
	tags: string[];
	status: string;
};

export type AvailableCandidatesResponse = {
	data: AvailableCandidateResponseItem[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
};

const BASE = "/api/org/workforce-lists";

export class WorkforceListsService {
	static async list(query: WorkforceListsQuery = {}) {
		return ApiClient.get<WorkforceListsResponse>(BASE, query);
	}

	static async create(input: { name: string; description?: string }) {
		return ApiClient.post<WorkforceListDetailResponse>(BASE, input);
	}

	static async remove(listId: string) {
		return ApiClient.delete<{ success: true }>(`${BASE}/${listId}`);
	}

	static async get(listId: string) {
		return ApiClient.get<WorkforceListDetailResponse>(`${BASE}/${listId}`);
	}

	static async listMembers(
		listId: string,
		query: WorkforceListMembersQuery = {},
	) {
		return ApiClient.get<WorkforceListMembersResponse>(
			`${BASE}/${listId}/members`,
			{
				...query,
				tagIds: query.tagIds?.length ? query.tagIds.join(",") : undefined,
			},
		);
	}

	static async listAvailableCandidates(
		listId: string,
		query: WorkforceListMembersQuery = {},
	) {
		return ApiClient.get<AvailableCandidatesResponse>(
			`${BASE}/${listId}/available-candidates`,
			{
				...query,
				tagIds: query.tagIds?.length ? query.tagIds.join(",") : undefined,
			},
		);
	}

	static async addMembers(listId: string, candidateIds: string[]) {
		return ApiClient.post<{ addedCount: number }>(`${BASE}/${listId}/members`, {
			candidateIds,
		});
	}

	static async removeMember(listId: string, memberId: string) {
		return ApiClient.delete<{ success: true }>(
			`${BASE}/${listId}/members/${memberId}`,
		);
	}

	static async bulkTag(
		listId: string,
		input: { tagName: string; memberIds?: string[] },
	) {
		return ApiClient.post<{
			tagId: string;
			tagName: string;
			taggedCount: number;
		}>(`${BASE}/${listId}/bulk-tag`, input);
	}

	static async getMembersExportCsvBlob(
		listId: string,
		query?: Pick<WorkforceListMembersQuery, "search">,
	) {
		return ApiClient.getBlob(
			`${BASE}/${listId}/members/export.csv`,
			query?.search?.trim() ? { search: query.search.trim() } : undefined,
		);
	}
}
