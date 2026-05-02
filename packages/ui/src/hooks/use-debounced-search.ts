"use client";

import { useDebouncer } from "@tanstack/react-pacer";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useUrlQueryState } from "./use-url-query-state";

export interface UseDebouncedSearchOptions {
	wait?: number;
	paramKey?: string;
	pageParamKey?: string | null;
	alsoClearParamKeys?: string[];
}

export function useDebouncedSearch(options?: UseDebouncedSearchOptions) {
	const wait = options?.wait ?? 500;
	const paramKey = options?.paramKey ?? "search";
	const pageParamKey =
		options?.pageParamKey === undefined ? "page" : options.pageParamKey;
	const alsoClear = options?.alsoClearParamKeys ?? [];

	const searchParams = useSearchParams();
	const searchFromUrl = searchParams.get(paramKey) ?? "";
	const [localSearch, setLocalSearch] = useState(searchFromUrl);
	const { replaceParams } = useUrlQueryState();

	const replaceParamsRef = useRef(replaceParams);
	replaceParamsRef.current = replaceParams;

	const alsoClearRef = useRef(alsoClear);
	alsoClearRef.current = alsoClear;

	const paramKeyRef = useRef(paramKey);
	paramKeyRef.current = paramKey;

	const pageParamKeyRef = useRef(pageParamKey);
	pageParamKeyRef.current = pageParamKey;

	const debouncer = useDebouncer(
		(value: string) => {
			const updates: Record<string, string | null> = {
				[paramKeyRef.current]: value.trim() ? value : null,
			};
			if (pageParamKeyRef.current) {
				updates[pageParamKeyRef.current] = null;
			}
			for (const key of alsoClearRef.current) {
				updates[key] = null;
			}
			replaceParamsRef.current(updates);
		},
		{ wait },
	);

	useEffect(() => {
		setLocalSearch(searchFromUrl);
		debouncer.cancel();
	}, [searchFromUrl, debouncer]);

	const handleSearchChange = useCallback(
		(value: string) => {
			setLocalSearch(value);
			if (value === searchFromUrl) {
				debouncer.cancel();
				return;
			}
			debouncer.maybeExecute(value);
		},
		[debouncer, searchFromUrl],
	);

	return { localSearch, searchFromUrl, handleSearchChange };
}
