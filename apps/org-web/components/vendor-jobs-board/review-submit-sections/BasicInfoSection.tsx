"use client";

import type {
	PostalAddressValue,
	PostalFormBindingsNoCountry,
	ShiftType,
} from "@repo/shared";
import { postalSnapshotFromForm } from "@repo/shared";
import { Checkbox } from "@repo/ui/components/checkbox";
import { DatePicker } from "@repo/ui/components/date-picker";
import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import {
	MultiSelect,
	MultiSelectContent,
	MultiSelectItem,
	MultiSelectTrigger,
	MultiSelectValue,
} from "@repo/ui/components/multi-select";
import { DetailInputField } from "@repo/ui/general/DetailInputField";
import {
	PostalCitySearchInput,
	PostalStateSearchInput,
	PostalStreetSearchInput,
	PostalZipSearchInput,
} from "@repo/ui/general/PostalAddressSearchFields";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { formFieldShowInvalid } from "@repo/ui/lib/form-field-display";
import { cn } from "@repo/ui/lib/utils";
import { useStore } from "@tanstack/react-form";
import type { ComponentType } from "react";
import { SHIFT_TYPE_LABEL, SHIFT_TYPE_VALUES } from "@/constants/shifts";
import type {
	ReviewSubmitFormApi,
	ReviewSubmitFormValues,
} from "@/schemas/vendor-jobs-board.schema";
import { reviewSubmitPostalAutosuggestValidators } from "@/schemas/vendor-jobs-board.schema";

const REVIEW_SUBMIT_POSTAL_FIELDS: PostalFormBindingsNoCountry<ReviewSubmitFormValues> =
	{
		street: "streetAddress",
		city: "city",
		state: "state",
		zipCode: "zipCode",
	};

type AddressFieldName = "streetAddress" | "city" | "state" | "zipCode";

type PostalSearchInputProps = {
	postalContext: PostalAddressValue;
	value: string;
	onChange: (value: string) => void;
	onBlur?: () => void;
	inputId?: string;
	className?: string;
	onResolvedAddress: (address: PostalAddressValue) => void;
};

const REVIEW_SUBMIT_ADDRESS_FIELDS: ReadonlyArray<{
	name: AddressFieldName;
	label: string;
	validator: (typeof reviewSubmitPostalAutosuggestValidators)[keyof typeof reviewSubmitPostalAutosuggestValidators];
	PostalInput: ComponentType<PostalSearchInputProps>;
}> = [
	{
		name: "streetAddress",
		label: "Street address",
		validator: reviewSubmitPostalAutosuggestValidators.street,
		PostalInput: PostalStreetSearchInput,
	},
	{
		name: "city",
		label: "City",
		validator: reviewSubmitPostalAutosuggestValidators.city,
		PostalInput: PostalCitySearchInput,
	},
	{
		name: "state",
		label: "State",
		validator: reviewSubmitPostalAutosuggestValidators.state,
		PostalInput: PostalStateSearchInput,
	},
	{
		name: "zipCode",
		label: "ZIP code",
		validator: reviewSubmitPostalAutosuggestValidators.zipCode,
		PostalInput: PostalZipSearchInput,
	},
];

function applyResolvedPostal(
	form: ReviewSubmitFormApi,
	address: PostalAddressValue,
): void {
	form.setFieldValue("streetAddress", address.street);
	form.setFieldValue("city", address.city);
	form.setFieldValue("state", address.state);
	form.setFieldValue("zipCode", address.zipCode);
}

