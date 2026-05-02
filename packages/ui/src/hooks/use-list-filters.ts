"use client";

import { useDebouncedCallback } from "@tanstack/react-pacer";
import { useCallback, useState } from "react";

export const DEFAULT_LIST_FILTER_DEBOUNCE_MS = 300;

export interface ListFiltersState {
	search?: string;
	type?: string;
	dateFrom?: string;
	dateTo?: string;
}

export interface UseListFiltersOptions {
	debounceMs?: number;
}

export function useListFilters(options?: UseListFiltersOptions) {
	const debounceMs = options?.debounceMs ?? DEFAULT_LIST_FILTER_DEBOUNCE_MS;

	const [search, setSearchImmediate] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [typeFilter, setTypeFilter] = useState("");
	const [dateFrom, setDateFrom] = useState("");
	const [dateTo, setDateTo] = useState("");

	const flushSearch = useDebouncedCallback(
		(value: string) => setDebouncedSearch(value),
		{ wait: debounceMs },
	);

	const setSearch = useCallback(
		(value: string) => {
			setSearchImmediate(value);
			flushSearch(value);
		},
		[flushSearch],
	);

	const filters: ListFiltersState = {
		search: debouncedSearch || undefined,
		type: typeFilter || undefined,
		dateFrom: dateFrom || undefined,
		dateTo: dateTo || undefined,
	};

	return {
		search,
		setSearch,
		debouncedSearch,
		typeFilter,
		setTypeFilter,
		dateFrom,
		setDateFrom,
		dateTo,
		setDateTo,
		filters,
	};
}
