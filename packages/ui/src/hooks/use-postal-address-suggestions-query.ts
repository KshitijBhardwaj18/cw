"use client";

import {
	PhotonAddressService,
	type PostalAddressSuggestion,
} from "@repo/shared";
import { useQuery } from "@tanstack/react-query";

export const postalAddressPhotonQueryKeys = {
	all: ["postal-address-photon"] as const,
	suggestions: (
		query: string,
		photonApiBase: string | undefined,
		customFetcher: boolean,
	) =>
		[
			...postalAddressPhotonQueryKeys.all,
			"suggestions",
			customFetcher ? "custom" : "photon-default",
			photonApiBase ?? "",
			query,
		] as const,
};

export type UsePostalAddressSuggestionsQueryOptions = {
	debouncedQuery: string;
	minLength?: number;
	photonApiBase?: string;
	fetchSuggestions?: (
		query: string,
		signal: AbortSignal,
	) => Promise<PostalAddressSuggestion[]>;
	fieldGate?: boolean;
};

export function usePostalAddressSuggestionsQuery({
	debouncedQuery,
	minLength = 2,
	photonApiBase,
	fetchSuggestions,
	fieldGate,
}: UsePostalAddressSuggestionsQueryOptions) {
	const q = debouncedQuery.trim();
	const lengthOk = q.length >= minLength;
	const enabled = (fieldGate ?? true) && lengthOk;

	return useQuery({
		queryKey: postalAddressPhotonQueryKeys.suggestions(
			q,
			photonApiBase,
			!!fetchSuggestions,
		),
		queryFn: ({ signal }) =>
			fetchSuggestions
				? fetchSuggestions(q, signal)
				: PhotonAddressService.searchSuggestions(q, {
						signal,
						baseUrl: photonApiBase,
					}),
		enabled,
		staleTime: 1000 * 60 * 5,
		retry: 1,
	});
}
