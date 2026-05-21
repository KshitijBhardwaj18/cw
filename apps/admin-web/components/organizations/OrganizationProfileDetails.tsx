"use client";

import type { OrganizationResponseType } from "@repo/shared";
import { TIMEZONE_OPTIONS } from "@repo/shared";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { DatePicker } from "@repo/ui/components/date-picker";
import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { Switch } from "@repo/ui/components/switch";
import { FormDialogFooter } from "@repo/ui/general/FormDialogFooter";
import { PhoneInput } from "@repo/ui/general/PhoneInput";
import { formFieldShowInvalid } from "@repo/ui/lib/form-field-display";
import { useStore } from "@tanstack/react-form";
import { ImagePlus } from "lucide-react";
import {
	ORGANIZATION_INDUSTRY_OPTIONS,
	ORGANIZATION_TYPE_OPTIONS,
} from "@/constants/organization";
import { useOrganizationProfileForm } from "@/hooks/use-organization-profile-form";
import type { UpdateOrganizationFormValues } from "@/schemas/organization.schema";
import { ServiceAgreementSection } from "./ServiceAgreementSection";

const LOGO_ACCEPT = ".png,.jpg,.jpeg,image/png,image/jpeg";
const AGREEMENT_ACCEPT =
	".pdf,.csv,.xlsx,.xls,image/png,image/jpeg,.png,.jpg,.jpeg,application/pdf,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

type OrganizationProfileDetailsProps = {
	organization: OrganizationResponseType;
};

