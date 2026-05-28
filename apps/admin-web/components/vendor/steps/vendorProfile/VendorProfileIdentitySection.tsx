"use client";

import {
	CERTIFIED_BUSINESS_CLASSIFICATION_OPTIONS,
	ORGANIZATION_INDUSTRY_OPTIONS,
	validateImageFile,
} from "@repo/shared";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import { FieldGroup, FieldLabel } from "@repo/ui/components/field";
import { Switch } from "@repo/ui/components/switch";
import {
	FormCheckboxGroup,
	FormInput,
	FormTextarea,
} from "@repo/ui/general/FormFields";
import { useRef } from "react";
import { toast } from "sonner";
import type { VendorProfileApi } from "@/hooks/use-vendor-profile";

interface VendorProfileIdentitySectionProps {
	form: VendorProfileApi;
	logoFile: File | null;
	logoPreview: string | null;
	setLogoFile: (file: File | null) => void;
	setLogoPreview: (url: string | null) => void;
}

export function VendorProfileIdentitySection({
	form,
	logoFile,
	logoPreview,
	setLogoFile,
	setLogoPreview,
}: Readonly<VendorProfileIdentitySectionProps>) {
	const logoInputRef = useRef<HTMLInputElement>(null);

	const handleLogoClick = () => logoInputRef.current?.click();

	const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const err = validateImageFile(file, "Logo");
		if (err) {
			toast.error(err);
			return;
		}
		setLogoFile(file);
		setLogoPreview(URL.createObjectURL(file));
		if (logoInputRef.current) logoInputRef.current.value = "";
	};

	const displayUrl = logoPreview ?? form.state.values.logoUrl;

	return (
		<FieldGroup>
			<input
				ref={logoInputRef}
				type="file"
				accept=".png,.jpg,.jpeg,image/png,image/jpeg"
				className="hidden"
				onChange={handleLogoChange}
			/>
			<div className="flex items-start justify-between">
				<div className="space-y-2">
					<FieldLabel>Vendor Logo</FieldLabel>
					<div className="flex items-center gap-4">
						<Avatar className="size-16">
							{displayUrl ? (
								<AvatarImage src={displayUrl} alt="Vendor logo" />
							) : null}
							<form.Subscribe selector={(state) => state.values.name}>
								{(name) => (
									<AvatarFallback className="text-xl font-semibold">
										{name ? name.charAt(0).toUpperCase() : "V"}
									</AvatarFallback>
								)}
							</form.Subscribe>
						</Avatar>
						<Button
							type="button"
							variant="link"
							className="text-primary"
							onClick={handleLogoClick}
						>
							{logoFile || displayUrl ? "Replace Logo" : "Upload Logo"}
						</Button>
					</div>
					<p className="text-muted-foreground text-xs">PNG or JPEG, max 2MB.</p>
				</div>
				<form.Field name="isActive">
					{(field) => (
						<div className="flex items-center gap-2">
							<span className="text-sm text-muted-foreground">Active</span>
							<Switch
								checked={field.state.value}
								onCheckedChange={(checked) => field.handleChange(checked)}
							/>
						</div>
					)}
				</form.Field>
			</div>

			<form.Field
				name="name"
				validators={{
					onBlur: ({ value }) =>
						!value ? "Vendor name is required" : undefined,
				}}
			>
				{(field) => (
					<FormInput
						field={field}
						label="Vendor Name"
						placeholder="Enter vendor name"
						required
					/>
				)}
			</form.Field>

			<form.Field
				name="industries"
				validators={{
					onChange: ({ value }) =>
						!value?.length ? "Select at least one industry" : undefined,
				}}
			>
				{(field) => (
					<FormCheckboxGroup
						field={field}
						label="Industries"
						options={ORGANIZATION_INDUSTRY_OPTIONS}
						idPrefix="industry"
						required
					/>
				)}
			</form.Field>

			<form.Field name="certifiedBusinessClassifications">
				{(field) => (
					<FormCheckboxGroup
						field={field}
						label="Certified Business Classifications"
						options={CERTIFIED_BUSINESS_CLASSIFICATION_OPTIONS}
						idPrefix="classification"
					/>
				)}
			</form.Field>

			<form.Field
				name="about"
				validators={{
					onBlur: ({ value }) =>
						value && value.length > 1000
							? "About must be 1000 characters or less"
							: undefined,
				}}
			>
				{(field) => (
					<FormTextarea
						field={field}
						label="About Vendor"
						placeholder="Description of the vendor..."
						maxLength={1000}
					/>
				)}
			</form.Field>
		</FieldGroup>
	);
}
