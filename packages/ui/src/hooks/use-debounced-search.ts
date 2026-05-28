"use client";

import { useDebouncer } from "@tanstack/react-pacer";
import { parseAsString, useQueryStates } from "nuqs";
import {
	useCallback,
	useEffect,
	useMemo,
	useState,
	useTransition,
} from "react";

export interface UseDebouncedSearchOptions {
	wait?: number;
	paramKey?: string;
	pageParamKey?: string | null;
	alsoClearParamKeys?: string[];
}

export const DEFAULT_PARAMS = {
	pageParamKey: "page",
	searchParamKey: "search",
} as const;

export function useDebouncedSearch(options?: UseDebouncedSearchOptions) {
	const wait = options?.wait ?? 500;
	const paramKey = options?.paramKey ?? DEFAULT_PARAMS.searchParamKey;
	const pageParamKey =
		options?.pageParamKey === undefined
			? DEFAULT_PARAMS.pageParamKey
			: options.pageParamKey;
	const alsoClear = options?.alsoClearParamKeys ?? [];

	const schema = useMemo(() => {
		const obj = {
			[paramKey]: parseAsString.withDefault(""),
		};
		if (pageParamKey) {
			Object.assign(obj, { [pageParamKey]: parseAsString });
		}
		for (const key of alsoClear) {
			Object.assign(obj, { [key]: parseAsString });
		}
		return obj;
	}, [paramKey, pageParamKey, alsoClear]);

	const [params, setParams] = useQueryStates(schema);

	const localSearch = params[paramKey] ?? "";
	const [debouncedSearch, setDebouncedSearch] = useState(localSearch);

	const [, startTransition] = useTransition();

	const debouncer = useDebouncer(
		(value: string) => {
			startTransition(() => {
				setDebouncedSearch(value);
				const updates: Record<string, string | null> = {};
				if (pageParamKey) updates[pageParamKey] = null;
				for (const key of alsoClear) updates[key] = null;
				setParams(updates);
			});
		},
		{ wait },
	);

	useEffect(() => {
		if (localSearch === debouncedSearch) {
			debouncer.cancel();
			return;
		}
		debouncer.maybeExecute(localSearch);
	}, [localSearch, debouncedSearch, debouncer]);

	const handleSearchChange = useCallback(
		(value: string) => {
			setParams({ [paramKey]: value || null });
		},
		[setParams, paramKey],
	);

	return {
		localSearch,
		searchFromUrl: debouncedSearch,
		handleSearchChange,
		hasActiveSearch: !!debouncedSearch.trim(),
	};
}
