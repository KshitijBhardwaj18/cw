export const DOCUMENT_WALLET_DEFAULT_LIMIT = 10;
export const DOCUMENT_WALLET_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export const DOCUMENT_WALLET_SEARCH_DEBOUNCE_MS = 350;

/** URL query keys for candidate document wallet list (namespace). */
export const DOCUMENT_WALLET_URL_KEYS = {
	search: "dwSearch",
	page: "dwPage",
	limit: "dwLimit",
	category: "dwCat",
} as const;
