"use client";

import { useSearchParams } from "next/navigation";
import { useCallback } from "react";

export interface SearchParamsOverrides<TFilter extends string = string> {
	page?: number;
	search?: string;
	locationId?: string;
	filter?: TFilter;
}

export interface UseBuildSearchParamsOptions {
	searchParamKey?: string;
	pageParamKey?: string;
}

export function useBuildSearchParams<TFilter extends string = string>(
	options?: UseBuildSearchParamsOptions,
) {
	const searchParamKey = options?.searchParamKey ?? "search";
	const pageParamKey = options?.pageParamKey ?? "page";
	const searchParams = useSearchParams();

	return useCallback(
		(overrides: SearchParamsOverrides<TFilter>) => {
			const params = new URLSearchParams(searchParams.toString());
			if (overrides.page !== undefined) {
				params.set(pageParamKey, String(overrides.page));
			}
			if (overrides.search !== undefined) {
				if (overrides.search) {
					params.set(searchParamKey, overrides.search);
				} else {
					params.delete(searchParamKey);
				}
			}
			if (overrides.locationId !== undefined) {
				if (overrides.locationId) {
					params.set("locationId", overrides.locationId);
				} else {
					params.delete("locationId");
				}
			}
			if (overrides.filter !== undefined) {
				if (overrides.filter && overrides.filter !== "all") {
					params.set("filter", overrides.filter);
				} else {
					params.delete("filter");
				}
			}
			const q = params.toString();
			return q ? `?${q}` : "";
		},
		[searchParams, pageParamKey, searchParamKey],
	);
}
