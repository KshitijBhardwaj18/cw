"use client";

import { ShiftType } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
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
import { addHours, format, parse } from "date-fns";
import { useEffect } from "react";
import { toast } from "sonner";
import { REQUISITION_TEMPLATE_SHIFT_TYPE_OPTIONS } from "@/constants/requisition-templates";
import {
	type RequisitionTemplateShiftsScheduleFormValues,
	requisitionTemplateShiftsScheduleSchema,
} from "@/schemas/requisition-template-shifts-schedule.schema";
import { STEP_VALIDATION_TOAST } from "./CreateRequisitionTemplatePageContent";

const defaultValues: RequisitionTemplateShiftsScheduleFormValues = {
	lengthWeeks: 1,
	startTime: "",
	endTime: "",
	shiftType: ShiftType.DAY,
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

export function ShiftsScheduleForm({
	onSubmit,
	onCancel,
	onBack,
	isPending = false,
	initialValues,
	readOnly = false,
}: Readonly<ShiftsScheduleFormProps>) {
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

	const values = useStore(form.store, (s) => s.values);
	const submissionAttempts = useStore(
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);

	useEffect(() => {
		if (values.startTime && values.shiftHours > 0) {
			try {
				const start = parse(values.startTime, "HH:mm", new Date());
				const end = addHours(start, values.shiftHours);
				const formattedEnd = format(end, "HH:mm");
				if (formattedEnd !== values.endTime) {
					form.setFieldValue("endTime", formattedEnd);
				}
			} catch {
				form.setFieldValue("endTime", "");
			}
		}
	}, [values.startTime, values.shiftHours, values.endTime, form]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Shifts & Schedule</CardTitle>
				<CardDescription>
					Define reusable schedule and shift details. Start and end dates are
					set when you create a job from this template.
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
									const isNextDay =
										values.startTime &&
										field.state.value &&
										field.state.value < values.startTime;

									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel>
												End Time <RequiredStar />{" "}
												<Badge variant="secondary">Auto-Filled</Badge>
												{isNextDay && (
													<Badge variant="secondary">Next Day</Badge>
												)}
											</FieldLabel>
											<Input
												id={field.name}
												type="time"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
												readOnly
												tabIndex={-1}
												className="pointer-events-none"
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
