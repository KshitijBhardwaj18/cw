/** Paginated list page size for candidate + vendor document wallet requirement lists. */
export const DOCUMENT_WALLET_LIST_PAGE_SIZE = 12;

export const DOCUMENT_WALLET_SEARCH_DEBOUNCE_MS = 350;

/** URL query keys for candidate document wallet list (namespace). */
export const DOCUMENT_WALLET_URL_KEYS = {
	search: "dwSearch",
	page: "dwPage",
	category: "dwCat",
} as const;