export function OrganizationProfileDetails({
	organization,
}: OrganizationProfileDetailsProps) {
	const {
		form,
		initialValues,
		hasChanges,
		logoInputRef,
		agreementInputRef,
		logoPreviewSrc,
		logoFile,
		agreementFile,
		agreementUploadDate,
		hasFileChanges,
		isPending,
		handleLogoClick,
		handleLogoChange,
		handleAgreementClick,
		handleAgreementChange,
		handleAgreementReplace,
	} = useOrganizationProfileForm({ organization });

	const submissionAttempts = useStore(
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);

	return (
		<Card>
			<CardContent className="px-6">
				<input
					ref={logoInputRef}
					type="file"
					accept={LOGO_ACCEPT}
					className="hidden"
					onChange={handleLogoChange}
				/>
				<input
					ref={agreementInputRef}
					type="file"
					accept={AGREEMENT_ACCEPT}
					className="hidden"
					onChange={handleAgreementChange}
				/>
				<h2 className="mb-4 text-lg font-semibold">Organization Profile</h2>
				<p className="text-muted-foreground mb-6 text-sm">
					Enter the basic information for the organization.
				</p>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						void form.handleSubmit();
					}}
				>
					<div className="space-y-6">
						<div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
							{/* Logo */}
							<div className="space-y-2">
								<FieldLabel>Organization Logo</FieldLabel>
								<div className="flex items-center gap-4">
									<Avatar className="size-16">
										{logoPreviewSrc ? (
											<AvatarImage
												src={logoPreviewSrc}
												alt="Organization logo"
											/>
										) : null}
										<AvatarFallback className="text-xl font-semibold">
											{organization.name.charAt(0).toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={handleLogoClick}
										disabled={isPending}
									>
										<ImagePlus className="size-4" data-icon="inline-start" />
										{logoFile ? "Replace Logo" : "Upload Logo"}
									</Button>
								</div>
								<p className="text-muted-foreground text-xs">
									PNG, JPG — max 2MB.
								</p>
							</div>
							{/* Status */}
							<form.Field name="isActive">
								{(field) => (
									<div className="flex items-center gap-4">
										<Label htmlFor="isActive">Status</Label>
										<Switch
											id="isActive"
											checked={field.state.value}
											onCheckedChange={(value) => field.handleChange(value)}
										/>
										<span className="text-muted-foreground text-sm w-16">
											{field.state.value ? "Active" : "Inactive"}
										</span>
									</div>
								)}
							</form.Field>
						</div>

						{/* Form fields */}
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<form.Field
								name="name"
								validators={{
									onChange: ({ value }) =>
										!value || value.trim().length === 0
											? "Organization name is required"
											: undefined,
								}}
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
												Organization Name{" "}
												<span className="text-destructive">*</span>
											</FieldLabel>
											<Input
												id={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="e.g., Nova Health"
											/>
											{isInvalid && (
												<FieldError>Organization name is required</FieldError>
											)}
										</Field>
									);
								}}
							</form.Field>

							<form.Field
								name="organizationType"
								validators={{
									onChange: ({ value }) =>
										!value || value.length === 0
											? "Organization type is required"
											: undefined,
								}}
							>
								{(field) => {
									const isInvalid = formFieldShowInvalid(
										field.state.meta.isTouched,
										field.state.meta.isValid,
										submissionAttempts,
									);
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel>
												Organization Type{" "}
												<span className="text-destructive">*</span>
											</FieldLabel>
											<Select
												value={field.state.value}
												onValueChange={(value) => field.handleChange(value)}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select type" />
												</SelectTrigger>
												<SelectContent>
													{ORGANIZATION_TYPE_OPTIONS.map((opt) => (
														<SelectItem key={opt.value} value={opt.value}>
															{opt.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											{isInvalid && (
												<FieldError>Organization type is required</FieldError>
											)}
										</Field>
									);
								}}
							</form.Field>

							<form.Field
								name="industry"
								validators={{
									onChange: ({ value }) =>
										!value || value.length === 0
											? "Industry is required"
											: undefined,
								}}
							>
								{(field) => {
									const isInvalid = formFieldShowInvalid(
										field.state.meta.isTouched,
										field.state.meta.isValid,
										submissionAttempts,
									);
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel>
												Organization Industry{" "}
												<span className="text-destructive">*</span>
											</FieldLabel>
											<Select
												value={field.state.value}
												onValueChange={(value) => field.handleChange(value)}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select industry" />
												</SelectTrigger>
												<SelectContent>
													{ORGANIZATION_INDUSTRY_OPTIONS.map((opt) => (
														<SelectItem key={opt.value} value={opt.value}>
															{opt.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											{isInvalid && (
												<FieldError>Industry is required</FieldError>
											)}
										</Field>
									);
								}}
							</form.Field>

							<form.Field
								name="email"
								validators={{
									onChange: ({ value }) =>
										!value || value.trim().length === 0
											? "Email is required"
											: undefined,
								}}
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
												Email <span className="text-destructive">*</span>
											</FieldLabel>
											<Input
												id={field.name}
												type="email"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="contact@organization.com"
											/>
											{isInvalid && <FieldError>Email is required</FieldError>}
										</Field>
									);
								}}
							</form.Field>

							<form.Field
								name="phone"
								validators={{
									onChange: ({ value }) =>
										!value || value.trim().length === 0
											? "Phone is required"
											: undefined,
								}}
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
												Organization Phone{" "}
												<span className="text-destructive">*</span>
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
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							</form.Field>

							<form.Field
								name="timeZone"
								validators={{
									onChange: ({ value }) =>
										!value || value.length === 0
											? "Timezone is required"
											: undefined,
								}}
							>
								{(field) => {
									const isInvalid = formFieldShowInvalid(
										field.state.meta.isTouched,
										field.state.meta.isValid,
										submissionAttempts,
									);
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel>
												Time Zone <span className="text-destructive">*</span>
											</FieldLabel>
											<Select
												value={field.state.value}
												onValueChange={(value) => field.handleChange(value)}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select timezone" />
												</SelectTrigger>
												<SelectContent>
													{TIMEZONE_OPTIONS.map((opt) => (
														<SelectItem key={opt.value} value={opt.value}>
															{opt.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											{isInvalid && (
												<FieldError>Timezone is required</FieldError>
											)}
										</Field>
									);
								}}
							</form.Field>

							<form.Field name="agreementRenewalDate">
								{(field) => (
									<Field>
										<FieldLabel htmlFor={field.name}>
											Agreement Renewal Date
										</FieldLabel>
										<DatePicker
											id={field.name}
											value={field.state.value}
											onChange={(v) => field.handleChange(v)}
											onBlur={field.handleBlur}
											placeholder="Pick a date"
										/>
									</Field>
								)}
							</form.Field>

							<form.Field name="website">
								{(field) => (
									<Field>
										<FieldLabel htmlFor={field.name}>Website</FieldLabel>
										<Input
											id={field.name}
											type="url"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="https://example.com"
										/>
									</Field>
								)}
							</form.Field>

							<form.Field name="expectedAnnualSpend">
								{(field) => (
									<Field>
										<FieldLabel htmlFor={field.name}>
											Expected Annual Spend
										</FieldLabel>
										<Input
											id={field.name}
											type="number"
											min={0}
											step="0.01"
											value={
												field.state.value != null
													? String(field.state.value)
													: ""
											}
											onBlur={field.handleBlur}
											onChange={(e) => {
												const v = e.target.value;
												field.handleChange(
													v === "" ? null : Number.parseFloat(v),
												);
											}}
											placeholder="0.00"
										/>
									</Field>
								)}
							</form.Field>
						</div>

						{/* Service Agreement */}
						<form.Field name="description">
							{(field) => (
								<ServiceAgreementSection
									agreementFile={agreementFile}
									agreementUploadDate={agreementUploadDate}
									onUploadClick={handleAgreementClick}
									onReplace={handleAgreementReplace}
									isPending={isPending}
									existingAgreementKey={organization.serviceAgreement}
									organizationId={organization.id}
									description={field.state.value ?? ""}
									onDescriptionChange={field.handleChange}
								/>
							)}
						</form.Field>
					</div>

					<form.Subscribe
						selector={(state) =>
							hasChanges(
								initialValues,
								state.values as UpdateOrganizationFormValues,
							) || hasFileChanges
						}
					>
						{(isDirty) => (
							<div className="mt-6 flex justify-end">
								<FormDialogFooter
									form={form}
									submitLabel="Update"
									submitLoadingLabel="Updating..."
									onCancel={isDirty ? () => form.reset() : undefined}
									isPending={isPending}
									cancelLabel="Discard Changes"
									disabled={!isDirty}
								/>
							</div>
						)}
					</form.Subscribe>
				</form>
			</CardContent>
		</Card>
	);
}
