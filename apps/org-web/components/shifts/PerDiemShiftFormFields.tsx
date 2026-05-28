"use client";

import { Badge } from "@repo/ui/components/badge";
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
	MultiSelect,
	MultiSelectContent,
	MultiSelectItem,
	MultiSelectTrigger,
	MultiSelectValue,
} from "@repo/ui/components/multi-select";
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
import type { AnyFieldApi } from "@tanstack/react-form";
import { SHIFT_TYPE_OPTIONS } from "@/constants/shifts";
import type { ShiftFormApi } from "@/hooks/use-shift-form";
import {
	type CreateShiftFormValues,
	createShiftSchema,
} from "@/schemas/create-shift.schema";

interface PerDiemShiftFormFieldsProps {
	form: ShiftFormApi;
	values: CreateShiftFormValues;
	submissionAttempts: number;
	minDate: string;
	minStartTime?: string;
	specialtyOptions: { id: string; name: string }[];
	specialtyOptionsLoading: boolean;
}

export function PerDiemShiftFormFields({
	form,
	values,
	submissionAttempts,
	minDate,
	minStartTime,
	specialtyOptions,
	specialtyOptionsLoading,
}: Readonly<PerDiemShiftFormFieldsProps>) {
	return (
		<FieldGroup>
			<form.Field
				name="date"
				validators={{ onBlur: createShiftSchema.shape.date }}
			>
				{(field: AnyFieldApi) => {
					const isInvalid = formFieldShowInvalid(
						field.state.meta.isTouched,
						field.state.meta.isValid,
						submissionAttempts,
					);
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
								min={minDate}
							/>
							{isInvalid && <FieldError errors={field.state.meta.errors} />}
						</Field>
					);
				}}
			</form.Field>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<form.Field
					name="startTime"
					validators={{ onBlur: createShiftSchema.shape.startTime }}
				>
					{(field: AnyFieldApi) => {
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
									onBlur={field.handleBlur}
									onChange={(v) => field.handleChange(v)}
									min={minStartTime}
									aria-invalid={isInvalid}
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>
				<form.Field name="endTime">
					{(field: AnyFieldApi) => {
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
									{isNextDay && <Badge variant="secondary">Next Day</Badge>}
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
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<form.Field
					name="shiftType"
					validators={{ onBlur: createShiftSchema.shape.shiftType }}
				>
					{(field: AnyFieldApi) => {
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
									value={field.state.value}
									onValueChange={(value) => field.handleChange(value)}
								>
									<SelectTrigger id={field.name} aria-invalid={isInvalid}>
										<SelectValue placeholder="Select type" />
									</SelectTrigger>
									<SelectContent>
										{SHIFT_TYPE_OPTIONS.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
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
					name="totalShiftHours"
					validators={{ onBlur: createShiftSchema.shape.totalShiftHours }}
				>
					{(field: AnyFieldApi) => {
						const isInvalid = formFieldShowInvalid(
							field.state.meta.isTouched,
							field.state.meta.isValid,
							submissionAttempts,
						);
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
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<form.Field
					name="occupation"
					validators={{ onBlur: createShiftSchema.shape.occupation }}
				>
					{(field: AnyFieldApi) => {
						const isInvalid = formFieldShowInvalid(
							field.state.meta.isTouched,
							field.state.meta.isValid,
							submissionAttempts,
						);
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>
									Occupation <RequiredStar />
								</FieldLabel>
								<Input id={field.name} value={field.state.value} disabled />
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>
				<form.Field name="specialtyIds">
					{(field: AnyFieldApi) => (
						<Field>
							<FieldLabel htmlFor={field.name}>Specialties</FieldLabel>
							<MultiSelect
								values={field.state.value}
								onValuesChange={field.handleChange}
							>
								<MultiSelectTrigger className="w-full">
									<MultiSelectValue placeholder="Any specialty (occupation match only)" />
								</MultiSelectTrigger>
								<MultiSelectContent
									search={{
										placeholder: "Search specialties...",
										emptyMessage: "No specialties match your search.",
									}}
								>
									{specialtyOptionsLoading ? (
										<p className="px-2 py-6 text-center text-sm text-muted-foreground">
											Loading specialties…
										</p>
									) : specialtyOptions.length === 0 ? (
										<p className="px-2 py-6 text-center text-sm text-muted-foreground">
											No specialties available for this occupation.
										</p>
									) : (
										specialtyOptions.map((s) => (
											<MultiSelectItem key={s.id} value={s.id}>
												{s.name}
											</MultiSelectItem>
										))
									)}
								</MultiSelectContent>
							</MultiSelect>
						</Field>
					)}
				</form.Field>
			</div>

			<form.Field
				name="shiftRatePerHour"
				validators={{ onBlur: createShiftSchema.shape.shiftRatePerHour }}
			>
				{(field: AnyFieldApi) => {
					const isInvalid = formFieldShowInvalid(
						field.state.meta.isTouched,
						field.state.meta.isValid,
						submissionAttempts,
					);
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
								Rate must be above the per-diem floor rate for this position.
							</FieldDescription>
							{isInvalid && <FieldError errors={field.state.meta.errors} />}
						</Field>
					);
				}}
			</form.Field>

			<form.Field
				name="vendorRatePerHour"
				validators={{ onBlur: createShiftSchema.shape.vendorRatePerHour }}
			>
				{(field: AnyFieldApi) => {
					const isInvalid = formFieldShowInvalid(
						field.state.meta.isTouched,
						field.state.meta.isValid,
						submissionAttempts,
					);
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
							{isInvalid && <FieldError errors={field.state.meta.errors} />}
						</Field>
					);
				}}
			</form.Field>
		</FieldGroup>
	);
}
