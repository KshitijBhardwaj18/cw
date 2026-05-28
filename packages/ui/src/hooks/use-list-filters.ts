"use client";

import { useDebouncedCallback } from "@tanstack/react-pacer";
import { useQueryState } from "nuqs";
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

export const LIST_FILTER_KEYS = ["search", "type", "dateFrom", "dateTo"];

export function useListFilters(options?: UseListFiltersOptions) {
	const debounceMs = options?.debounceMs ?? DEFAULT_LIST_FILTER_DEBOUNCE_MS;

	const [search, setSearchImmediate] = useQueryState("search", {
		defaultValue: "",
	});
	const [debouncedSearch, setDebouncedSearch] = useState(search);
	const [typeFilter, setTypeFilter] = useQueryState("type", {
		defaultValue: "",
	});
	const [dateFrom, setDateFrom] = useQueryState("dateFrom", {
		defaultValue: "",
	});
	const [dateTo, setDateTo] = useQueryState("dateTo", { defaultValue: "" });

	const flushSearch = useDebouncedCallback(
		(value: string) => setDebouncedSearch(value),
		{ wait: debounceMs },
	);

	const setSearch = useCallback(
		(value: string) => {
			setSearchImmediate(value);
			flushSearch(value);
		},
		[flushSearch, setSearchImmediate],
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

export type UseListFilters = ReturnType<typeof useListFilters>;
