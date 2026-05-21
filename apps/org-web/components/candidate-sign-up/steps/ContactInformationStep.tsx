"use client";

import type {
	PostalAddressValue,
	PostalFormBindingsNoCountry,
} from "@repo/shared";
import { postalSnapshotFromForm } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@repo/ui/components/field";
import { PhoneInput } from "@repo/ui/general/PhoneInput";
import {
	PostalCitySearchInput,
	PostalStateSearchInput,
	PostalStreetSearchInput,
	PostalZipSearchInput,
} from "@repo/ui/general/PostalAddressSearchFields";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { formFieldShowInvalid } from "@repo/ui/lib/form-field-display";
import { useStore } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { useContactInformationStepForm } from "@/hooks/candidate/use-contact-information-step-form";
import {
	type ContactInformationFormValues,
	contactInformationPostalAutosuggestValidators,
	contactInformationSchema,
} from "@/schemas/candidate-sign-up.schema";

const CONTACT_INFORMATION_POSTAL_FIELDS: PostalFormBindingsNoCountry<ContactInformationFormValues> =
	{
		street: "streetAddress",
		city: "city",
		state: "state",
		zipCode: "zipCode",
	};

function buildPostalOnChangeValidator(validator: unknown) {
	return validator ? { onChange: validator as never } : undefined;
}

function applyResolvedContactPostalFields(
	formApi: {
		setFieldValue: (
			name: keyof ContactInformationFormValues,
			value: string,
		) => void;
	},
	fields: PostalFormBindingsNoCountry<ContactInformationFormValues>,
	address: PostalAddressValue,
): void {
	formApi.setFieldValue(fields.street, address.street);
	formApi.setFieldValue(fields.city, address.city);
	formApi.setFieldValue(fields.state, address.state);
	formApi.setFieldValue(fields.zipCode, address.zipCode);
}

interface ContactInformationStepProps {
	defaultValues: Partial<ContactInformationFormValues>;
	onBack: () => void;
	onContinue: (values: ContactInformationFormValues) => void;
	onValuesChange?: (values: ContactInformationFormValues) => void;
}

