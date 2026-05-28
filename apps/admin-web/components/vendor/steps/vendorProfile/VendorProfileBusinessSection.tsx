"use client";

import type { PostalAddressValue } from "@repo/shared";
import { postalSnapshotFromForm, validatePhone } from "@repo/shared";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import {
	FormCurrencyInput,
	FormInput,
	FormNumberInput,
} from "@repo/ui/general/FormFields";
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
import { useUserTimezone } from "@/hooks/use-user-timezone";
import type { VendorProfileApi } from "@/hooks/use-vendor-profile";
import { vendorAddressPostalValidators } from "@/schemas/vendor.schema";

const VENDOR_POSTAL_FIELDS = {
	street: "addressStreet",
	city: "addressCity",
	state: "addressState",
	zipCode: "addressZipCode",
} as const;

function applyResolvedAddress(
	vendorForm: VendorProfileApi,
	addr: PostalAddressValue,
): void {
	vendorForm.setFieldValue("addressStreet", addr.street);
	vendorForm.setFieldValue("addressCity", addr.city);
	vendorForm.setFieldValue("addressState", addr.state);
	vendorForm.setFieldValue("addressZipCode", addr.zipCode);
	if (addr.country) vendorForm.setFieldValue("addressCountry", addr.country);
}

function buildOnChangeValidator(validator: unknown) {
	return validator ? { onChange: validator as never } : undefined;
}

interface VendorProfileBusinessSectionProps {
	form: VendorProfileApi;
}

export function VendorProfileBusinessSection({
	form,
}: Readonly<VendorProfileBusinessSectionProps>) {
	const { fmtShortDate } = useUserTimezone();
	const submissionAttempts = useStore(
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);

	return (
		<FieldGroup>
			<form.Field
				name="taxId"
				validators={{
					onBlur: ({ value }) => {
						if (!value) return undefined;
						const digits = value.replace(/\D/g, "");
						return digits.length > 0 && digits.length !== 9
							? "Tax ID must be 9 digits (XXXXXXXXX)"
							: undefined;
					},
				}}
			>
				{(field) => (
					<FormInput
						field={field}
						label="Tax ID Number"
						placeholder="837388930"
						inputMode="numeric"
						maxLength={9}
						onChange={(v) => field.handleChange(v)}
					/>
				)}
			</form.Field>

			<form.Field
				name="phoneNumber"
				validators={{
					onBlur: ({ value }) => validatePhone(value),
				}}
			>
				{(field) => {
					const isInvalid = formFieldShowInvalid(
						field.state.meta.isTouched,
						field.state.meta.isValid,
						submissionAttempts,
					);
					return (
						<Field>
							<FieldLabel htmlFor={field.name}>Main Phone Number</FieldLabel>
							<PhoneInput
								id={field.name}
								name={field.name}
								placeholder="Main Phone Number"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(value) => field.handleChange(value)}
								aria-invalid={isInvalid}
							/>
						</Field>
					);
				}}
			</form.Field>

			<form.Field name="website">
				{(field) => (
					<FormInput
						field={field}
						label="Website"
						placeholder="www.novahealth.com"
					/>
				)}
			</form.Field>

			{/* Address block */}
			<form.Subscribe
				selector={(state) =>
					postalSnapshotFromForm(
						state.values as Record<string, unknown>,
						VENDOR_POSTAL_FIELDS,
					)
				}
			>
				{(postal) => (
					<>
						<form.Field
							name="addressStreet"
							validators={buildOnChangeValidator(
								vendorAddressPostalValidators.street,
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
										<FieldLabel htmlFor={field.name}>
											Street Address <RequiredStar />
										</FieldLabel>
										<PostalStreetSearchInput
											inputId={field.name}
											postalContext={postal}
											value={field.state.value}
											onChange={(v) => field.handleChange(v)}
											onBlur={field.handleBlur}
											placeholder="Street address"
											onResolvedAddress={(addr) =>
												applyResolvedAddress(form, addr)
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
								name="addressCity"
								validators={buildOnChangeValidator(
									vendorAddressPostalValidators.city,
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
											<FieldLabel htmlFor={field.name}>
												City <RequiredStar />
											</FieldLabel>
											<PostalCitySearchInput
												inputId={field.name}
												postalContext={postal}
												value={field.state.value}
												onChange={(v) => field.handleChange(v)}
												onBlur={field.handleBlur}
												placeholder="City"
												onResolvedAddress={(addr) =>
													applyResolvedAddress(form, addr)
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
								name="addressState"
								validators={buildOnChangeValidator(
									vendorAddressPostalValidators.state,
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
											<FieldLabel htmlFor={field.name}>
												State <RequiredStar />
											</FieldLabel>
											<PostalStateSearchInput
												inputId={field.name}
												postalContext={postal}
												value={field.state.value}
												onChange={(v) => field.handleChange(v)}
												onBlur={field.handleBlur}
												placeholder="State"
												onResolvedAddress={(addr) =>
													applyResolvedAddress(form, addr)
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
								name="addressZipCode"
								validators={buildOnChangeValidator(
									vendorAddressPostalValidators.zipCode,
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
											<FieldLabel htmlFor={field.name}>
												ZIP Code <RequiredStar />
											</FieldLabel>
											<PostalZipSearchInput
												inputId={field.name}
												postalContext={postal}
												value={field.state.value}
												onChange={(v) => field.handleChange(v)}
												onBlur={field.handleBlur}
												placeholder="ZIP"
												onResolvedAddress={(addr) =>
													applyResolvedAddress(form, addr)
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

			<form.Field name="annualRevenue">
				{(field) => (
					<FormCurrencyInput
						field={field}
						label="Annual Revenue"
						placeholder="$25,000,000"
						minimumFractionDigits={0}
						maximumFractionDigits={0}
					/>
				)}
			</form.Field>

			<form.Field name="employeeCount">
				{(field) => (
					<FormNumberInput
						field={field}
						label="Employee Count"
						placeholder="300"
					/>
				)}
			</form.Field>

			<form.Field name="internalId">
				{(field) => (
					<FormInput field={field} label="Internal Vendor ID Number" readOnly />
				)}
			</form.Field>
			<p className="-mt-6 text-xs text-muted-foreground">
				System-generated, read-only
			</p>

			<form.Field name="createdDate">
				{(field) => (
					<Field>
						<FieldLabel>Created Date</FieldLabel>
						<Input value={fmtShortDate(field.state.value)} readOnly />
					</Field>
				)}
			</form.Field>
		</FieldGroup>
	);
}
