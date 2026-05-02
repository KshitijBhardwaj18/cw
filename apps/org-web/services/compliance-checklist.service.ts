import type {
	ComplianceChecklistType,
	PaginatedComplianceChecklistsResponse,
	PaginatedComplianceResponse,
} from "@repo/shared";
import { ApiClient } from "@/lib/api-client";

export interface CreateChecklistInput {
	name: string;
	description?: string;
	complianceListItemIds: string[];
}

export interface UpdateChecklistInput {
	name?: string;
	description?: string;
	complianceListItemIds?: string[];
}

export interface GetChecklistsParams {
	search?: string;
	page?: number;
	limit?: number;
}

const BASE = "/api/org/compliance-checklists";

export class ComplianceChecklistService {
	static async getChecklists(
		params?: GetChecklistsParams,
	): Promise<PaginatedComplianceChecklistsResponse> {
		return ApiClient.get<PaginatedComplianceChecklistsResponse>(BASE, {
			...params,
		});
	}

	static async getChecklist(id: string): Promise<ComplianceChecklistType> {
		return ApiClient.get<ComplianceChecklistType>(`${BASE}/${id}`);
	}

	static async createChecklist(
		input: CreateChecklistInput,
	): Promise<ComplianceChecklistType> {
		return ApiClient.post<ComplianceChecklistType>(BASE, input);
	}

	static async updateChecklist(
		id: string,
		input: UpdateChecklistInput,
	): Promise<ComplianceChecklistType> {
		return ApiClient.patch<ComplianceChecklistType>(`${BASE}/${id}`, input);
	}

	static async deleteChecklist(id: string): Promise<void> {
		return ApiClient.delete(`${BASE}/${id}`);
	}

	static async duplicateChecklist(
		id: string,
	): Promise<ComplianceChecklistType> {
		return ApiClient.post<ComplianceChecklistType>(
			`${BASE}/${id}/duplicate`,
			{},
		);
	}

	static async getActiveListItems(
		search?: string,
	): Promise<PaginatedComplianceResponse> {
		return ApiClient.get<PaginatedComplianceResponse>(
			"/api/compliance/active",
			{
				...(search?.trim() && { search: search.trim() }),
			},
		);
	}
}
