"use client";

import { useDebouncer } from "@tanstack/react-pacer";
import { useCallback, useEffect, useState } from "react";

export interface UseLocalDebouncedSearchOptions {
	wait?: number;
}

export function useLocalDebouncedSearch(
	initial = "",
	options?: UseLocalDebouncedSearchOptions,
) {
	const wait = options?.wait ?? 500;
	const [search, setSearchImmediate] = useState(initial);
	const [debouncedSearch, setDebouncedSearch] = useState(initial);

	const debouncer = useDebouncer((value: string) => setDebouncedSearch(value), {
		wait,
	});

	useEffect(() => {
		setSearchImmediate(initial);
		setDebouncedSearch(initial);
		debouncer.cancel();
	}, [initial, debouncer]);

	const setSearch = useCallback(
		(value: string) => {
			setSearchImmediate(value);
			if (value === debouncedSearch) {
				debouncer.cancel();
				return;
			}
			debouncer.maybeExecute(value);
		},
		[debouncer, debouncedSearch],
	);

	return { search, debouncedSearch, setSearch };
}