export function ContactInformationStep({
	defaultValues,
	onBack,
	onContinue,
	onValuesChange,
}: ContactInformationStepProps) {
	const { form } = useContactInformationStepForm({
		defaultValues,
		onContinue,
		onValuesChange,
	});

	const submissionAttempts = useStore(
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);

	return (
		<>
			<div className="space-y-1">
				<h2 className="text-lg font-semibold">Contact Information</h2>
				<p className="text-muted-foreground text-sm">Where can we reach you?</p>
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					void form.handleSubmit();
				}}
				className="space-y-4"
			>
				<FieldGroup>
					<form.Field
						name="phone"
						validators={{ onChange: contactInformationSchema.shape.phone }}
					>
						{(field) => {
							const isInvalid = formFieldShowInvalid(
								field.state.meta.isTouched,
								field.state.meta.isValid,
								submissionAttempts,
							);
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel
										htmlFor={field.name}
										className="text-sm font-medium"
									>
										Phone Number <RequiredStar />
									</FieldLabel>
									<PhoneInput
										id={field.name}
										name={field.name}
										placeholder="+19876543210"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(value) => field.handleChange(value)}
										aria-invalid={isInvalid}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<form.Subscribe
						selector={(state) =>
							postalSnapshotFromForm(
								state.values as ContactInformationFormValues,
								CONTACT_INFORMATION_POSTAL_FIELDS,
							)
						}
					>
						{(postal) => (
							<>
								<form.Field
									name="streetAddress"
									validators={buildPostalOnChangeValidator(
										contactInformationPostalAutosuggestValidators.street,
									)}
								>
									{(field) => {
										const isInvalid = formFieldShowInvalid(
											field.state.meta.isTouched,
											field.state.meta.isValid,
											submissionAttempts,
										);
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel
													htmlFor={field.name}
													className="text-sm font-medium"
												>
													Street Address <RequiredStar />
												</FieldLabel>
												<PostalStreetSearchInput
													inputId={field.name}
													postalContext={postal}
													value={String(field.state.value ?? "")}
													onChange={(v) => field.handleChange(v)}
													onBlur={field.handleBlur}
													placeholder="Street address — start typing for suggestions"
													autoComplete="street-address"
													onResolvedAddress={(addr) =>
														applyResolvedContactPostalFields(
															form,
															CONTACT_INFORMATION_POSTAL_FIELDS,
															addr,
														)
													}
												/>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								</form.Field>

								<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
									<form.Field
										name="city"
										validators={buildPostalOnChangeValidator(
											contactInformationPostalAutosuggestValidators.city,
										)}
									>
										{(field) => {
											const isInvalid = formFieldShowInvalid(
												field.state.meta.isTouched,
												field.state.meta.isValid,
												submissionAttempts,
											);
											return (
												<Field data-invalid={isInvalid}>
													<FieldLabel
														htmlFor={field.name}
														className="text-sm font-medium"
													>
														City <RequiredStar />
													</FieldLabel>
													<PostalCitySearchInput
														inputId={field.name}
														postalContext={postal}
														value={String(field.state.value ?? "")}
														onChange={(v) => field.handleChange(v)}
														onBlur={field.handleBlur}
														placeholder="City"
														onResolvedAddress={(addr) =>
															applyResolvedContactPostalFields(
																form,
																CONTACT_INFORMATION_POSTAL_FIELDS,
																addr,
															)
														}
													/>
													{isInvalid && (
														<FieldError errors={field.state.meta.errors} />
													)}
												</Field>
											);
										}}
									</form.Field>

									<form.Field
										name="state"
										validators={buildPostalOnChangeValidator(
											contactInformationPostalAutosuggestValidators.state,
										)}
									>
										{(field) => {
											const isInvalid = formFieldShowInvalid(
												field.state.meta.isTouched,
												field.state.meta.isValid,
												submissionAttempts,
											);
											return (
												<Field data-invalid={isInvalid}>
													<FieldLabel
														htmlFor={field.name}
														className="text-sm font-medium"
													>
														State <RequiredStar />
													</FieldLabel>
													<PostalStateSearchInput
														inputId={field.name}
														postalContext={postal}
														value={String(field.state.value ?? "")}
														onChange={(v) => field.handleChange(v)}
														onBlur={field.handleBlur}
														placeholder="State"
														onResolvedAddress={(addr) =>
															applyResolvedContactPostalFields(
																form,
																CONTACT_INFORMATION_POSTAL_FIELDS,
																addr,
															)
														}
													/>
													{isInvalid && (
														<FieldError errors={field.state.meta.errors} />
													)}
												</Field>
											);
										}}
									</form.Field>

									<form.Field
										name="zipCode"
										validators={buildPostalOnChangeValidator(
											contactInformationPostalAutosuggestValidators.zipCode,
										)}
									>
										{(field) => {
											const isInvalid = formFieldShowInvalid(
												field.state.meta.isTouched,
												field.state.meta.isValid,
												submissionAttempts,
											);
											return (
												<Field data-invalid={isInvalid}>
													<FieldLabel
														htmlFor={field.name}
														className="text-sm font-medium"
													>
														ZIP Code <RequiredStar />
													</FieldLabel>
													<PostalZipSearchInput
														inputId={field.name}
														postalContext={postal}
														value={String(field.state.value ?? "")}
														onChange={(v) => field.handleChange(v)}
														onBlur={field.handleBlur}
														placeholder="12345"
														onResolvedAddress={(addr) =>
															applyResolvedContactPostalFields(
																form,
																CONTACT_INFORMATION_POSTAL_FIELDS,
																addr,
															)
														}
													/>
													{isInvalid && (
														<FieldError errors={field.state.meta.errors} />
													)}
												</Field>
											);
										}}
									</form.Field>
								</div>
							</>
						)}
					</form.Subscribe>
				</FieldGroup>

				<div className="flex items-center justify-between pt-6">
					<Button type="button" variant="outline" onClick={onBack}>
						Back
					</Button>
					<form.Subscribe
						selector={(state) => ({
							isSubmitting: state.isSubmitting,
							canSubmit: state.canSubmit,
						})}
					>
						{({ isSubmitting, canSubmit }) => (
							<Button type="submit" disabled={!canSubmit || isSubmitting}>
								{isSubmitting ? (
									<Loader2 className="size-4 animate-spin" />
								) : null}
								Continue
							</Button>
						)}
					</form.Subscribe>
				</div>
			</form>
		</>
	);
}
