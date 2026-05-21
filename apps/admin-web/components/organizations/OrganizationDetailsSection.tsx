"use client";

import { TIMEZONE_OPTIONS } from "@repo/shared";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import { DatePicker } from "@repo/ui/components/date-picker";
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
import RequiredStar from "@repo/ui/general/RequiredStar";
import { formFieldShowInvalid } from "@repo/ui/lib/form-field-display";
import { useStore } from "@tanstack/react-form";
import { ImagePlus } from "lucide-react";
import {
	ORGANIZATION_INDUSTRY_OPTIONS,
	ORGANIZATION_TYPE_OPTIONS,
} from "@/constants/organization";
import { addOrganizationSchemaBase } from "@/schemas/organization.schema";
import { SlugPreviewField } from "./SlugPreviewField";

export type OrganizationDetailsForm = {
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
	Subscribe: (props: {
		selector: (state: { values: { organizationName?: string } }) => string;
		children: (orgName: string) => React.ReactNode;
	}) => React.ReactNode;
};

type OrganizationDetailsSectionProps = {
	form: OrganizationDetailsForm;
	logoFile: File | null;
	logoPreview: string | null;
	onLogoClick: () => void;
	isPending?: boolean;
	onSlugLoading?: (isLoading: boolean) => void;
	excludeOrganizationId?: string;
};

export function OrganizationDetailsSection({
	form,
	logoFile,
	logoPreview,
	onLogoClick,
	isPending = false,
	onSlugLoading,
	excludeOrganizationId,
}: OrganizationDetailsSectionProps) {
	const submissionAttempts = useStore(
		// OrganizationDetailsForm narrows the Field API; parent passes the full TanStack form.
		// @ts-expect-error -- store exists at runtime on the concrete form instance
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);
	return (
		<div className="space-y-4">
			<h3 className="text-base font-semibold">Organization Details</h3>
			<FieldGroup>
				<form.Field
					name="organizationName"
					validators={{
						onChange: addOrganizationSchemaBase.shape.organizationName,
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
									Organization Name <RequiredStar />
								</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									placeholder="Enter organization name"
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

				<form.Subscribe
					selector={(state) => state.values.organizationName ?? ""}
				>
					{(orgName) => (
						<SlugPreviewField
							orgName={orgName}
							excludeOrganizationId={excludeOrganizationId}
							onLoadingChange={onSlugLoading}
						/>
					)}
				</form.Subscribe>

				<div className="space-y-2">
					<FieldLabel>Organization Logo</FieldLabel>
					<div className="flex items-center gap-4">
						<Avatar className="size-16">
							{logoPreview ? (
								<AvatarImage src={logoPreview} alt="Organization logo" />
							) : null}
							<form.Subscribe
								selector={(state) => state.values.organizationName ?? ""}
							>
								{(orgName) => (
									<AvatarFallback className="text-xl font-semibold">
										{orgName ? orgName.charAt(0).toUpperCase() : "O"}
									</AvatarFallback>
								)}
							</form.Subscribe>
						</Avatar>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={onLogoClick}
							disabled={isPending}
						>
							<ImagePlus className="size-4" data-icon="inline-start" />
							{logoFile ? "Replace Logo" : "Upload Logo"}
						</Button>
					</div>
					<p className="text-muted-foreground text-xs">PNG, JPG — max 2MB.</p>
				</div>

				<form.Field
					name="email"
					validators={{
						onChange: addOrganizationSchemaBase.shape.email,
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
									Email <RequiredStar />
								</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									type="email"
									placeholder="contact@organization.com"
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

				<form.Field
					name="phone"
					validators={{
						onChange: addOrganizationSchemaBase.shape.phone,
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
									Phone <RequiredStar />
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

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<form.Field
						name="industry"
						validators={{
							onChange: addOrganizationSchemaBase.shape.industry,
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
										Industry <RequiredStar />
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
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<form.Field
						name="organizationType"
						validators={{
							onChange: addOrganizationSchemaBase.shape.organizationType,
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
										Organization Type <RequiredStar />
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
											{ORGANIZATION_TYPE_OPTIONS.map((opt) => (
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
				</div>

				<form.Field
					name="timeZone"
					validators={{
						onChange: addOrganizationSchemaBase.shape.timeZone,
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
									Timezone <RequiredStar />
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
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<form.Field name="website">
						{(field) => (
							<Field>
								<FieldLabel htmlFor={field.name}>Website</FieldLabel>
								<Input
									id={field.name}
									type="url"
									placeholder="https://example.com"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</Field>
						)}
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
									placeholder="Pick a date"
								/>
							</Field>
						)}
					</form.Field>
				</div>
			</FieldGroup>
		</div>
	);
}
