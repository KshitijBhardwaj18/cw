"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { DatePicker } from "@repo/ui/components/date-picker";
import {
	Field,
	FieldDescription,
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
import RequiredStar from "@repo/ui/general/RequiredStar";
import { useForm, useStore } from "@tanstack/react-form";
import { ArrowLeft, CalendarDays } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import type { ShiftType } from "@/constants/shifts";
import { SHIFT_TYPE_OPTIONS } from "@/constants/shifts";
import { useOrgContext } from "@/contexts/org-context";
import { useCreatePerDiemShift } from "@/queries/per-diem-shifts.queries";
import { useSpecialtiesForOccupation } from "@/queries/talent-community.queries";
import { type CreateShiftFormValues, createShiftSchema } from "@/schemas";
import type { ShiftTemplateListItem } from "@/types/shift-template";
import { SelectedShiftTemplateCard } from "./SelectedShiftTemplateCard";
import { ShiftSummaryCard } from "./ShiftSummaryCard";
import { ShiftTemplateSelectorDialog } from "./ShiftTemplateSelectorDialog";

const INITIAL_FORM_VALUES: CreateShiftFormValues = {
	date: "",
	startTime: "",
	endTime: "",
	occupation: "",
	specialtyId: "",
	shiftRatePerHour: 0,
	vendorRatePerHour: 0,
	shiftType: "",
	totalShiftHours: 0,
};

export function CreatePerDiemShiftPageContent() {
	const { id: orgId } = useOrgContext();
	const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);
	const [selectedTemplate, setSelectedTemplate] =
		useState<ShiftTemplateListItem | null>(null);
	const createShiftMutation = useCreatePerDiemShift();
	const specialtiesQuery = useSpecialtiesForOccupation(
		orgId,
		selectedTemplate?.occupationId ?? null,
	);
	const form = useForm({
		defaultValues: INITIAL_FORM_VALUES,
		validators: { onSubmit: createShiftSchema },
		onSubmitInvalid: () => {
			toast.error("Please complete all required fields before creating shift.");
		},
		onSubmit: async ({ value }) => {
			if (!selectedTemplate) {
				toast.error("Please select a shift template.");
				return;
			}
			createShiftMutation.mutate(
				{
					shiftTemplateId: selectedTemplate.id,
					shiftDate: value.date,
					startTime: value.startTime,
					endTime: value.endTime,
					shiftType: value.shiftType as ShiftType,
					totalShiftHours: value.totalShiftHours,
					shiftRate: value.shiftRatePerHour,
					vendorRate: value.vendorRatePerHour,
					specialtyId: value.specialtyId ? value.specialtyId : null,
					isPublic: true,
					isUrgent: false,
				},
				{
					onSuccess: () => {
						toast.success("Shift created successfully.");
					},
					onError: (err) => {
						toast.error(
							err instanceof Error ? err.message : "Something went wrong",
						);
					},
				},
			);
		},
	});

	const values = useStore(form.store, (state) => state.values);
	const canCreate = Boolean(
		selectedTemplate &&
			values.date &&
			values.startTime &&
			values.endTime &&
			values.occupation &&
			values.shiftRatePerHour > 0 &&
			values.vendorRatePerHour >= 0 &&
			values.shiftType &&
			values.totalShiftHours > 0,
	);

	const onTemplateSelect = (template: ShiftTemplateListItem) => {
		setSelectedTemplate(template);
		form.setFieldValue("occupation", template.occupation.name);
		form.setFieldValue("specialtyId", "");
		form.setFieldValue("shiftRatePerHour", template.baseRate);
		const vendorRate =
			template.vendorRateMarkupPercent != null
				? template.baseRate * (1 + template.vendorRateMarkupPercent / 100)
				: template.baseRate;
		form.setFieldValue(
			"vendorRatePerHour",
			Math.max(0, Number(vendorRate.toFixed(2))),
		);
		form.setFieldValue("shiftType", template.shiftType);
		form.setFieldValue("totalShiftHours", template.durationHours);
		setTemplateSelectorOpen(false);
	};

	const onCreateShift = () => {
		void form.handleSubmit();
	};

	return (
		<div className="space-y-5">
			<Link
				href="/org/shifts"
				className="text-muted-foreground inline-flex items-center gap-1.5 text-sm hover:text-foreground"
			>
				<ArrowLeft className="size-4" />
				Back
			</Link>

			<div>
				<h1 className="text-2xl font-bold tracking-tight">
					Create Per Diem Shift
				</h1>
				<p className="text-muted-foreground mt-1 text-sm">
					Create a new per diem shift and notify eligible candidates
				</p>
			</div>

			<div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
				<div className="space-y-5 lg:col-span-2">
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-xl">Shift Template</CardTitle>
						</CardHeader>
						<CardContent className="pt-0">
							{selectedTemplate ? (
								<SelectedShiftTemplateCard
									template={selectedTemplate}
									onChangeTemplate={() => setTemplateSelectorOpen(true)}
								/>
							) : (
								<button
									type="button"
									onClick={() => setTemplateSelectorOpen(true)}
									className="text-muted-foreground flex w-full items-center justify-center gap-2 rounded-lg border border-dashed py-3 text-sm transition-colors hover:bg-muted/40"
								>
									<CalendarDays className="size-4" />
									Select a shift template to get started
								</button>
							)}
						</CardContent>
					</Card>

					{selectedTemplate && (
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-xl">Shift Details</CardTitle>
							</CardHeader>
							<CardContent className="pt-0">
								<form
									onSubmit={(e) => {
										e.preventDefault();
										void form.handleSubmit();
									}}
								>
									<FieldGroup>
										<form.Field
											name="date"
											validators={{ onBlur: createShiftSchema.shape.date }}
										>
											{(field) => {
												const isInvalid =
													field.state.meta.isTouched &&
													!field.state.meta.isValid;
												return (
													<Field data-invalid={isInvalid}>
														<FieldLabel htmlFor={field.name}>
															Date <RequiredStar />
														</FieldLabel>
														<DatePicker
															id={field.name}
															value={field.state.value}
															onChange={(v) => field.handleChange(v)}
															onBlur={field.handleBlur}
															placeholder="Pick a date"
															aria-invalid={isInvalid}
														/>
														{isInvalid && (
															<FieldError errors={field.state.meta.errors} />
														)}
													</Field>
												);
											}}
										</form.Field>

										<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
											<form.Field
												name="startTime"
												validators={{
													onBlur: createShiftSchema.shape.startTime,
												}}
											>
												{(field) => {
													const isInvalid =
														field.state.meta.isTouched &&
														!field.state.meta.isValid;
													return (
														<Field data-invalid={isInvalid}>
															<FieldLabel htmlFor={field.name}>
																Start Time <RequiredStar />
															</FieldLabel>
															<Input
																id={field.name}
																type="time"
																value={field.state.value}
																onBlur={field.handleBlur}
																onChange={(e) =>
																	field.handleChange(e.target.value)
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
											<form.Field
												name="endTime"
												validators={{ onBlur: createShiftSchema.shape.endTime }}
											>
												{(field) => {
													const isInvalid =
														field.state.meta.isTouched &&
														!field.state.meta.isValid;
													return (
														<Field data-invalid={isInvalid}>
															<FieldLabel htmlFor={field.name}>
																End Time <RequiredStar />
															</FieldLabel>
															<Input
																id={field.name}
																type="time"
																value={field.state.value}
																onBlur={field.handleBlur}
																onChange={(e) =>
																	field.handleChange(e.target.value)
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
										</div>

										<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
											<form.Field
												name="occupation"
												validators={{
													onBlur: createShiftSchema.shape.occupation,
												}}
											>
												{(field) => {
													const isInvalid =
														field.state.meta.isTouched &&
														!field.state.meta.isValid;
													return (
														<Field data-invalid={isInvalid}>
															<FieldLabel htmlFor={field.name}>
																Occupation <RequiredStar />
															</FieldLabel>
															<Input
																id={field.name}
																value={field.state.value}
																disabled
															/>
															{isInvalid && (
																<FieldError errors={field.state.meta.errors} />
															)}
														</Field>
													);
												}}
											</form.Field>
											<form.Field name="specialtyId">
												{(field) => (
													<Field>
														<FieldLabel htmlFor={field.name}>
															Specialty
														</FieldLabel>
														<Select
															value={field.state.value}
															onValueChange={(value) => {
																field.handleChange(
																	value === "__none__" ? "" : value,
																);
															}}
														>
															<SelectTrigger id={field.name}>
																<SelectValue placeholder="Select specialty" />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="__none__">None</SelectItem>
																{(specialtiesQuery.data ?? []).map((s) => (
																	<SelectItem key={s.id} value={s.id}>
																		{s.name}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</Field>
												)}
											</form.Field>
										</div>

										<form.Field
											name="shiftRatePerHour"
											validators={{
												onBlur: createShiftSchema.shape.shiftRatePerHour,
											}}
										>
											{(field) => {
												const isInvalid =
													field.state.meta.isTouched &&
													!field.state.meta.isValid;
												return (
													<Field data-invalid={isInvalid}>
														<FieldLabel htmlFor={field.name}>
															Shift Rate ($/hour) <RequiredStar />
														</FieldLabel>
														<Input
															id={field.name}
															type="number"
															min={0}
															value={String(field.state.value)}
															onBlur={field.handleBlur}
															onChange={(e) =>
																field.handleChange(
																	e.target.value ? Number(e.target.value) : 0,
																)
															}
															aria-invalid={isInvalid}
														/>
														<FieldDescription>
															Rate must be above the per-diem floor rate for
															this position.
														</FieldDescription>
														{isInvalid && (
															<FieldError errors={field.state.meta.errors} />
														)}
													</Field>
												);
											}}
										</form.Field>

										<form.Field
											name="vendorRatePerHour"
											validators={{
												onBlur: createShiftSchema.shape.vendorRatePerHour,
											}}
										>
											{(field) => {
												const isInvalid =
													field.state.meta.isTouched &&
													!field.state.meta.isValid;
												return (
													<Field data-invalid={isInvalid}>
														<FieldLabel htmlFor={field.name}>
															Vendor Rate ($/hour) <RequiredStar />
														</FieldLabel>
														<Input
															id={field.name}
															type="number"
															min={0}
															value={String(field.state.value)}
															onBlur={field.handleBlur}
															onChange={(e) =>
																field.handleChange(
																	e.target.value ? Number(e.target.value) : 0,
																)
															}
															aria-invalid={isInvalid}
														/>
														<FieldDescription>
															The rate paid to the vendor for this shift.
														</FieldDescription>
														{isInvalid && (
															<FieldError errors={field.state.meta.errors} />
														)}
													</Field>
												);
											}}
										</form.Field>

										<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
											<form.Field
												name="shiftType"
												validators={{
													onBlur: createShiftSchema.shape.shiftType,
												}}
											>
												{(field) => {
													const isInvalid =
														field.state.meta.isTouched &&
														!field.state.meta.isValid;
													return (
														<Field data-invalid={isInvalid}>
															<FieldLabel htmlFor={field.name}>
																Shift Type <RequiredStar />
															</FieldLabel>
															<Select
																value={field.state.value}
																onValueChange={(value) =>
																	field.handleChange(value)
																}
															>
																<SelectTrigger
																	id={field.name}
																	aria-invalid={isInvalid}
																>
																	<SelectValue placeholder="Select type" />
																</SelectTrigger>
																<SelectContent>
																	{SHIFT_TYPE_OPTIONS.map((option) => (
																		<SelectItem
																			key={option.value}
																			value={option.value}
																		>
																			{option.label}
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
												name="totalShiftHours"
												validators={{
													onBlur: createShiftSchema.shape.totalShiftHours,
												}}
											>
												{(field) => {
													const isInvalid =
														field.state.meta.isTouched &&
														!field.state.meta.isValid;
													return (
														<Field data-invalid={isInvalid}>
															<FieldLabel htmlFor={field.name}>
																Total Shift Hours <RequiredStar />
															</FieldLabel>
															<Input
																id={field.name}
																type="number"
																min={1}
																value={String(field.state.value)}
																onBlur={field.handleBlur}
																onChange={(e) =>
																	field.handleChange(
																		e.target.value ? Number(e.target.value) : 0,
																	)
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
										</div>
									</FieldGroup>
								</form>
							</CardContent>
						</Card>
					)}
				</div>

				<div>
					<ShiftSummaryCard
						template={selectedTemplate}
						canCreate={canCreate}
						onCreate={onCreateShift}
					/>
				</div>
			</div>

			<ShiftTemplateSelectorDialog
				open={templateSelectorOpen}
				onOpenChange={setTemplateSelectorOpen}
				onSelect={onTemplateSelect}
			/>
		</div>
	);
}
