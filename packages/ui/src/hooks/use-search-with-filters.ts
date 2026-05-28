"use client";

import {
	parseAsInteger,
	parseAsString,
	parseAsStringLiteral,
	type UseQueryStatesKeysMap,
	useQueryState,
	useQueryStates,
} from "nuqs";
import { useMemo } from "react";
import type { SearchWithFiltersFilterConfig } from "../shared/SearchWithFilters";
import { useDebouncedSearch } from "./use-debounced-search";

export interface FilterSetup
	extends Omit<SearchWithFiltersFilterConfig, "value" | "onValueChange"> {
	defaultValue?: string;
}

export interface UseSearchWithFiltersOptions {
	search?: {
		paramKey?: string;
		wait?: number;
		alsoClearParamKeys?: string[];
	};
	pagination?: {
		pageParamKey?: string;
	};
	filters?: FilterSetup[];
}

export function useSearchWithFilters(options?: UseSearchWithFiltersOptions) {
	const pageParam = options?.pagination?.pageParamKey ?? "page";
	const filterSetups = options?.filters ?? [];

	const {
		localSearch: searchValue,
		searchFromUrl,
		handleSearchChange,
		hasActiveSearch,
	} = useDebouncedSearch({
		...options?.search,
		pageParamKey: pageParam,
	});

	const [, setPage] = useQueryState(pageParam, parseAsInteger.withDefault(1));

	const schema = useMemo(() => {
		const s: UseQueryStatesKeysMap = {};

		for (const setup of filterSetups) {
			if (setup.type === "select" && setup.options?.length) {
				const validValues = setup.options.map((o) => o.value);
				s[setup.id] = parseAsStringLiteral(validValues).withDefault(
					setup.defaultValue ?? validValues[0] ?? "all",
				);
			} else {
				s[setup.id] = parseAsString.withDefault(setup.defaultValue ?? "");
			}
		}
		return s;
	}, [filterSetups]);

	const [values, setParams] = useQueryStates(schema);

	const filterConfigs: SearchWithFiltersFilterConfig[] = useMemo(() => {
		return filterSetups.map((setup) => {
			return {
				...setup,
				value: (values[setup.id] as string) ?? "",
				onValueChange: (v: string) => {
					setParams({ [setup.id]: v || null });
					if (pageParam) setPage(1);
				},
			};
		});
	}, [filterSetups, values, setParams, pageParam, setPage]);

	const onFilterChange = (
		keyOrUpdates: string | Record<string, string | null>,
		value?: string | null,
	) => {
		if (typeof keyOrUpdates === "string") {
			setParams({ [keyOrUpdates]: value || null });
		} else {
			setParams(keyOrUpdates);
		}
		if (pageParam) setPage(1);
	};

	return {
		values,
		searchFromUrl,
		searchValue,
		handleSearchChange,
		filterConfigs,
		onFilterChange,
		hasActiveSearch,
	};
}
