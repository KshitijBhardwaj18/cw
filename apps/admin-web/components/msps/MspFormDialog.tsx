"use client";

import type { MspResponseType } from "@repo/shared";
import { formatDate, TIMEZONE_OPTIONS } from "@repo/shared";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { Checkbox } from "@repo/ui/components/checkbox";
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
import { Label } from "@repo/ui/components/label";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { Separator } from "@repo/ui/components/separator";
import { FormDialogFooter } from "@repo/ui/general/FormDialogFooter";
import { PhoneInput } from "@repo/ui/general/PhoneInput";
import { PostalAddressAutosuggestSection } from "@repo/ui/general/PostalAddressAutosuggestSection";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { formFieldShowInvalid } from "@repo/ui/lib/form-field-display";
import { useStore } from "@tanstack/react-form";
import {
	Download,
	ExternalLink,
	FileText,
	ImagePlus,
	Loader2,
	Upload,
} from "lucide-react";
import {
	MSP_INDUSTRY_OPTIONS,
	MSP_ORGANIZATION_TYPE_OPTIONS,
} from "@/constants/msp";
import { useMspForm } from "@/hooks/use-msp-form-dialog";
import {
	mspFormBillingPostalAutosuggestValidators,
	mspFormBillingPostalFieldBindings,
	mspFormHeadquartersPostalAutosuggestValidators,
	mspFormHeadquartersPostalFieldBindings,
} from "@/schemas/msp.schema";

type MspFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialMsp?: MspResponseType | null;
};

