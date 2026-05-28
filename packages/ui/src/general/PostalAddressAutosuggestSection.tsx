"use client";

import {
	type PostalAddressValue,
	type PostalFieldRole,
	type PostalFormBindings,
	postalSnapshotFromForm,
} from "@repo/shared";
import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import {
	PostalCitySearchInput,
	PostalCountrySearchInput,
	PostalStateSearchInput,
	PostalStreetSearchInput,
	PostalZipSearchInput,
} from "@repo/ui/general/PostalAddressSearchFields";
import RequiredStar from "@repo/ui/general/RequiredStar";
import type { ReactNode } from "react";

type PostalAutosuggestFieldSlot = {
	name: string;
	state: {
		value: unknown;
		meta: {
			isTouched: boolean;
			isValid: boolean;
			errors: ReadonlyArray<unknown>;
		};
	};
	handleChange: (value: string) => void;
	handleBlur: () => void;
};

type PostalAutosuggestFormBridge<TFormData extends Record<string, unknown>> = {
	Subscribe: (props: {
		selector?: (state: { values: TFormData }) => PostalAddressValue;
		children: ReactNode | ((postal: PostalAddressValue) => ReactNode);
	}) => ReactNode | Promise<ReactNode>;
	Field: (props: {
		name: keyof TFormData & string;
		validators?: { onChange?: unknown };
		children: (field: PostalAutosuggestFieldSlot) => ReactNode;
	}) => ReactNode | Promise<ReactNode>;
	setFieldValue: (name: keyof TFormData & string, value: string) => void;
};

export type PostalAddressAutosuggestValidators = Partial<
	Record<PostalFieldRole, unknown>
>;

type PostalAddressAutosuggestSectionProps<
	TFormData extends Record<string, unknown>,
> = {
	form: unknown;
	fields: PostalFormBindings<TFormData>;
	validators?: PostalAddressAutosuggestValidators;
};

function applyResolved<TFormData extends Record<string, unknown>>(
	form: PostalAutosuggestFormBridge<TFormData>,
	fields: PostalFormBindings<TFormData>,
	address: PostalAddressValue,
): void {
	form.setFieldValue(fields.street, address.street);
	form.setFieldValue(fields.city, address.city);
	form.setFieldValue(fields.state, address.state);
	form.setFieldValue(fields.zipCode, address.zipCode);
	form.setFieldValue(fields.country, address.country);
}

function buildValidatorProp(validator: unknown) {
	return validator ? { onChange: validator as never } : undefined;
}

export function PostalAddressAutosuggestSection<
	TFormData extends Record<string, unknown>,
>({
	form: rawForm,
	fields,
	validators,
}: Readonly<PostalAddressAutosuggestSectionProps<TFormData>>) {
	const form = rawForm as PostalAutosuggestFormBridge<TFormData>;
	return (
		<form.Subscribe
			selector={(state) => postalSnapshotFromForm(state.values, fields)}
		>
			{(postal) => (
				<div className="grid gap-4 sm:grid-cols-2">
					<form.Field
						name={fields.street}
						validators={buildValidatorProp(validators?.street)}
					>
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid} className="sm:col-span-2">
									<FieldLabel htmlFor={field.name}>
										Street <RequiredStar />
									</FieldLabel>
									<PostalStreetSearchInput
										inputId={field.name}
										postalContext={postal}
										value={String(field.state.value ?? "")}
										onChange={(v) => field.handleChange(v)}
										onBlur={field.handleBlur}
										onResolvedAddress={(addr) =>
											applyResolved(form, fields, addr)
										}
										aria-invalid={isInvalid}
									/>
									{isInvalid ? (
										<FieldError
											errors={[...field.state.meta.errors] as never[]}
										/>
									) : null}
								</Field>
							);
						}}
					</form.Field>

					<form.Field
						name={fields.city}
						validators={buildValidatorProp(validators?.city)}
					>
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>
										City <RequiredStar />
									</FieldLabel>
									<PostalCitySearchInput
										inputId={field.name}
										postalContext={postal}
										value={String(field.state.value ?? "")}
										onChange={(v) => field.handleChange(v)}
										onBlur={field.handleBlur}
										onResolvedAddress={(addr) =>
											applyResolved(form, fields, addr)
										}
										aria-invalid={isInvalid}
									/>
									{isInvalid ? (
										<FieldError
											errors={[...field.state.meta.errors] as never[]}
										/>
									) : null}
								</Field>
							);
						}}
					</form.Field>

					<form.Field
						name={fields.state}
						validators={buildValidatorProp(validators?.state)}
					>
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>
										State <RequiredStar />
									</FieldLabel>
									<PostalStateSearchInput
										inputId={field.name}
										postalContext={postal}
										value={String(field.state.value ?? "")}
										onChange={(v) => field.handleChange(v)}
										onBlur={field.handleBlur}
										onResolvedAddress={(addr) =>
											applyResolved(form, fields, addr)
										}
										aria-invalid={isInvalid}
									/>
									{isInvalid ? (
										<FieldError
											errors={[...field.state.meta.errors] as never[]}
										/>
									) : null}
								</Field>
							);
						}}
					</form.Field>

					<form.Field
						name={fields.zipCode}
						validators={buildValidatorProp(validators?.zipCode)}
					>
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>
										Zip / Postal Code <RequiredStar />
									</FieldLabel>
									<PostalZipSearchInput
										inputId={field.name}
										postalContext={postal}
										value={String(field.state.value ?? "")}
										onChange={(v) => field.handleChange(v)}
										onBlur={field.handleBlur}
										onResolvedAddress={(addr) =>
											applyResolved(form, fields, addr)
										}
										aria-invalid={isInvalid}
									/>
									{isInvalid ? (
										<FieldError
											errors={[...field.state.meta.errors] as never[]}
										/>
									) : null}
								</Field>
							);
						}}
					</form.Field>

					<form.Field
						name={fields.country}
						validators={buildValidatorProp(validators?.country)}
					>
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid} className="sm:col-span-2">
									<FieldLabel htmlFor={field.name}>
										Country <RequiredStar />
									</FieldLabel>
									<PostalCountrySearchInput
										inputId={field.name}
										postalContext={postal}
										value={String(field.state.value ?? "")}
										onChange={(v) => field.handleChange(v)}
										onBlur={field.handleBlur}
										onResolvedAddress={(addr) =>
											applyResolved(form, fields, addr)
										}
										aria-invalid={isInvalid}
									/>
									{isInvalid ? (
										<FieldError
											errors={[...field.state.meta.errors] as never[]}
										/>
									) : null}
								</Field>
							);
						}}
					</form.Field>
				</div>
			)}
		</form.Subscribe>
	);
}
