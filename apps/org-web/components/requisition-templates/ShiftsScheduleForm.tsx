"use client";

import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
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
import { TimePicker } from "@repo/ui/components/time-picker";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { formFieldShowInvalid } from "@repo/ui/lib/form-field-display";
import { useForm, useStore } from "@tanstack/react-form";
import { addWeeks, format, parse } from "date-fns";
import { useMemo } from "react";
import { toast } from "sonner";
import { REQUISITION_TEMPLATE_SHIFT_TYPE_OPTIONS } from "@/constants/requisition-templates";
import {
	type RequisitionTemplateShiftsScheduleFormValues,
	requisitionTemplateShiftsScheduleSchema,
} from "@/schemas/requisition-template-shifts-schedule.schema";
import { STEP_VALIDATION_TOAST } from "./CreateRequisitionTemplatePageContent";

const defaultValues: RequisitionTemplateShiftsScheduleFormValues = {
	startDate: "",
	lengthWeeks: 1,
	startTime: "",
	endTime: "",
	shiftType: "DAYS",
	shiftHours: 8,
	shiftsPerWeek: 1,
	hoursPerWeek: undefined,
};

interface ShiftsScheduleFormProps {
	onSubmit: (values: RequisitionTemplateShiftsScheduleFormValues) => void;
	onCancel: () => void;
	onBack?: () => void;
	isPending?: boolean;
	initialValues?: RequisitionTemplateShiftsScheduleFormValues;
	readOnly?: boolean;
}

function computeEndDate(startDate: string, lengthWeeks: number): string | null {
	if (!startDate || lengthWeeks < 1) return null;
	try {
		const start = parse(startDate, "yyyy-MM-dd", new Date());
		const end = addWeeks(start, lengthWeeks);
		return format(end, "yyyy-MM-dd");
	} catch {
		return null;
	}
}

