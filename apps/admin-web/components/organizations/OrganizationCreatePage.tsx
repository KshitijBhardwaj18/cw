"use client";
import { Separator } from "@repo/ui/components/separator";
import { FormDialogFooter } from "@repo/ui/general/FormDialogFooter";
import { useState } from "react";
import { useOrganizationCreatePage } from "@/hooks/use-organization-form-dialog";
import type { LocationBlockForm } from "./LocationBlock";
import {
	LocationsSection,
	type LocationsSectionForm,
} from "./LocationsSection";
import {
	type OrganizationDetailsForm,
	OrganizationDetailsSection,
} from "./OrganizationDetailsSection";
import { ServiceAgreementSection } from "./ServiceAgreementSection";

const LOGO_ACCEPT = ".png,.jpg,.jpeg,image/png,image/jpeg";
const AGREEMENT_ACCEPT =
	".pdf,.csv,.xlsx,.xls,image/png,image/jpeg,.png,.jpg,.jpeg,application/pdf,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export function OrganizationCreatePage() {
	const {
		form,
		logoInputRef,
		agreementInputRef,
		logoFile,
		logoPreview,
		agreementFile,
		agreementUploadDate,
		isPending,
		handleOpenChange,
		handleLogoClick,
		handleLogoChange,
		handleAgreementClick,
		handleAgreementChange,
		handleAgreementReplace,
		defaultLocation,
	} = useOrganizationCreatePage();

	const [isSlugLoading, setIsSlugLoading] = useState(false);

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-2xl font-bold">Create Organization</h2>
					<p className="text-muted-foreground text-sm">
						Create a new organization with core details and at least one
						location.
					</p>
				</div>
			</div>
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
			<form
				onSubmit={(e) => {
					e.preventDefault();
					void form.handleSubmit();
				}}
				className="space-y-6"
			>
				<OrganizationDetailsSection
					form={form as OrganizationDetailsForm}
					logoFile={logoFile}
					logoPreview={logoPreview}
					onLogoClick={handleLogoClick}
					isPending={isPending}
					onSlugLoading={setIsSlugLoading}
				/>

				<Separator />

				<form.Field name="description">
					{(field) => (
						<ServiceAgreementSection
							agreementFile={agreementFile}
							agreementUploadDate={agreementUploadDate}
							onUploadClick={handleAgreementClick}
							onReplace={handleAgreementReplace}
							isPending={isPending}
							description={field.state.value ?? ""}
							onDescriptionChange={field.handleChange}
						/>
					)}
				</form.Field>

				<Separator />

				<LocationsSection
					form={form as LocationsSectionForm & LocationBlockForm}
					defaultLocation={defaultLocation}
					isPending={isPending}
				/>

				<FormDialogFooter
					form={form}
					submitLabel="Create Organization"
					submitLoadingLabel="Creating..."
					onCancel={() => handleOpenChange(false)}
					isPending={isPending}
					disabled={isSlugLoading}
				/>
			</form>
		</div>
	);
}
