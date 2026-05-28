"use client";

import type {
	PostalAddressSuggestion,
	PostalAddressValue,
	PostalFieldRole,
} from "@repo/shared";
import { PostalAddressFieldCombobox } from "@repo/ui/general/PostalAddressFieldCombobox";
import { usePostalFieldAutosuggest } from "@repo/ui/hooks/use-postal-field-autosuggest";
import { useState } from "react";

type PostalAutosuggestInputBase = {
	postalContext: PostalAddressValue;
	onResolvedAddress: (address: PostalAddressValue) => void;
	value: string;
	onChange: (value: string) => void;
	onBlur?: () => void;
	disabled?: boolean;
	className?: string;
	minFieldLength?: number;
	debounceMs?: number;
	photonApiBase?: string;
	placeholder?: string;
	autoComplete?: string;
	inputId?: string;
};

function PostalAutosuggestRoleInput({
	fieldRole,
	postalContext,
	onResolvedAddress,
	value,
	onChange,
	onBlur,
	disabled,
	className,
	minFieldLength,
	debounceMs,
	photonApiBase,
	placeholder,
	autoComplete,
	inputId,
}: Readonly<PostalAutosuggestInputBase & { fieldRole: PostalFieldRole }>) {
	const [focused, setFocused] = useState(false);

	const {
		suggestions,
		isLoading,
		errorMessage,
		minFieldLength: effectiveMinLength,
		queryGate,
		querySuccessEmpty,
		debouncingPending,
		typingMeetsMinLength,
	} = usePostalFieldAutosuggest(fieldRole, postalContext, value, {
		minFieldLength,
		debounceMs,
		photonApiBase,
	});

	const listOpen =
		focused &&
		typingMeetsMinLength &&
		(debouncingPending ||
			(queryGate &&
				(isLoading ||
					Boolean(errorMessage) ||
					suggestions.length > 0 ||
					querySuccessEmpty)));

	return (
		<PostalAddressFieldCombobox
			id={inputId}
			autoComplete={autoComplete}
			placeholder={placeholder}
			disabled={disabled}
			className={className}
			value={value}
			onChange={onChange}
			onBlur={() => {
				setFocused(false);
				onBlur?.();
			}}
			onFocus={() => setFocused(true)}
			suggestions={suggestions}
			isLoading={isLoading || debouncingPending}
			errorMessage={errorMessage}
			minLength={effectiveMinLength}
			listOpen={listOpen}
			onPick={(suggestion: PostalAddressSuggestion) => {
				onResolvedAddress({
					street: suggestion.street,
					city: suggestion.city,
					state: suggestion.state,
					zipCode: suggestion.zipCode,
					country: suggestion.country,
				});
				setFocused(false);
				onBlur?.();
			}}
		/>
	);
}

export function PostalStreetSearchInput(
	props: Readonly<PostalAutosuggestInputBase>,
) {
	return (
		<PostalAutosuggestRoleInput
			{...props}
			fieldRole="street"
			placeholder={props.placeholder ?? "Street address"}
			autoComplete={props.autoComplete ?? "street-address"}
		/>
	);
}

export function PostalCitySearchInput(
	props: Readonly<PostalAutosuggestInputBase>,
) {
	return (
		<PostalAutosuggestRoleInput
			{...props}
			fieldRole="city"
			placeholder={props.placeholder ?? "City"}
			autoComplete={props.autoComplete ?? "address-level2"}
		/>
	);
}

export function PostalStateSearchInput(
	props: Readonly<PostalAutosuggestInputBase>,
) {
	return (
		<PostalAutosuggestRoleInput
			{...props}
			fieldRole="state"
			placeholder={props.placeholder ?? "State"}
			autoComplete={props.autoComplete ?? "address-level1"}
		/>
	);
}

export function PostalZipSearchInput(
	props: Readonly<PostalAutosuggestInputBase>,
) {
	return (
		<PostalAutosuggestRoleInput
			{...props}
			fieldRole="zipCode"
			placeholder={props.placeholder ?? "Zip or postal code"}
			autoComplete={props.autoComplete ?? "postal-code"}
		/>
	);
}

export function PostalCountrySearchInput(
	props: Readonly<PostalAutosuggestInputBase>,
) {
	return (
		<PostalAutosuggestRoleInput
			{...props}
			fieldRole="country"
			placeholder={props.placeholder ?? "Country"}
			autoComplete={props.autoComplete ?? "country-name"}
		/>
	);
}
