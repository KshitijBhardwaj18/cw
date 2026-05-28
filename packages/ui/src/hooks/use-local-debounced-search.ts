"use client";

import { useDebouncer } from "@tanstack/react-pacer";
import { useEffect, useState } from "react";

export interface UseLocalDebouncedSearchOptions {
	wait?: number;
}

export function useLocalDebouncedSearch(
	initial = "",
	options?: UseLocalDebouncedSearchOptions,
) {
	const wait = options?.wait ?? 500;
	const [search, setSearch] = useState(initial);
	const [debouncedSearch, setDebouncedSearch] = useState(initial);

	const debouncer = useDebouncer(setDebouncedSearch, { wait });

	useEffect(() => {
		if (search === debouncedSearch) {
			debouncer.cancel();
			return;
		}
		debouncer.maybeExecute(search);
	}, [search, debouncedSearch, debouncer]);

	return { search, debouncedSearch, setSearch };
}
