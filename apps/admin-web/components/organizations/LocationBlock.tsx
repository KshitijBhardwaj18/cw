"use client";

import type {
	PostalAddressValue,
	PostalFormBindingsNoCountry,
} from "@repo/shared";
import { postalSnapshotFromForm, validateImageFile } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
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
import { ImagePlus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { LOCATION_TYPE_OPTIONS } from "@/constants/organization";
import {
	addOrganizationSchemaBase,
	organizationLocationPostalAutosuggestValidators,
} from "@/schemas/organization.schema";

const LOGO_ACCEPT = ".png,.jpg,.jpeg,image/png,image/jpeg";

function buildPostalOnChangeValidator(validator: unknown) {
	return validator ? { onChange: validator as never } : undefined;
}

function applyResolvedLocationPostalFields(
	setFieldValue: (name: string, value: string) => void,
	fields: PostalFormBindingsNoCountry<Record<string, unknown>>,
	address: PostalAddressValue,
): void {
	setFieldValue(fields.street, address.street);
	setFieldValue(fields.city, address.city);
	setFieldValue(fields.state, address.state);
	setFieldValue(fields.zipCode, address.zipCode);
}

export type LocationBlockForm = {
	Field: (props: {
		name: string;
		mode?: "array";
		validators?: { onChange?: unknown };
		children: (field: {
			state: {
				value: string;
				meta: { isTouched: boolean; isValid: boolean; errors?: string[] };
			};
			name: string;
			handleChange: (value: string) => void;
			handleBlur: () => void;
		}) => React.ReactNode;
	}) => React.ReactNode;
};

type LocationBlockFormWithPostalContext = LocationBlockForm & {
	Subscribe: (props: {
		selector: (state: { values: unknown }) => PostalAddressValue;
		children: (postal: PostalAddressValue) => React.ReactNode;
	}) => React.ReactNode;
	setFieldValue: (name: string, value: string) => void;
};

type LocationBlockProps = {
	form: LocationBlockForm;
	index: number;
	onRemove: () => void;
	canRemove: boolean;
	isPending?: boolean;
};

export function LocationBlock({
	form,
	index,
	onRemove,
	canRemove,
	isPending = false,
}: Readonly<LocationBlockProps>) {
	const formPostal = form as unknown as LocationBlockFormWithPostalContext;
	const prefix = `locations[${index}]` as const;
	const locationPostalFields: PostalFormBindingsNoCountry<
		Record<string, unknown>
	> = {
		street: `${prefix}.address`,
		city: `${prefix}.city`,
		state: `${prefix}.state`,
		zipCode: `${prefix}.zipCode`,
	};
	const photoInputRef = useRef<HTMLInputElement>(null);
	const [photoFile, setPhotoFile] = useState<File | null>(null);
	const [photoPreview, setPhotoPreview] = useState<string | null>(null);

	const handlePhotoClick = () => photoInputRef.current?.click();
	const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (isPending) return;
		const file = e.target.files?.[0];
		if (!file) return;
		const err = validateImageFile(file, "Location photo");
		if (err) {
			toast.error(err);
			return;
		}
		setPhotoFile(file);
		const reader = new FileReader();
		reader.onload = () => setPhotoPreview(reader.result as string);
		reader.readAsDataURL(file);
		e.target.value = "";
	};

	const locationValidators =
		addOrganizationSchemaBase.shape.locations.element.shape;

	const submissionAttempts = useStore(
		// LocationBlockForm narrows the Field API; parent always passes the full TanStack form.
		// @ts-expect-error -- store exists at runtime on the concrete form instance
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);

	return (
		<div className="space-y-4 rounded-lg border p-4">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<span className="text-sm font-medium">Location {index + 1}</span>
				{canRemove && (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="text-destructive hover:bg-destructive/10"
						disabled={isPending}
						onClick={onRemove}
					>
						<Trash2 className="size-4" data-icon="inline-start" />
						Remove
					</Button>
				)}
			</div>
			<FieldGroup>
				<form.Field
					name={`${prefix}.locationName`}
					validators={{ onChange: locationValidators.locationName }}
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
									Location Name <RequiredStar />
								</FieldLabel>
								<Input
									id={field.name}
									placeholder="e.g. Headquarters"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									aria-invalid={isInvalid}
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>

				<formPostal.Subscribe
					selector={(state) =>
						postalSnapshotFromForm(
							state.values as Record<string, unknown>,
							locationPostalFields,
						)
					}
				>
					{(postal) => (
						<>
							<form.Field
								name={`${prefix}.address`}
								validators={buildPostalOnChangeValidator(
									organizationLocationPostalAutosuggestValidators.street,
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
												Address <RequiredStar />
											</FieldLabel>
											<PostalStreetSearchInput
												inputId={field.name}
												postalContext={postal}
												value={String(field.state.value ?? "")}
												onChange={(v) => field.handleChange(v)}
												onBlur={field.handleBlur}
												placeholder="Street address"
												onResolvedAddress={(addr) =>
													applyResolvedLocationPostalFields(
														formPostal.setFieldValue,
														locationPostalFields,
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
									name={`${prefix}.city`}
									validators={buildPostalOnChangeValidator(
										organizationLocationPostalAutosuggestValidators.city,
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
													value={String(field.state.value ?? "")}
													onChange={(v) => field.handleChange(v)}
													onBlur={field.handleBlur}
													placeholder="City"
													onResolvedAddress={(addr) =>
														applyResolvedLocationPostalFields(
															formPostal.setFieldValue,
															locationPostalFields,
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
									name={`${prefix}.state`}
									validators={buildPostalOnChangeValidator(
										organizationLocationPostalAutosuggestValidators.state,
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
													value={String(field.state.value ?? "")}
													onChange={(v) => field.handleChange(v)}
													onBlur={field.handleBlur}
													placeholder="State"
													onResolvedAddress={(addr) =>
														applyResolvedLocationPostalFields(
															formPostal.setFieldValue,
															locationPostalFields,
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
									name={`${prefix}.zipCode`}
									validators={buildPostalOnChangeValidator(
										organizationLocationPostalAutosuggestValidators.zipCode,
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
													value={String(field.state.value ?? "")}
													onChange={(v) => field.handleChange(v)}
													onBlur={field.handleBlur}
													placeholder="ZIP"
													onResolvedAddress={(addr) =>
														applyResolvedLocationPostalFields(
															formPostal.setFieldValue,
															locationPostalFields,
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
				</formPostal.Subscribe>

				<form.Field
					name={`${prefix}.locationType`}
					validators={{ onChange: locationValidators.locationType }}
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
									Location Type <RequiredStar />
								</FieldLabel>
								<Select
									value={field.state.value}
									onValueChange={field.handleChange}
								>
									<SelectTrigger
										id={field.name}
										className="w-full"
										aria-invalid={isInvalid}
									>
										<SelectValue placeholder="Select type" />
									</SelectTrigger>
									<SelectContent>
										{LOCATION_TYPE_OPTIONS.map((opt) => (
											<SelectItem key={opt.value} value={opt.value}>
												{opt.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<form.Field name={`${prefix}.phone`}>
						{(field) => {
							const isInvalid = formFieldShowInvalid(
								field.state.meta.isTouched,
								field.state.meta.isValid,
								submissionAttempts,
							);
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Phone</FieldLabel>
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

					<form.Field
						name={`${prefix}.email`}
						validators={{ onChange: locationValidators.email }}
					>
						{(field) => {
							const isInvalid = formFieldShowInvalid(
								field.state.meta.isTouched,
								field.state.meta.isValid,
								submissionAttempts,
							);
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Email</FieldLabel>
									<Input
										id={field.name}
										type="email"
										placeholder="location@example.com"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>
				</div>

				<form.Field name={`${prefix}.costCenter`}>
					{(field) => (
						<Field>
							<FieldLabel htmlFor={field.name}>Cost Center</FieldLabel>
							<Input
								id={field.name}
								placeholder="Cost center"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
						</Field>
					)}
				</form.Field>

				<div className="space-y-2">
					<FieldLabel>Location Photo</FieldLabel>
					<div className="flex items-center gap-4">
						{photoPreview ? (
							<Image
								src={photoPreview}
								alt="Location"
								width={64}
								height={64}
								className="size-16 rounded-lg object-cover"
								unoptimized
							/>
						) : (
							<div className="flex size-16 items-center justify-center rounded-lg border border-dashed bg-muted/50">
								<ImagePlus className="text-muted-foreground size-6" />
							</div>
						)}
						<input
							ref={photoInputRef}
							type="file"
							accept={LOGO_ACCEPT}
							className="hidden"
							onChange={handlePhotoChange}
						/>
						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={isPending}
							onClick={handlePhotoClick}
						>
							<ImagePlus className="size-4" data-icon="inline-start" />
							{photoFile ? "Replace Photo" : "Upload Photo"}
						</Button>
					</div>
					<p className="text-muted-foreground text-xs">PNG, JPG — max 2MB</p>
				</div>
			</FieldGroup>
		</div>
	);
}
