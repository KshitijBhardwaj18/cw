"use client";

import {
	composePostalGeocodeQuery,
	mergePostalWithDebouncedFragment,
	type PostalAddressValue,
	type PostalFieldRole,
} from "@repo/shared";
import { useEffect, useState } from "react";
import { usePostalAddressSuggestionsQuery } from "./use-postal-address-suggestions-query";

export type UsePostalFieldAutosuggestOptions = {
	minFieldLength?: number;
	queryMinLength?: number;
	debounceMs?: number;
	photonApiBase?: string;
};

export function usePostalFieldAutosuggest(
	role: PostalFieldRole,
	postalContext: PostalAddressValue,
	fieldValue: string,
	options?: UsePostalFieldAutosuggestOptions,
) {
	const minFieldLength = options?.minFieldLength ?? 2;
	const queryMinLength = options?.queryMinLength ?? 1;
	const debounceMs = options?.debounceMs ?? 400;

	const [debouncedFieldValue, setDebouncedFieldValue] = useState(fieldValue);

	useEffect(() => {
		const id = globalThis.setTimeout(() => {
			setDebouncedFieldValue(fieldValue);
		}, debounceMs);
		return () => globalThis.clearTimeout(id);
	}, [debounceMs, fieldValue]);

	const merged = mergePostalWithDebouncedFragment(
		postalContext,
		role,
		debouncedFieldValue,
	);
	const composedQuery = composePostalGeocodeQuery(role, merged);

	const typedTrimmed = fieldValue.trim();
	const debouncedTrimmed = debouncedFieldValue.trim();
	const typingMeetsMinLength = typedTrimmed.length >= minFieldLength;
	const debouncedMeetsMinLength = debouncedTrimmed.length >= minFieldLength;
	const queryGate =
		debouncedMeetsMinLength && composedQuery.length >= queryMinLength;
	const debouncingPending =
		typingMeetsMinLength && typedTrimmed !== debouncedTrimmed;

	const { data, isFetching, isError, error, isSuccess } =
		usePostalAddressSuggestionsQuery({
			debouncedQuery: composedQuery,
			minLength: queryMinLength,
			photonApiBase: options?.photonApiBase,
			fieldGate: queryGate,
		});

	const suggestions = queryGate ? (data ?? []) : [];
	const isLoading = queryGate && isFetching;
	const querySuccessEmpty =
		queryGate && isSuccess && !isFetching && suggestions.length === 0;
	const errorMessage =
		queryGate && isError
			? error instanceof Error
				? error.message
				: "Could not search addresses"
			: null;

	return {
		suggestions,
		isLoading,
		errorMessage,
		minFieldLength,
		queryGate,
		querySuccessEmpty,
		debouncingPending,
		typingMeetsMinLength,
	};
}
