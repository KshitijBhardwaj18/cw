"use client";

import type {
	OrganizationLocationType,
	PostalAddressValue,
	PostalFormBindingsNoCountry,
} from "@repo/shared";
import { postalSnapshotFromForm } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
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
import { FormDialogFooter } from "@repo/ui/general/FormDialogFooter";
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
import { ImagePlus } from "lucide-react";
import Image from "next/image";
import { LOCATION_TYPE_OPTIONS } from "@/constants/organization";
import { useLocationFormDialog } from "@/hooks/use-location-form-dialog";
import {
	type LocationFormSchemaValues,
	locationFormPostalAutosuggestValidators,
	locationFormSchema,
} from "@/schemas/organization.schema";

const LOCATION_DIALOG_POSTAL_FIELDS: PostalFormBindingsNoCountry<LocationFormSchemaValues> =
	{
		street: "address",
		city: "city",
		state: "state",
		zipCode: "zipCode",
	};

const PHOTO_ACCEPT = ".png,.jpg,.jpeg,image/png,image/jpeg";

function buildPostalOnChangeValidator(validator: unknown) {
	return validator ? { onChange: validator as never } : undefined;
}

function applyResolvedLocationPostalFields(
	formApi: {
		setFieldValue: (
			name: keyof LocationFormSchemaValues,
			value: string,
		) => void;
	},
	fields: PostalFormBindingsNoCountry<LocationFormSchemaValues>,
	address: PostalAddressValue,
): void {
	formApi.setFieldValue(fields.street, address.street);
	formApi.setFieldValue(fields.city, address.city);
	formApi.setFieldValue(fields.state, address.state);
	formApi.setFieldValue(fields.zipCode, address.zipCode);
}

type LocationFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	organizationId: string;
	initialLocation?: OrganizationLocationType | null;
};

export function LocationFormDialog({
	open,
	onOpenChange,
	organizationId,
	initialLocation,
}: LocationFormDialogProps) {
	const {
		form,
		isEdit,
		isPending,
		handleOpenChange,
		photoInputRef,
		photoFile,
		photoPreview,
		handlePhotoClick,
		handlePhotoChange,
	} = useLocationFormDialog({
		open,
		onOpenChange,
		organizationId,
		initialLocation,
	});

	const submissionAttempts = useStore(
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto">
				<input
					ref={photoInputRef}
					type="file"
					accept={PHOTO_ACCEPT}
					className="hidden"
					onChange={handlePhotoChange}
				/>
				<DialogHeader>
					<DialogTitle>{isEdit ? "Edit Location" : "Add Location"}</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update the location details below."
							: "Add a new location to this organization."}
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						void form.handleSubmit();
					}}
					className="space-y-4"
				>
					<FieldGroup>
						<form.Field
							name="name"
							validators={{ onChange: locationFormSchema.shape.name }}
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
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						</form.Field>

						<form.Subscribe
							selector={(state) =>
								postalSnapshotFromForm(
									state.values as LocationFormSchemaValues,
									LOCATION_DIALOG_POSTAL_FIELDS,
								)
							}
						>
							{(postal) => (
								<>
									<form.Field
										name="address"
										validators={buildPostalOnChangeValidator(
											locationFormPostalAutosuggestValidators.street,
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
																form,
																LOCATION_DIALOG_POSTAL_FIELDS,
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
												locationFormPostalAutosuggestValidators.city,
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
																	form,
																	LOCATION_DIALOG_POSTAL_FIELDS,
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
												locationFormPostalAutosuggestValidators.state,
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
																	form,
																	LOCATION_DIALOG_POSTAL_FIELDS,
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
												locationFormPostalAutosuggestValidators.zipCode,
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
																	form,
																	LOCATION_DIALOG_POSTAL_FIELDS,
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

						<form.Field
							name="locationType"
							validators={{ onChange: locationFormSchema.shape.locationType }}
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
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						</form.Field>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<form.Field
								name="phone"
								validators={{ onChange: locationFormSchema.shape.phone }}
							>
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
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							</form.Field>

							<form.Field
								name="email"
								validators={{ onChange: locationFormSchema.shape.email }}
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
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							</form.Field>
						</div>

						<form.Field name="costCenter">
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
							<p className="text-muted-foreground text-xs">
								PNG, JPG — max 2MB
							</p>
						</div>
					</FieldGroup>

					<FormDialogFooter
						form={form}
						submitLabel={isEdit ? "Save Changes" : "Add Location"}
						submitLoadingLabel={isEdit ? "Saving..." : "Adding..."}
						onCancel={() => handleOpenChange(false)}
						isPending={isPending}
					/>
				</form>
			</DialogContent>
		</Dialog>
	);
}
