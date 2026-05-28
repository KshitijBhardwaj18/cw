"use client";

import { DelayUnit } from "@repo/shared";
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
import { Skeleton } from "@repo/ui/components/skeleton";
import { Switch } from "@repo/ui/components/switch";
import { FormDialogFooter } from "@repo/ui/general/FormDialogFooter";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { formFieldShowInvalid } from "@repo/ui/lib/form-field-display";
import { useStore } from "@tanstack/react-form";
import { DELAY_UNIT_OPTIONS, SHIFT_TYPE_OPTIONS } from "@/constants/shifts";
import { useShiftTemplateFormDialog } from "@/hooks/use-shift-template-form-dialog";
import { useShiftRoutingSettings } from "@/queries/shift-routing.queries";
import {
	useShiftTemplateDepartments,
	useShiftTemplateLocations,
	useShiftTemplateOccupations,
} from "@/queries/shift-templates.queries";
import type { ShiftTemplateFormValues } from "@/schemas/shift-template.schema";

interface ShiftTemplateFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialValues?: Partial<ShiftTemplateFormValues> | null;
	onSubmit: (values: ShiftTemplateFormValues) => Promise<void>;
	isSubmitting?: boolean;
}

export function ShiftTemplateFormDialog({
	open,
	onOpenChange,
	initialValues,
	onSubmit,
	isSubmitting,
}: Readonly<ShiftTemplateFormDialogProps>) {
	const { form, isEdit, handleOpenChange } = useShiftTemplateFormDialog({
		open,
		onOpenChange,
		initialValues,
		onSubmit,
	});

	const submissionAttempts = useStore(
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);

	const { data: occupations = [], isLoading: loadingOccupations } =
		useShiftTemplateOccupations();
	const { data: departments = [], isLoading: loadingDepartments } =
		useShiftTemplateDepartments();
	const { data: locations = [], isLoading: loadingLocations } =
		useShiftTemplateLocations();
	const { data: routingData } = useShiftRoutingSettings();
	const routingSettings = routingData?.settings;

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden p-0">
				<DialogHeader className="px-6 pt-6">
					<DialogTitle>
						{isEdit ? "Edit Shift Template" : "Create Shift Template"}
					</DialogTitle>
					<DialogDescription>
						Define reusable shift configuration
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						void form.handleSubmit();
					}}
					className="flex flex-col"
				>
					<ScrollArea className="max-h-[calc(90vh-12rem)]">
						<div className="space-y-6 px-6 pb-6">
							<FieldGroup>
								<form.Field name="templateName">
									{(field) => (
										<Field
											data-invalid={formFieldShowInvalid(
												field.state.meta.isTouched,
												field.state.meta.isValid,
												submissionAttempts,
											)}
										>
											<FieldLabel htmlFor={field.name}>
												Template Name <RequiredStar />
											</FieldLabel>
											<Input
												id={field.name}
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												onBlur={field.handleBlur}
												placeholder="e.g., ICU Day Shift - RN"
											/>
											<FieldError errors={field.state.meta.errors} />
										</Field>
									)}
								</form.Field>

								<form.Field name="occupationId">
									{(field) => (
										<Field
											data-invalid={formFieldShowInvalid(
												field.state.meta.isTouched,
												field.state.meta.isValid,
												submissionAttempts,
											)}
										>
											<FieldLabel>
												Occupation <RequiredStar />
											</FieldLabel>
											{loadingOccupations ? (
												<Skeleton className="h-9 w-full" />
											) : (
												<Select
													value={field.state.value}
													onValueChange={(v) => field.handleChange(v)}
												>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select Occupation" />
													</SelectTrigger>
													<SelectContent>
														{occupations.map((o) => (
															<SelectItem key={o.id} value={o.id}>
																{o.name}
																{o.acronym ? ` (${o.acronym})` : ""}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											)}
											<FieldError errors={field.state.meta.errors} />
										</Field>
									)}
								</form.Field>

								<form.Field name="locationId">
									{(field) => (
										<Field
											data-invalid={formFieldShowInvalid(
												field.state.meta.isTouched,
												field.state.meta.isValid,
												submissionAttempts,
											)}
										>
											<FieldLabel>
												Location <RequiredStar />
											</FieldLabel>
											{loadingLocations ? (
												<Skeleton className="h-9 w-full" />
											) : (
												<Select
													value={field.state.value}
													onValueChange={(v) => field.handleChange(v)}
												>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select Location" />
													</SelectTrigger>
													<SelectContent>
														{locations.map((l) => (
															<SelectItem key={l.id} value={l.id}>
																{l.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											)}
											<FieldError errors={field.state.meta.errors} />
										</Field>
									)}
								</form.Field>

								<form.Field name="departmentId">
									{(field) => (
										<Field
											data-invalid={formFieldShowInvalid(
												field.state.meta.isTouched,
												field.state.meta.isValid,
												submissionAttempts,
											)}
										>
											<FieldLabel>
												Department <RequiredStar />
											</FieldLabel>
											{loadingDepartments ? (
												<Skeleton className="h-9 w-full" />
											) : (
												<Select
													value={field.state.value}
													onValueChange={(v) => field.handleChange(v)}
												>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select Department" />
													</SelectTrigger>
													<SelectContent>
														{departments.map((d) => (
															<SelectItem key={d.id} value={d.id}>
																{d.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											)}
											<FieldError errors={field.state.meta.errors} />
										</Field>
									)}
								</form.Field>

								<form.Field name="shiftType">
									{(field) => (
										<Field
											data-invalid={formFieldShowInvalid(
												field.state.meta.isTouched,
												field.state.meta.isValid,
												submissionAttempts,
											)}
										>
											<FieldLabel>
												Shift Type <RequiredStar />
											</FieldLabel>
											<Select
												value={field.state.value}
												onValueChange={(v) =>
													field.handleChange(
														v as ShiftTemplateFormValues["shiftType"],
													)
												}
											>
												<SelectTrigger className="w-full">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{SHIFT_TYPE_OPTIONS.map((o) => (
														<SelectItem key={o.value} value={o.value}>
															{o.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FieldError errors={field.state.meta.errors} />
										</Field>
									)}
								</form.Field>

								<form.Field name="durationHours">
									{(field) => (
										<Field
											data-invalid={formFieldShowInvalid(
												field.state.meta.isTouched,
												field.state.meta.isValid,
												submissionAttempts,
											)}
										>
											<FieldLabel htmlFor={field.name}>
												Duration (hours) <RequiredStar />
											</FieldLabel>
											<Input
												id={field.name}
												type="number"
												min={0.5}
												max={24}
												step={0.5}
												value={String(field.state.value)}
												onChange={(e) =>
													field.handleChange(
														e.target.value ? Number(e.target.value) : 0,
													)
												}
												onBlur={field.handleBlur}
											/>
											<FieldError errors={field.state.meta.errors} />
										</Field>
									)}
								</form.Field>

								<form.Field name="baseRate">
									{(field) => (
										<Field
											data-invalid={formFieldShowInvalid(
												field.state.meta.isTouched,
												field.state.meta.isValid,
												submissionAttempts,
											)}
										>
											<FieldLabel htmlFor={field.name}>
												Base Rate ($/hour) <RequiredStar />
											</FieldLabel>
											<Input
												id={field.name}
												type="number"
												step="0.01"
												min={0}
												value={String(field.state.value)}
												onChange={(e) =>
													field.handleChange(
														e.target.value ? Number(e.target.value) : 0,
													)
												}
												onBlur={field.handleBlur}
											/>
											<p className="text-muted-foreground mt-1 text-xs">
												Candidate-facing pay rate per hour.
											</p>
											<FieldError errors={field.state.meta.errors} />
										</Field>
									)}
								</form.Field>
							</FieldGroup>

							<div className="space-y-4">
								<div className="flex items-center justify-between gap-4">
									<div>
										<Label>Limit Shift Visibility</Label>
										<p className="text-muted-foreground mt-0.5 text-xs">
											Hide shift details until a defined time before shift
											start.
										</p>
									</div>
									<form.Field name="limitShiftVisibility">
										{(field) => (
											<Switch
												checked={field.state.value}
												onCheckedChange={(v) => {
													field.handleChange(v);
													if (v) {
														const currentDuration = form.getFieldValue(
															"visibilityUnlockDuration",
														);
														const currentUnit = form.getFieldValue(
															"visibilityUnlockUnit",
														);
														if (
															!currentDuration &&
															routingSettings?.delayDuration
														) {
															form.setFieldValue(
																"visibilityUnlockDuration",
																routingSettings.delayDuration,
															);
														}
														if (!currentUnit) {
															form.setFieldValue(
																"visibilityUnlockUnit",
																(routingSettings?.delayUnit as DelayUnit) ??
																	DelayUnit.HOURS,
															);
														}
													}
												}}
											/>
										)}
									</form.Field>
								</div>
								<form.Subscribe selector={(s) => s.values.limitShiftVisibility}>
									{(limitVisibility) =>
										limitVisibility && (
											<div className="grid grid-cols-2 gap-3">
												<form.Field name="visibilityUnlockDuration">
													{(field) => (
														<Field>
															<FieldLabel htmlFor={field.name}>
																Unlock Before Shift
															</FieldLabel>
															<Input
																id={field.name}
																type="number"
																min={0}
																placeholder="e.g., 2"
																value={
																	field.state.value !== undefined &&
																	field.state.value !== null
																		? String(field.state.value)
																		: ""
																}
																onChange={(e) =>
																	field.handleChange(
																		e.target.value
																			? Number(e.target.value)
																			: undefined,
																	)
																}
															/>
														</Field>
													)}
												</form.Field>
												<form.Field name="visibilityUnlockUnit">
													{(field) => (
														<Field>
															<FieldLabel htmlFor={field.name}>Unit</FieldLabel>
															<Select
																value={field.state.value ?? DelayUnit.HOURS}
																onValueChange={(v) =>
																	field.handleChange(v as DelayUnit)
																}
															>
																<SelectTrigger className="w-full">
																	<SelectValue />
																</SelectTrigger>
																<SelectContent>
																	{DELAY_UNIT_OPTIONS.map((o) => (
																		<SelectItem key={o.value} value={o.value}>
																			{o.label}
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>
														</Field>
													)}
												</form.Field>
											</div>
										)
									}
								</form.Subscribe>
							</div>

							<form.Field name="vendorRateMarkupPercent">
								{(field) => (
									<Field>
										<FieldLabel htmlFor={field.name}>
											Vendor Rate Markup (%)
										</FieldLabel>
										<Input
											id={field.name}
											type="number"
											step="0.01"
											min={0}
											value={
												field.state.value !== undefined
													? String(field.state.value)
													: ""
											}
											onChange={(e) =>
												field.handleChange(
													e.target.value ? Number(e.target.value) : undefined,
												)
											}
										/>
										<p className="text-muted-foreground mt-1 text-xs">
											Percentage markup added to base rate for vendor
											calculations.
										</p>
									</Field>
								)}
							</form.Field>

							<div className="space-y-4">
								<div className="flex items-center justify-between gap-4">
									<div>
										<Label>Offer Incentive</Label>
										<p className="text-muted-foreground mt-0.5 text-xs">
											Add an optional incentive payment for this shift.
										</p>
									</div>
									<form.Field name="offerIncentive">
										{(field) => (
											<Switch
												checked={field.state.value}
												onCheckedChange={(v) => field.handleChange(v)}
											/>
										)}
									</form.Field>
								</div>
								<form.Subscribe selector={(s) => s.values.offerIncentive}>
									{(offerIncentive) =>
										offerIncentive && (
											<FieldGroup>
												<form.Field name="incentiveByHour">
													{(field) => (
														<Field>
															<FieldLabel htmlFor={field.name}>
																Incentive by Hour ($/hour)
															</FieldLabel>
															<Input
																id={field.name}
																type="number"
																step="0.01"
																min={0}
																value={
																	field.state.value !== undefined
																		? String(field.state.value)
																		: ""
																}
																onChange={(e) =>
																	field.handleChange(
																		e.target.value
																			? Number(e.target.value)
																			: undefined,
																	)
																}
															/>
														</Field>
													)}
												</form.Field>
												<form.Field name="incentiveByShift">
													{(field) => (
														<Field>
															<FieldLabel htmlFor={field.name}>
																Incentive by Shift ($/shift)
															</FieldLabel>
															<Input
																id={field.name}
																type="number"
																step="0.01"
																min={0}
																value={
																	field.state.value !== undefined
																		? String(field.state.value)
																		: ""
																}
																onChange={(e) =>
																	field.handleChange(
																		e.target.value
																			? Number(e.target.value)
																			: undefined,
																	)
																}
															/>
														</Field>
													)}
												</form.Field>
											</FieldGroup>
										)
									}
								</form.Subscribe>
							</div>
						</div>
					</ScrollArea>
					<div className="px-6 pb-6">
						<FormDialogFooter
							form={form}
							submitLabel={isEdit ? "Save Template" : "Create Template"}
							submitLoadingLabel={isEdit ? "Saving..." : "Creating..."}
							onCancel={() => handleOpenChange(false)}
							isPending={isSubmitting}
						/>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
