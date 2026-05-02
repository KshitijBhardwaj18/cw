"use client";

import type { OrganizationVendorWithVendorType } from "@repo/shared";

/** Extended type for form dialog - includes contract fields from API */
type OrganizationVendorForForm = OrganizationVendorWithVendorType & {
	contractDocumentKey?: string | null;
	contractFileName?: string | null;
};

import { DatePicker } from "@repo/ui/components/date-picker";
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
import { Textarea } from "@repo/ui/components/textarea";
import { DocumentUploadCard } from "@repo/ui/general/DocumentUploadCard";
import { FormDialogFooter } from "@repo/ui/general/FormDialogFooter";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { useOrganizationVendorFormDialog } from "@/hooks/use-organization-vendor-form-dialog";
import { organizationVendorFormSchema } from "@/schemas/organization-vendor.schema";

const CONTRACT_ACCEPT =
	".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

type OrganizationVendorFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	organizationId: string;
	initialOrganizationVendor?: OrganizationVendorForForm | null;
	viewOnly?: boolean;
};

export function OrganizationVendorFormDialog({
	open,
	onOpenChange,
	organizationId,
	initialOrganizationVendor,
	viewOnly = false,
}: OrganizationVendorFormDialogProps) {
	const {
		form,
		isEdit,
		isPending,
		viewOnly: isViewOnly,
		handleOpenChange,
		contractInputRef,
		contractFile,
		handleContractClick,
		handleContractChange,
		handleContractReplace,
		statusOptions,
		search,
		setSearch,
		listRef,
		handleListScroll,
		signedUrlMutation,
		availableVendors,
		isLoadingVendors: isLoading,
		isFetchingNextPage,
		handleSelectVendor,
	} = useOrganizationVendorFormDialog({
		open,
		onOpenChange,
		organizationId,
		initialOrganizationVendor,
		viewOnly,
	});

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="max-w-lg">
				<input
					ref={contractInputRef}
					type="file"
					accept={CONTRACT_ACCEPT}
					className="hidden"
					onChange={handleContractChange}
				/>
				<DialogHeader>
					<DialogTitle>
						{isViewOnly ? "View Vendor" : isEdit ? "Edit Vendor" : "Add Vendor"}
					</DialogTitle>
					{(isEdit || isViewOnly) && initialOrganizationVendor?.vendor && (
						<p className="text-muted-foreground text-sm font-medium">
							{initialOrganizationVendor.vendor.name}
							{initialOrganizationVendor.vendor.internalId && (
								<span className="ml-1.5 font-normal">
									({initialOrganizationVendor.vendor.internalId})
								</span>
							)}
						</p>
					)}
					<DialogDescription>
						{isViewOnly
							? "View Vendor details."
							: isEdit
								? "Update vendor  details."
								: "Add a vendor to this organization."}
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
						{!isEdit && !isViewOnly && (
							<form.Field
								name="vendorId"
								validators={{
									onChange: organizationVendorFormSchema.shape.vendorId,
								}}
							>
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>
												Vendor <RequiredStar />
											</FieldLabel>
											<div className="relative mb-1">
												<Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
												<Input
													id={field.name}
													placeholder="Search vendors..."
													className="pl-9"
													value={search}
													onChange={(e) => setSearch(e.target.value)}
												/>
											</div>
											<div
												ref={listRef}
												onScroll={handleListScroll}
												className="max-h-36 overflow-y-auto rounded-md border"
											>
												{isLoading && (
													<div className="text-muted-foreground flex items-center justify-center py-6 text-sm">
														<Loader2 className="mr-2 size-4 animate-spin" />
														Loading vendors...
													</div>
												)}
												{!isLoading && availableVendors.length === 0 && (
													<p className="text-muted-foreground py-6 text-center text-sm">
														No vendors found.
													</p>
												)}
												{availableVendors.map((vendor) => {
													const isSelected = field.state.value === vendor.id;
													return (
														<button
															key={vendor.id}
															type="button"
															className={`flex w-full items-center gap-3 border-b px-4 py-3 text-left last:border-b-0 hover:bg-muted/50 ${isSelected ? "bg-primary/5" : ""}`}
															onClick={() => handleSelectVendor(vendor.id)}
														>
															<span
																className={`mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border-2 ${isSelected ? "border-primary" : "border-muted-foreground/40"}`}
															>
																{isSelected && (
																	<span className="bg-primary size-2 rounded-full" />
																)}
															</span>
															<span className="min-w-0">
																<span className="block font-medium text-sm">
																	{vendor.name}
																</span>
																{vendor.internalId && (
																	<span className="text-muted-foreground block text-xs">
																		{vendor.internalId}
																	</span>
																)}
															</span>
														</button>
													);
												})}
												{isFetchingNextPage && (
													<div className="text-muted-foreground flex items-center justify-center py-2 text-xs">
														<Loader2 className="mr-1.5 size-3 animate-spin" />
														Loading more...
													</div>
												)}
											</div>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							</form.Field>
						)}

						<form.Field
							name="status"
							validators={{
								onChange: organizationVendorFormSchema.shape.status,
							}}
						>
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>
											Status <RequiredStar />
										</FieldLabel>
										<Select
											value={field.state.value}
											onValueChange={field.handleChange}
											disabled={isViewOnly}
										>
											<SelectTrigger
												id={field.name}
												className="w-full"
												aria-invalid={isInvalid}
											>
												<SelectValue placeholder="Select status" />
											</SelectTrigger>
											<SelectContent>
												{statusOptions.map((opt) => (
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

						<form.Field name="startDate">
							{(field) => (
								<Field>
									<FieldLabel htmlFor={field.name}>Start Date</FieldLabel>
									<DatePicker
										id={field.name}
										value={field.state.value}
										onChange={(v) => field.handleChange(v)}
										onBlur={field.handleBlur}
										disabled={isViewOnly}
										placeholder="Pick a date"
									/>
								</Field>
							)}
						</form.Field>

						{(initialOrganizationVendor?.contractDocumentKey ||
							contractFile ||
							!isViewOnly) && (
							<DocumentUploadCard
								label="Contract Document"
								uploadButtonText="Upload File (PDF, DOC, DOCX max 10MB)"
								hint="PDF, DOC, DOCX — max 10MB"
								file={contractFile}
								existingFileName={initialOrganizationVendor?.contractFileName}
								hasExistingDocument={
									!!initialOrganizationVendor?.contractDocumentKey
								}
								onUploadClick={handleContractClick}
								onReplace={handleContractReplace}
								isPending={isPending}
								viewOnly={isViewOnly}
								onViewExisting={
									initialOrganizationVendor?.contractDocumentKey &&
									!contractFile
										? () =>
												signedUrlMutation.mutate(
													{
														organizationId,
														organizationVendorId: initialOrganizationVendor.id,
													},
													{
														onSuccess: ({ signedUrl }) => {
															window.open(signedUrl, "_blank");
														},
														onError: (err) => {
															toast.error(
																err instanceof Error
																	? err.message
																	: "Failed to load contract",
															);
														},
													},
												)
										: undefined
								}
								isPendingSignedUrl={signedUrlMutation.isPending}
							/>
						)}

						<form.Field name="notes">
							{(field) => (
								<Field>
									<FieldLabel htmlFor={field.name}>Notes</FieldLabel>
									<Textarea
										id={field.name}
										placeholder="Optional notes..."
										rows={4}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										disabled={isViewOnly}
									/>
								</Field>
							)}
						</form.Field>
					</FieldGroup>

					{!isViewOnly && (
						<FormDialogFooter
							form={form}
							submitLabel={isEdit ? "Save Changes" : "Add Vendor"}
							submitLoadingLabel={isEdit ? "Saving..." : "Adding..."}
							onCancel={() => handleOpenChange(false)}
							isPending={isPending}
						/>
					)}
				</form>
			</DialogContent>
		</Dialog>
	);
}
