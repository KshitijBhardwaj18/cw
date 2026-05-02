export interface CursorPaginatedResponse<T> {
	data: T[];
	nextCursor: string | null;
}

export interface PagePaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}