function ReviewSubmitAddressFields({
	form,
	isEditing,
	postal,
	submissionAttempts,
}: Readonly<{
	form: ReviewSubmitFormApi;
	isEditing: boolean;
	postal: PostalAddressValue | null;
	submissionAttempts: number;
}>) {
	const applyResolved = (address: PostalAddressValue) =>
		applyResolvedPostal(form, address);

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
			{REVIEW_SUBMIT_ADDRESS_FIELDS.map(
				({ name, label, validator, PostalInput }) => (
					<form.Field
						key={name}
						name={name}
						validators={
							isEditing && postal ? { onChange: validator as never } : undefined
						}
					>
						{(field) => {
							if (!isEditing || !postal) {
								return (
									<DetailInputField
										label={label}
										value={field.state.value}
										editMode={isEditing}
										name={field.name}
										onBlur={field.handleBlur}
										onChange={field.handleChange}
										errors={field.state.meta.errors}
										required={isEditing}
									/>
								);
							}

							const isInvalid = formFieldShowInvalid(
								field.state.meta.isTouched,
								field.state.meta.isValid,
								submissionAttempts,
							);

							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel
										htmlFor={field.name}
										className="text-muted-foreground font-normal"
									>
										{label} <RequiredStar />
									</FieldLabel>
									<PostalInput
										inputId={field.name}
										postalContext={postal}
										value={String(field.state.value ?? "")}
										onChange={(v) => field.handleChange(v)}
										onBlur={field.handleBlur}
										className="border-primary/50"
										onResolvedAddress={applyResolved}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>
				),
			)}
		</div>
	);
}

export interface BasicInfoSectionProps {
	form: ReviewSubmitFormApi;
	isEditing: boolean;
	/** When not editing, show these labels (from server profile). */
	occupationDisplayName: string;
	specialtiesDisplayLabel: string;
}

export function BasicInfoSection({
	form,
	isEditing,
	occupationDisplayName,
	specialtiesDisplayLabel,
}: Readonly<BasicInfoSectionProps>) {
	const submissionAttempts = useStore(
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);

	return (
		<div className="space-y-4">
			<h4 className="font-bold text-foreground text-base">
				Candidate Basic Information
			</h4>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
				<form.Field name="firstName">
					{(field) => (
						<DetailInputField
							label="First Name"
							value={field.state.value}
							readOnly
							editMode={isEditing}
							name={field.name}
							onBlur={field.handleBlur}
							onChange={field.handleChange}
							errors={field.state.meta.errors}
							required={isEditing}
						/>
					)}
				</form.Field>
				<form.Field name="lastName">
					{(field) => (
						<DetailInputField
							label="Last Name"
							value={field.state.value}
							readOnly
							editMode={isEditing}
							name={field.name}
							onBlur={field.handleBlur}
							onChange={field.handleChange}
							errors={field.state.meta.errors}
							required={isEditing}
						/>
					)}
				</form.Field>
				<form.Field name="email">
					{(field) => (
						<DetailInputField
							label="Email"
							value={field.state.value}
							readOnly
							editMode={isEditing}
							name={field.name}
							onBlur={field.handleBlur}
							onChange={field.handleChange}
							errors={field.state.meta.errors}
							required={isEditing}
						/>
					)}
				</form.Field>
				<form.Field name="phoneNumber">
					{(field) => (
						<DetailInputField
							label="Phone"
							value={field.state.value}
							type="phone"
							editMode={isEditing}
							name={field.name}
							onBlur={field.handleBlur}
							onChange={field.handleChange}
							errors={field.state.meta.errors}
							required={isEditing}
						/>
					)}
				</form.Field>
			</div>

			{isEditing ? (
				<form.Subscribe
					selector={(state) =>
						postalSnapshotFromForm(
							state.values as ReviewSubmitFormValues,
							REVIEW_SUBMIT_POSTAL_FIELDS,
						)
					}
				>
					{(postal) => (
						<ReviewSubmitAddressFields
							form={form}
							isEditing
							postal={postal}
							submissionAttempts={submissionAttempts}
						/>
					)}
				</form.Subscribe>
			) : (
				<ReviewSubmitAddressFields
					form={form}
					isEditing={false}
					postal={null}
					submissionAttempts={submissionAttempts}
				/>
			)}

			<div className="space-y-4 pt-4">
				<div className="space-y-1">
					<h4 className="font-bold text-foreground text-base">
						Occupation &amp; specialties
					</h4>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
					<Field>
						<FieldLabel className="font-medium">Occupation</FieldLabel>
						<p className="text-sm py-2 border-b border-transparent">
							{occupationDisplayName}
						</p>
					</Field>
					<Field>
						<FieldLabel className="font-medium">Specialties</FieldLabel>
						<p className="text-sm py-2">{specialtiesDisplayLabel}</p>
					</Field>
				</div>
			</div>

			<div className="space-y-4 pt-2">
				<h4 className="font-bold text-foreground text-base">Availability</h4>
				<p className="text-sm text-muted-foreground -mt-2">
					Set when this candidate can start and whether they are actively
					available—same fields candidates fill; you can update on their behalf
					before submit.
				</p>
				<form.Field name="preferredShiftTypes">
					{(field) => {
						const isInvalid = formFieldShowInvalid(
							field.state.meta.isTouched,
							field.state.meta.isValid,
							submissionAttempts,
						);
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel className="font-medium">
									Preferred shift types {isEditing && <RequiredStar />}
								</FieldLabel>
								{!isEditing ? (
									<p className="text-sm py-2">
										{field.state.value.length > 0
											? field.state.value
													.map((s) => SHIFT_TYPE_LABEL[s])
													.join(", ")
											: "Not specified"}
									</p>
								) : (
									<MultiSelect
										values={field.state.value}
										onValuesChange={(v) => {
											field.handleChange(v as ShiftType[]);
											field.handleBlur();
										}}
									>
										<MultiSelectTrigger
											className={cn(
												"h-auto min-h-10 w-full justify-between py-2 whitespace-normal",
												isInvalid && "border-destructive",
											)}
											aria-invalid={isInvalid}
										>
											<MultiSelectValue placeholder="Select shift types…" />
										</MultiSelectTrigger>
										<MultiSelectContent>
											{SHIFT_TYPE_VALUES.map((v) => (
												<MultiSelectItem key={v} value={v}>
													{SHIFT_TYPE_LABEL[v]}
												</MultiSelectItem>
											))}
										</MultiSelectContent>
									</MultiSelect>
								)}
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>
				<div className="space-y-4 max-w-lg">
					<form.Field name="availableFrom">
						{(field) => (
							<Field className="space-y-2">
								<FieldLabel className="font-medium">Available from</FieldLabel>
								{!isEditing ? (
									<p className="text-sm text-foreground rounded-md border border-transparent py-2">
										{field.state.value?.trim() ? field.state.value : "Not set"}
									</p>
								) : (
									<DatePicker
										value={field.state.value ?? ""}
										onChange={(v) => field.handleChange(v)}
										placeholder="Pick a start date"
									/>
								)}
							</Field>
						)}
					</form.Field>
					<form.Field name="isAvailable">
						{(field) => (
							<div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3">
								<Checkbox
									id={`${field.name}-availability`}
									className="mt-0.5"
									checked={field.state.value}
									disabled={!isEditing}
									onCheckedChange={(c) => field.handleChange(c === true)}
								/>
								<div className="min-w-0 flex-1 space-y-0.5">
									<FieldLabel
										htmlFor={`${field.name}-availability`}
										className="text-sm font-medium leading-none cursor-pointer"
									>
										Currently available for work
									</FieldLabel>
									<p className="text-xs text-muted-foreground">
										Uncheck if the candidate is not taking assignments right
										now.
									</p>
								</div>
							</div>
						)}
					</form.Field>
				</div>
			</div>
		</div>
	);
}
