"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
	type SearchParamsOverrides,
	useBuildSearchParams,
} from "./use-build-search-params";

export type { SearchParamsOverrides };

import { useDebouncedSearch } from "./use-debounced-search";

/** Namespaced URL keys for config / admin list pages (avoid clashing with `search` + `page` elsewhere). */
export const CONFIG_URL_SEARCH_KEY = "cfgSearch";
export const CONFIG_URL_PAGE_KEY = "cfgPage";

export interface UseConfigPageSearchQueryKeys {
	searchParamKey?: string;
	pageParamKey?: string;
}

export interface UseConfigPageSearchReturn {
	page: number;
	searchFromUrl: string;
	hasActiveSearch: boolean;
	localSearch: string;
	handleSearchChange: (value: string) => void;
	buildSearchParams: (overrides: SearchParamsOverrides) => string;
	locationIdFromUrl: string;
}

export interface UseConfigPageSearchFilterOptions<T extends string> {
	validFilters: readonly T[];
	defaultFilter: T;
}

type InferFilterFromOptions<O> =
	O extends UseConfigPageSearchFilterOptions<infer F> ? F : string;

export interface UseConfigPageSearchWithFilterReturn<T extends string>
	extends Omit<UseConfigPageSearchReturn, "buildSearchParams"> {
	filterFromUrl: T;
	handleFilterChange: (value: T) => void;
	buildSearchParams: (overrides: SearchParamsOverrides<T>) => string;
}

function resolveUrlKeys(
	options?:
		| (UseConfigPageSearchFilterOptions<string> & UseConfigPageSearchQueryKeys)
		| UseConfigPageSearchQueryKeys,
) {
	return {
		searchParamKey: options?.searchParamKey ?? CONFIG_URL_SEARCH_KEY,
		pageParamKey: options?.pageParamKey ?? CONFIG_URL_PAGE_KEY,
	};
}

export function useConfigPageSearch(
	options?: UseConfigPageSearchQueryKeys,
): UseConfigPageSearchReturn;
export function useConfigPageSearch<T extends string>(
	options: UseConfigPageSearchFilterOptions<T> & UseConfigPageSearchQueryKeys,
): UseConfigPageSearchWithFilterReturn<T>;
export function useConfigPageSearch<T extends string>(
	options?:
		| (UseConfigPageSearchFilterOptions<T> & UseConfigPageSearchQueryKeys)
		| UseConfigPageSearchQueryKeys,
): UseConfigPageSearchReturn | UseConfigPageSearchWithFilterReturn<T> {
	const { searchParamKey, pageParamKey } = resolveUrlKeys(options);
	const searchParams = useSearchParams();
	const router = useRouter();
	const page = Math.max(1, Number(searchParams.get(pageParamKey)) || 1);
	const locationIdFromUrl = searchParams.get("locationId") ?? "";

	const { localSearch, searchFromUrl, handleSearchChange } = useDebouncedSearch(
		{ paramKey: searchParamKey, pageParamKey },
	);
	const hasActiveSearch = !!searchFromUrl.trim();
	const buildSearchParams = useBuildSearchParams<
		InferFilterFromOptions<NonNullable<typeof options>>
	>({ searchParamKey, pageParamKey });

	if (!options || !("validFilters" in options)) {
		return {
			page,
			searchFromUrl,
			hasActiveSearch,
			localSearch,
			handleSearchChange,
			buildSearchParams,
			locationIdFromUrl,
		};
	}

	const { validFilters, defaultFilter } = options;

	const filterParam = searchParams.get("filter") ?? defaultFilter;
	const filterFromUrl = (
		validFilters.includes(filterParam as T) ? filterParam : defaultFilter
	) as T;

	const handleFilterChange = (value: T) => {
		router.push(buildSearchParams({ filter: value, page: 1 }), {
			scroll: false,
		});
	};

	return {
		page,
		searchFromUrl,
		filterFromUrl,
		hasActiveSearch,
		localSearch,
		handleSearchChange,
		handleFilterChange,
		buildSearchParams,
		locationIdFromUrl,
	};
}