export function MspFormDialog({
	open,
	onOpenChange,
	initialMsp,
}: MspFormDialogProps) {
	const {
		form,
		logoInputRef,
		msaInputRef,
		logoPreview,
		msaFile,
		msaUploadDate,
		isPending,
		isEdit,
		msaSignedUrlMutation,
		handleOpenChange,
		handleLogoClick,
		handleLogoChange,
		handleMsaClick,
		handleMsaChange,
		handleMsaDownload,
		handleMsaView,
		handleMsaReplace,
		addMspSchemaBase,
	} = useMspForm({ open, onOpenChange, initialMsp });

	const submissionAttempts = useStore(
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<input
				ref={logoInputRef}
				type="file"
				accept=".png,.jpg,.jpeg,image/png,image/jpeg"
				className="hidden"
				onChange={handleLogoChange}
			/>
			<input
				ref={msaInputRef}
				type="file"
				accept=".pdf,application/pdf"
				className="hidden"
				onChange={handleMsaChange}
			/>
			<DialogContent className="max-h-[90vh] max-w-2xl p-0 overflow-hidden">
				<DialogHeader className="px-6 pt-6">
					<DialogTitle>{isEdit ? "Edit MSP" : "Add MSP"}</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update the Managed Service Provider details."
							: "Add a new Managed Service Provider with core profile, addresses, and agreement details."}
					</DialogDescription>
				</DialogHeader>
				<ScrollArea className="max-h-[calc(90vh-12rem)]">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							void form.handleSubmit();
						}}
						className="space-y-6 px-6 pb-6"
					>
						{/* MSP Core Profile Information */}
						<div className="space-y-4">
							<h3 className="text-base font-semibold">
								MSP Core Profile Information
							</h3>
							<FieldGroup>
								<form.Field
									name="mspName"
									validators={{
										onChange: addMspSchemaBase.shape.mspName,
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
													MSP Name <RequiredStar />
												</FieldLabel>
												<Input
													id={field.name}
													name={field.name}
													placeholder="Enter MSP name"
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

								<div className="space-y-2">
									<FieldLabel>MSP Logo</FieldLabel>
									<div className="flex items-center gap-4">
										<Avatar className="size-16">
											{logoPreview ? (
												<AvatarImage src={logoPreview} alt="MSP logo" />
											) : null}
											<form.Subscribe
												selector={(state) => state.values.mspName}
											>
												{(mspName) => (
													<AvatarFallback className="text-xl font-semibold">
														{mspName ? mspName.charAt(0).toUpperCase() : "M"}
													</AvatarFallback>
												)}
											</form.Subscribe>
										</Avatar>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={handleLogoClick}
											disabled={isPending}
										>
											<ImagePlus className="size-4" data-icon="inline-start" />
											Replace Logo
										</Button>
									</div>
									<p className="text-muted-foreground text-xs">
										PNG or JPEG, max 2MB.
									</p>
								</div>

								<form.Field
									name="industry"
									validators={{
										onChange: addMspSchemaBase.shape.industry,
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
														{MSP_INDUSTRY_OPTIONS.map((opt) => (
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

								<form.Field
									name="organizationType"
									validators={{
										onChange: addMspSchemaBase.shape.organizationType,
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
														<SelectValue placeholder="Select organization type" />
													</SelectTrigger>
													<SelectContent>
														{MSP_ORGANIZATION_TYPE_OPTIONS.map((opt) => (
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
							</FieldGroup>
						</div>

						<Separator />

						<div className="space-y-4">
							<h3 className="text-base font-semibold">
								Headquarters and Billing Addresses
							</h3>
							<FieldGroup>
								<PostalAddressAutosuggestSection
									form={form}
									fields={mspFormHeadquartersPostalFieldBindings}
									validators={mspFormHeadquartersPostalAutosuggestValidators}
								/>

								<form.Field name="billingSameAsHeadquarters">
									{(field) => (
										<div className="flex items-center gap-2 space-y-0 pt-2">
											<Checkbox
												id="billingSame"
												checked={field.state.value}
												onCheckedChange={(checked) =>
													field.handleChange(checked === true)
												}
											/>
											<Label
												htmlFor="billingSame"
												className="cursor-pointer font-normal"
											>
												Billing address same as headquarters
											</Label>
										</div>
									)}
								</form.Field>

								<form.Subscribe
									selector={(state) => state.values.billingSameAsHeadquarters}
								>
									{(billingSame) =>
										!billingSame && (
											<div className="space-y-4 rounded-lg border p-4">
												<h4 className="text-sm font-medium">Billing Address</h4>
												<PostalAddressAutosuggestSection
													form={form}
													fields={mspFormBillingPostalFieldBindings}
													validators={mspFormBillingPostalAutosuggestValidators}
												/>
											</div>
										)
									}
								</form.Subscribe>
							</FieldGroup>
						</div>

						<Separator />

						{/* Contact and Operational Details */}
						<div className="space-y-4">
							<h3 className="text-base font-semibold">
								Contact and Operational Details
							</h3>
							<FieldGroup>
								<form.Field
									name="phoneNumber"
									validators={{
										onChange: addMspSchemaBase.shape.phoneNumber,
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
													Phone Number <RequiredStar />
												</FieldLabel>
												<PhoneInput
													id={field.name}
													name={field.name}
													placeholder="Enter phone number"
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
										onChange: addMspSchemaBase.shape.timeZone,
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
													Time Zone <RequiredStar />
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
														<SelectValue placeholder="Select time zone" />
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
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								</form.Field>
							</FieldGroup>
						</div>

						<Separator />

						{/* Master Services Agreement (MSA) */}
						<div className="space-y-4">
							<h3 className="text-base font-semibold">
								Master Services Agreement (MSA)
							</h3>
							<form.Field
								name="msaFile"
								validators={{
									onSubmit: ({ value }) => {
										if (!form.state.values.hasMsaDocument && !value) {
											return "MSA document is required";
										}
										return undefined;
									},
								}}
							>
								{(msaField) => {
									const hasMsa =
										form.state.values.hasMsaDocument || !!msaField.state.value;
									const msaError =
										msaField.state.meta.errors.length > 0
											? msaField.state.meta.errors
											: null;
									return (
										<Field data-invalid={!!msaError}>
											{!hasMsa ? (
												<>
													<FieldLabel className="mb-2 block">
														MSA Document <RequiredStar />
													</FieldLabel>
													<Button
														type="button"
														variant="outline"
														className="w-full"
														onClick={handleMsaClick}
														disabled={isPending}
													>
														<Upload
															className="size-4"
															data-icon="inline-start"
														/>
														Upload MSA (PDF, max 10MB)
													</Button>
													{msaError && <FieldError errors={msaError} />}
												</>
											) : (
												<Card>
													<CardContent className="pt-6">
														<div className="space-y-4">
															<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
																<div>
																	<p className="text-muted-foreground text-xs">
																		MSA Document
																	</p>
																	<div className="mt-1 flex items-center gap-2">
																		<FileText className="size-4 shrink-0" />
																		<span className="truncate text-sm font-medium">
																			{msaFile?.name ??
																				initialMsp?.msaFileName ??
																				"Document on file"}
																		</span>
																	</div>
																</div>
																<div>
																	<p className="text-muted-foreground text-xs">
																		Upload Date
																	</p>
																	<p className="mt-1 text-sm font-medium">
																		{msaFile && msaUploadDate
																			? msaUploadDate
																			: initialMsp?.msaUploadedAt
																				? formatDate(initialMsp.msaUploadedAt)
																				: "—"}
																	</p>
																</div>
																<div>
																	<form.Field name="agreementRevisionDate">
																		{(field) => (
																			<Field>
																				<FieldLabel className="text-muted-foreground text-xs">
																					Agreement Revision Date
																				</FieldLabel>
																				<DatePicker
																					className="mt-1"
																					value={field.state.value}
																					onChange={(v) =>
																						field.handleChange(v)
																					}
																					placeholder="Pick a date"
																				/>
																			</Field>
																		)}
																	</form.Field>
																</div>
															</div>
															<div className="flex flex-wrap gap-2">
																<Button
																	type="button"
																	variant="outline"
																	size="sm"
																	onClick={handleMsaDownload}
																	disabled={msaSignedUrlMutation.isPending}
																>
																	{msaSignedUrlMutation.isPending ? (
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
																	Download MSA
																</Button>
																<Button
																	type="button"
																	variant="outline"
																	size="sm"
																	onClick={handleMsaView}
																	disabled={msaSignedUrlMutation.isPending}
																>
																	<ExternalLink
																		className="size-4"
																		data-icon="inline-start"
																	/>
																	View Agreement
																</Button>
																<Button
																	type="button"
																	variant="ghost"
																	size="sm"
																	onClick={handleMsaReplace}
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
							</form.Field>
						</div>

						<FormDialogFooter
							form={form as never}
							submitLabel={isEdit ? "Save Changes" : "Create MSP"}
							submitLoadingLabel={isEdit ? "Saving..." : "Creating..."}
							onCancel={() => handleOpenChange(false)}
							isPending={isPending}
						/>
					</form>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
