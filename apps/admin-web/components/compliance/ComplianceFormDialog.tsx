"use client";

import type { ComplianceResponseType } from "@repo/shared";
import {
	type ComplianceListItemCategory,
	ComplianceListItemExpirationType,
	ComplianceListItemResponseStyle,
	ComplianceListItemStatus,
	type ExpirationRuleUnit,
} from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
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
import { Label } from "@repo/ui/components/label";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { Textarea } from "@repo/ui/components/textarea";
import RequiredStar from "@repo/ui/general/RequiredStar";
import {
	Download,
	ExternalLink,
	FileText,
	Loader2,
	Upload,
} from "lucide-react";
import {
	COMPLIANCE_CATEGORY_OPTIONS,
	COMPLIANCE_EXPIRATION_RULE_UNIT_OPTIONS,
	COMPLIANCE_EXPIRATION_TYPE_OPTIONS,
	COMPLIANCE_RESPONSE_STYLE_OPTIONS,
} from "@/constants/compliance";
import { useComplianceFormDialog } from "@/hooks/use-compliance-form-dialog";
import { ComplianceFormBaseSchema } from "@/schemas/compliance.schema";

export interface ComplianceFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	item?: ComplianceResponseType;
}

export function ComplianceFormDialog({
	open,
	onOpenChange,
	item,
}: ComplianceFormDialogProps) {
	const {
		form,
		fileInputRef,
		complianceFile,
		complianceFileUploadDate,
		hasFile,
		isPending,
		isEdit,
		signedUrlMutation,
		handleOpenChange,
		handleFileClick,
		handleFileChange,
		handleFileDownload,
		handleFileView,
		handleFileReplace,
		clearFileOnResponseStyleChange,
	} = useComplianceFormDialog({ open, onOpenChange, item });

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<input
				ref={fileInputRef}
				type="file"
				accept=".pdf,application/pdf"
				className="hidden"
				onChange={handleFileChange}
			/>
			<DialogContent className="max-h-[90vh] max-w-2xl overflow-y-hidden">
				<DialogHeader>
					<DialogTitle>Compliance List Item</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update the compliance item details below."
							: "Add a new compliance item that can be used in templates."}
					</DialogDescription>
				</DialogHeader>
				<ScrollArea className="max-h-[calc(90vh-12rem)]">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							void form.handleSubmit();
						}}
						className="space-y-5"
					>
						<FieldGroup>
							<div className="grid grid-cols-2 gap-4">
								<form.Field
									name="name"
									validators={{ onChange: ComplianceFormBaseSchema.shape.name }}
								>
									{(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>
													Compliance Item Name <RequiredStar />
												</FieldLabel>
												<Input
													id={field.name}
													name={field.name}
													placeholder="e.g., Drivers License, RN License"
													disabled={isPending}
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

								<form.Field name="category">
									{(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>
													Category <RequiredStar />
												</FieldLabel>
												<Select
													value={field.state.value}
													onValueChange={(val) =>
														field.handleChange(
															val as ComplianceListItemCategory,
														)
													}
												>
													<SelectTrigger
														id={field.name}
														className="w-full"
														disabled={isPending}
													>
														<SelectValue placeholder="Select category" />
													</SelectTrigger>
													<SelectContent>
														{COMPLIANCE_CATEGORY_OPTIONS.map((opt) => (
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
							</div>

							<form.Field name="expirationType">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>
												Expiration Type <RequiredStar />
											</FieldLabel>
											<Select
												value={field.state.value}
												onValueChange={(val) => {
													field.handleChange(
														val as ComplianceListItemExpirationType,
													);
													form.setFieldValue("expirationRuleValue", null);
													form.setFieldValue("expirationRuleUnit", null);
												}}
											>
												<SelectTrigger
													id={field.name}
													className="w-full"
													disabled={isPending}
												>
													<SelectValue placeholder="Select expiration type" />
												</SelectTrigger>
												<SelectContent>
													{COMPLIANCE_EXPIRATION_TYPE_OPTIONS.map((opt) => (
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

							<form.Subscribe selector={(s) => s.values.expirationType}>
								{(expirationType) =>
									expirationType ===
									ComplianceListItemExpirationType.EXPIRATION_RULE ? (
										<Field>
											<FieldLabel>
												Expiration Rule <RequiredStar />
											</FieldLabel>
											<div className="flex items-center gap-3">
												<span className="text-muted-foreground shrink-0 text-sm">
													Expires
												</span>
												<form.Field name="expirationRuleValue">
													{(field) => {
														const isInvalid =
															field.state.meta.isTouched &&
															!field.state.meta.isValid;
														return (
															<Field data-invalid={isInvalid} className="w-24">
																<Input
																	id={field.name}
																	name={field.name}
																	type="number"
																	min={1}
																	placeholder="365"
																	disabled={isPending}
																	value={field.state.value ?? ""}
																	onBlur={field.handleBlur}
																	onChange={(e) =>
																		field.handleChange(
																			e.target.value
																				? Number(e.target.value)
																				: null,
																		)
																	}
																	aria-invalid={isInvalid}
																/>
																{isInvalid && (
																	<FieldError
																		errors={field.state.meta.errors}
																	/>
																)}
															</Field>
														);
													}}
												</form.Field>
												<span className="text-muted-foreground shrink-0 text-sm">
													In
												</span>
												<form.Field name="expirationRuleUnit">
													{(field) => {
														const isInvalid =
															field.state.meta.isTouched &&
															!field.state.meta.isValid;
														return (
															<Field data-invalid={isInvalid} className="w-36">
																<Select
																	value={field.state.value ?? undefined}
																	onValueChange={(val) =>
																		field.handleChange(
																			val as ExpirationRuleUnit,
																		)
																	}
																>
																	<SelectTrigger
																		disabled={isPending}
																		className="w-full"
																	>
																		<SelectValue placeholder="Unit" />
																	</SelectTrigger>
																	<SelectContent>
																		{COMPLIANCE_EXPIRATION_RULE_UNIT_OPTIONS.map(
																			(opt) => (
																				<SelectItem
																					key={opt.value}
																					value={opt.value}
																				>
																					{opt.label}
																				</SelectItem>
																			),
																		)}
																	</SelectContent>
																</Select>
																{isInvalid && (
																	<FieldError
																		errors={field.state.meta.errors}
																	/>
																)}
															</Field>
														);
													}}
												</form.Field>
												<span className="text-muted-foreground shrink-0 text-sm">
													from the original completion date
												</span>
											</div>
										</Field>
									) : null
								}
							</form.Subscribe>

							<form.Field name="issuerRequirement">
								{(field) => (
									<div className="flex items-center gap-2.5">
										<Checkbox
											id={field.name}
											checked={field.state.value}
											disabled={isPending}
											onCheckedChange={(checked) => {
												field.handleChange(checked === true);
												if (!checked) {
													form.setFieldValue("issuer", null);
												}
											}}
										/>
										<Label
											htmlFor={field.name}
											className="cursor-pointer font-normal"
										>
											Issuer Requirement
										</Label>
									</div>
								)}
							</form.Field>

							<form.Subscribe selector={(s) => s.values.issuerRequirement}>
								{(issuerRequirement) =>
									issuerRequirement ? (
										<form.Field name="issuer">
											{(field) => {
												const isInvalid =
													field.state.meta.isTouched &&
													!field.state.meta.isValid;
												return (
													<Field data-invalid={isInvalid}>
														<FieldLabel htmlFor={field.name}>
															Issuer Type <RequiredStar />
														</FieldLabel>
														<Input
															id={field.name}
															name={field.name}
															placeholder="e.g., Candidate, Employer, Third Party"
															disabled={isPending}
															value={field.state.value ?? ""}
															onBlur={field.handleBlur}
															onChange={(e) =>
																field.handleChange(e.target.value || null)
															}
															aria-invalid={isInvalid}
														/>
														{isInvalid && (
															<FieldError errors={field.state.meta.errors} />
														)}
													</Field>
												);
											}}
										</form.Field>
									) : null
								}
							</form.Subscribe>

							{/* Response Style - own row */}
							<form.Field name="responseStyle">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>
												Response Style <RequiredStar />
											</FieldLabel>
											<Select
												value={field.state.value}
												onValueChange={(val) => {
													field.handleChange(
														val as ComplianceListItemResponseStyle,
													);
													const needsFile =
														val ===
															ComplianceListItemResponseStyle.DOWNLOAD_AND_UPLOAD ||
														val === ComplianceListItemResponseStyle.LINK;
													if (!needsFile) {
														clearFileOnResponseStyleChange();
													}
												}}
											>
												<SelectTrigger
													id={field.name}
													className="w-full"
													disabled={isPending}
												>
													<SelectValue placeholder="Select response style" />
												</SelectTrigger>
												<SelectContent>
													{COMPLIANCE_RESPONSE_STYLE_OPTIONS.map((opt) => (
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

							{/* File Upload / Link URL - new row */}
							<form.Subscribe selector={(s) => s.values.responseStyle}>
								{(responseStyle) => {
									const showDownloadAndUpload =
										responseStyle ===
										ComplianceListItemResponseStyle.DOWNLOAD_AND_UPLOAD;
									const showLinkOnly =
										responseStyle === ComplianceListItemResponseStyle.LINK;
									const showFileSection = showDownloadAndUpload || showLinkOnly;

									if (!showFileSection) return null;

									return (
										<Field>
											<FieldLabel>
												{showLinkOnly ? "Link URL" : "File Upload or Link URL"}{" "}
												<RequiredStar />
											</FieldLabel>
											{showLinkOnly ? (
												<form.Field name="file">
													{(field) => {
														const isInvalid =
															field.state.meta.isTouched &&
															!field.state.meta.isValid;
														return (
															<Field data-invalid={isInvalid}>
																<Input
																	id={field.name}
																	name={field.name}
																	type="url"
																	placeholder="https://example.com"
																	disabled={isPending}
																	value={field.state.value ?? ""}
																	onBlur={field.handleBlur}
																	onChange={(e) =>
																		field.handleChange(e.target.value || null)
																	}
																	aria-invalid={isInvalid}
																/>
																{isInvalid && (
																	<FieldError
																		errors={field.state.meta.errors}
																	/>
																)}
															</Field>
														);
													}}
												</form.Field>
											) : !hasFile ? (
												<div className="space-y-2">
													<Button
														type="button"
														variant="outline"
														className="w-full"
														onClick={handleFileClick}
														disabled={isPending}
													>
														<Upload
															className="size-4"
															data-icon="inline-start"
														/>
														Upload File (PDF, max 10MB)
													</Button>
													<p className="text-muted-foreground text-xs">
														Or provide a link URL below
													</p>
													<form.Field name="file">
														{(field) => {
															const isInvalid =
																field.state.meta.isTouched &&
																!field.state.meta.isValid;
															return (
																<Field data-invalid={isInvalid}>
																	<Input
																		id={field.name}
																		name={field.name}
																		type="url"
																		placeholder="https://example.com/document.pdf"
																		disabled={isPending}
																		value={
																			field.state.value === "__file_provided__"
																				? ""
																				: (field.state.value ?? "")
																		}
																		onBlur={field.handleBlur}
																		onChange={(e) =>
																			field.handleChange(e.target.value || null)
																		}
																		aria-invalid={isInvalid}
																	/>
																	{isInvalid && (
																		<FieldError
																			errors={field.state.meta.errors}
																		/>
																	)}
																</Field>
															);
														}}
													</form.Field>
												</div>
											) : (
												<Card>
													<CardContent>
														<div className="space-y-4">
															<div className="grid gap-4 sm:grid-cols-2">
																<div>
																	<p className="text-muted-foreground text-xs">
																		Document
																	</p>
																	<div className="mt-1 flex items-center gap-2">
																		<FileText className="size-4 shrink-0" />
																		<span className="truncate text-sm font-medium">
																			{complianceFile?.name ??
																				"Compliance Document"}
																		</span>
																	</div>
																</div>
																{complianceFile && complianceFileUploadDate ? (
																	<div>
																		<p className="text-muted-foreground text-xs">
																			Upload Date
																		</p>
																		<p className="mt-1 text-sm font-medium">
																			{complianceFileUploadDate}
																		</p>
																	</div>
																) : null}
															</div>
															<div className="flex flex-wrap gap-2">
																<Button
																	type="button"
																	variant="outline"
																	size="sm"
																	onClick={handleFileDownload}
																	disabled={signedUrlMutation.isPending}
																>
																	{signedUrlMutation.isPending ? (
																		<Loader2
																			className="size-4 animate-spin"
																			data-icon="inline-start"
																		/>
																	) : (
																		<Download
																			className="size-4"
																			data-icon="inline-start"
																		/>
																	)}
																	Download
																</Button>
																<Button
																	type="button"
																	variant="outline"
																	size="sm"
																	onClick={handleFileView}
																	disabled={signedUrlMutation.isPending}
																>
																	<ExternalLink
																		className="size-4"
																		data-icon="inline-start"
																	/>
																	View
																</Button>
																<Button
																	type="button"
																	variant="ghost"
																	size="sm"
																	onClick={handleFileReplace}
																>
																	Replace
																</Button>
															</div>
														</div>
													</CardContent>
												</Card>
											)}
										</Field>
									);
								}}
							</form.Subscribe>

							<form.Field name="instructionalNotes">
								{(field) => (
									<Field>
										<FieldLabel htmlFor={field.name}>
											Instructional Notes
										</FieldLabel>
										<Textarea
											id={field.name}
											name={field.name}
											placeholder="Enter any instructional notes for candidates..."
											rows={3}
											disabled={isPending}
											value={field.state.value ?? ""}
											onBlur={field.handleBlur}
											onChange={(e) =>
												field.handleChange(
													e.target.value === "" ? null : e.target.value,
												)
											}
										/>
									</Field>
								)}
							</form.Field>

							<form.Field name="displayToCandidate">
								{(field) => (
									<div className="flex items-center gap-2.5">
										<Checkbox
											id={field.name}
											checked={field.state.value}
											disabled={isPending}
											onCheckedChange={(checked) =>
												field.handleChange(checked === true)
											}
										/>
										<Label
											htmlFor={field.name}
											className="cursor-pointer font-normal"
										>
											Display To Candidate{" "}
											<span className="text-muted-foreground text-sm">
												(Show in candidate portal compliance wallet)
											</span>
										</Label>
									</div>
								)}
							</form.Field>

							<form.Field name="status">
								{(field) => (
									<div className="flex items-center gap-2.5">
										<Checkbox
											id={field.name}
											checked={
												field.state.value === ComplianceListItemStatus.ACTIVE
											}
											disabled={isPending}
											onCheckedChange={(checked) =>
												field.handleChange(
													checked
														? ComplianceListItemStatus.ACTIVE
														: ComplianceListItemStatus.INACTIVE,
												)
											}
										/>
										<Label
											htmlFor={field.name}
											className="cursor-pointer font-normal"
										>
											Active
										</Label>
									</div>
								)}
							</form.Field>
						</FieldGroup>

						<DialogFooter className="sm:justify-start">
							<form.Subscribe
								selector={(state) => ({
									canSubmit: state.canSubmit,
									isSubmitting: state.isSubmitting,
									isDirty: state.isDirty,
								})}
							>
								{({ canSubmit, isSubmitting, isDirty }) => (
									<Button
										type="submit"
										disabled={
											!canSubmit ||
											isSubmitting ||
											isPending ||
											(isEdit && !isDirty && !complianceFile)
										}
									>
										{isSubmitting || isPending ? (
											<>
												<Loader2 className="h-4 w-4 animate-spin" />
												{isEdit ? "Saving..." : "Creating..."}
											</>
										) : isEdit ? (
											"Update Compliance Item"
										) : (
											"Create Compliance Item"
										)}
									</Button>
								)}
							</form.Subscribe>
							<Button
								type="button"
								variant="outline"
								onClick={() => handleOpenChange(false)}
								disabled={isPending}
							>
								Cancel
							</Button>
						</DialogFooter>
					</form>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
