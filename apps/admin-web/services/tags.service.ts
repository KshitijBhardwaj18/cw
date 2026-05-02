import type { PaginatedTagsResponse, TagResponseType } from "@repo/shared";
import { ApiClient } from "@/lib/api-client";
import type { CreateTagPayload } from "@/schemas/tag.schema";

export interface TagsListParams {
	page?: number;
	limit?: number;
	search?: string;
	type?: string;
	showOnSubmission?: boolean;
}

export class TagsService {
	static async getTags(params: TagsListParams = {}) {
		const filtered = Object.fromEntries(
			Object.entries(params).filter(
				([, v]) => v !== undefined && v !== null && v !== "",
			),
		);
		return ApiClient.get<PaginatedTagsResponse>(
			"/api/tags",
			filtered as Record<string, unknown>,
		);
	}

	static async getTagById(id: string) {
		return ApiClient.get<TagResponseType | null>(`/api/tags/${id}`);
	}

	static async createTag(data: CreateTagPayload) {
		return ApiClient.post<TagResponseType, CreateTagPayload>("/api/tags", data);
	}

	static async updateTag(id: string, data: Partial<CreateTagPayload>) {
		return ApiClient.patch<TagResponseType, Partial<CreateTagPayload>>(
			`/api/tags/${id}`,
			data,
		);
	}

	static async deleteTag(id: string) {
		return ApiClient.delete(`/api/tags/${id}`);
	}
}