export function ShiftsScheduleForm({
	onSubmit,
	onCancel,
	onBack,
	isPending = false,
	initialValues,
	readOnly = false,
}: ShiftsScheduleFormProps) {
	const form = useForm({
		defaultValues: initialValues ?? defaultValues,
		validators: {
			onSubmit: requisitionTemplateShiftsScheduleSchema,
		},
		onSubmitInvalid: () => {
			toast.error(STEP_VALIDATION_TOAST);
		},
		onSubmit: ({ value }) => {
			onSubmit(value);
		},
	});

	const startDate = useStore(form.store, (s) => s.values.startDate);
	const lengthWeeks = useStore(form.store, (s) => s.values.lengthWeeks);
	const endDateDisplay = useMemo(
		() => computeEndDate(startDate, lengthWeeks),
		[startDate, lengthWeeks],
	);

	const submissionAttempts = useStore(
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Shifts & Schedule</CardTitle>
				<CardDescription>
					Define the schedule and shift details for this requisition template
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						void form.handleSubmit();
					}}
					className="space-y-6"
				>
					<FieldGroup>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<form.Field
								name="startDate"
								validators={{
									onChange:
										requisitionTemplateShiftsScheduleSchema.shape.startDate,
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
												Start Date <RequiredStar />
											</FieldLabel>
											<DatePicker
												id={field.name}
												value={field.state.value}
												onChange={(v) => field.handleChange(v)}
												onBlur={field.handleBlur}
												disabled={isPending || readOnly}
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

							<form.Field
								name="lengthWeeks"
								validators={{
									onChange:
										requisitionTemplateShiftsScheduleSchema.shape.lengthWeeks,
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
												Length (Weeks) <RequiredStar />
											</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												type="number"
												min={1}
												disabled={isPending || readOnly}
												value={
													field.state.value === 0
														? ""
														: String(field.state.value)
												}
												onBlur={field.handleBlur}
												onChange={(e) => {
													const v = e.target.value;
													field.handleChange(v ? Number.parseInt(v, 10) : 0);
												}}
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

						<Field>
							<FieldLabel>End Date</FieldLabel>
							<Input
								readOnly
								value={endDateDisplay ?? "—"}
								className="bg-muted cursor-not-allowed"
								aria-readonly
							/>
						</Field>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<form.Field
								name="startTime"
								validators={{
									onChange:
										requisitionTemplateShiftsScheduleSchema.shape.startTime,
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
												Start Time <RequiredStar />
											</FieldLabel>
											<TimePicker
												id={field.name}
												value={field.state.value}
												onChange={(v) => field.handleChange(v)}
												onBlur={field.handleBlur}
												disabled={isPending || readOnly}
												placeholder="Select time"
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
								validators={{
									onChange:
										requisitionTemplateShiftsScheduleSchema.shape.endTime,
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
												End Time <RequiredStar />
											</FieldLabel>
											<TimePicker
												id={field.name}
												value={field.state.value}
												onChange={(v) => field.handleChange(v)}
												onBlur={field.handleBlur}
												disabled={isPending || readOnly}
												placeholder="Select time"
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
								name="shiftType"
								validators={{
									onChange:
										requisitionTemplateShiftsScheduleSchema.shape.shiftType,
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
												Shift Type <RequiredStar />
											</FieldLabel>
											<Select
												value={field.state.value ?? ""}
												onValueChange={(v) =>
													field.handleChange(
														v as RequisitionTemplateShiftsScheduleFormValues["shiftType"],
													)
												}
												disabled={isPending || readOnly}
											>
												<SelectTrigger id={field.name} aria-invalid={isInvalid}>
													<SelectValue placeholder="Select shift type" />
												</SelectTrigger>
												<SelectContent>
													{REQUISITION_TEMPLATE_SHIFT_TYPE_OPTIONS.map(
														(opt) => (
															<SelectItem key={opt.value} value={opt.value}>
																{opt.label}
															</SelectItem>
														),
													)}
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
								name="shiftHours"
								validators={{
									onChange:
										requisitionTemplateShiftsScheduleSchema.shape.shiftHours,
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
												Shift Hours <RequiredStar />
											</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												type="number"
												min={0.5}
												max={24}
												step={0.5}
												disabled={isPending || readOnly}
												value={
													field.state.value === 0
														? ""
														: String(field.state.value)
												}
												onBlur={field.handleBlur}
												onChange={(e) => {
													const v = e.target.value;
													field.handleChange(v ? Number.parseFloat(v) : 0);
												}}
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
								name="shiftsPerWeek"
								validators={{
									onChange:
										requisitionTemplateShiftsScheduleSchema.shape.shiftsPerWeek,
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
												Shifts Per Week <RequiredStar />
											</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												type="number"
												min={1}
												max={7}
												disabled={isPending || readOnly}
												value={
													field.state.value === 0
														? ""
														: String(field.state.value)
												}
												onBlur={field.handleBlur}
												onChange={(e) => {
													const v = e.target.value;
													field.handleChange(v ? Number.parseInt(v, 10) : 0);
												}}
												aria-invalid={isInvalid}
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							</form.Field>

							<form.Field name="hoursPerWeek">
								{(field) => (
									<Field>
										<FieldLabel htmlFor={field.name}>Hours Per Week</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											type="number"
											min={0}
											max={168}
											step={0.5}
											disabled={isPending || readOnly}
											value={
												field.state.value == null || field.state.value === 0
													? ""
													: String(field.state.value)
											}
											onBlur={field.handleBlur}
											onChange={(e) => {
												const v = e.target.value;
												field.handleChange(
													v ? Number.parseFloat(v) : undefined,
												);
											}}
										/>
									</Field>
								)}
							</form.Field>
						</div>
					</FieldGroup>

					<div className="flex justify-end gap-3 pt-4">
						{onBack && (
							<Button
								type="button"
								variant="outline"
								onClick={onBack}
								disabled={isPending}
							>
								Back
							</Button>
						)}
						<Button
							type="button"
							variant="outline"
							onClick={onCancel}
							disabled={isPending}
						>
							Cancel
						</Button>
						<form.Subscribe selector={(s) => s.isSubmitting}>
							{(isSubmitting) => (
								<Button type="submit" disabled={isSubmitting || isPending}>
									{isSubmitting || isPending ? "Saving..." : "Next →"}
								</Button>
							)}
						</form.Subscribe>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
