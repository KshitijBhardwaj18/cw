import type { Prisma } from "@repo/db";

export type TagResponseType = Prisma.TagGetPayload<object>;

export interface PaginatedTagsResponse {
	data: TagResponseType[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}
