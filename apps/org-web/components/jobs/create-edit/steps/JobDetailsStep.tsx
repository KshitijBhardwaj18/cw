"use client";

import { Badge } from "@repo/ui/components/badge";
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
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@repo/ui/components/input-group";
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
import { Separator } from "@repo/ui/components/separator";
import { Textarea } from "@repo/ui/components/textarea";
import { TimePicker } from "@repo/ui/components/time-picker";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { formFieldShowInvalid } from "@repo/ui/lib/form-field-display";
import { useStore } from "@tanstack/react-form";
import { addHours, format, parse } from "date-fns";
import { Plus, X } from "lucide-react";
import { useEffect, useMemo } from "react";
import {
	REQUISITION_TEMPLATE_INTERVIEW_TYPE_OPTIONS,
	REQUISITION_TEMPLATE_SHIFT_TYPE_OPTIONS,
} from "@/constants/requisition-templates";
import { useJobPostingDetailsStepForm } from "@/hooks/job-posting/use-job-posting-details-step-form";
import {
	type JobPostingDetailsValues,
	jobPostingDetailsFieldsSchema,
	todayIsoDate,
} from "@/schemas/job-posting-details.schema";
import { ComplianceTemplateDialog } from "../ComplianceTemplateDialog";

interface JobDetailsStepProps {
	initialValues: JobPostingDetailsValues;
	onBack: () => void;
	onCancel: () => void;
	onSubmit: (values: JobPostingDetailsValues) => void;
	isPending?: boolean;
}

export function InheritedIndicator() {
	return <span className="text-primary text-xs">Inherited from Template</span>;
}
export function JobDetailsStep({
	initialValues,
	onBack,
	onCancel,
	onSubmit,
	isPending = false,
}: Readonly<JobDetailsStepProps>) {
	const {
		form,
		lockFields,
		benefitInput,
		setBenefitInput,
		addBenefit,
		complianceOpen,
		setComplianceOpen,
		complianceTemplateId,
		selectedOrganizationOccupationId,
		organizationSpecialtyOptions,
		hoursPerWeek,
		occupationsQuery,
		locationsQuery,
		departmentsQuery,
		membersQuery,
		checklistsQuery,
		handleFormSubmit,
	} = useJobPostingDetailsStepForm({
		initialValues,
		onSubmit,
		isPending,
	});

	const values = useStore(form.store, (s) => s.values);

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

	const submissionAttempts = useStore(
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);

	const minEndDate = useMemo(() => {
		if (!values.startDate) return undefined;
		try {
			const start = parse(values.startDate, "yyyy-MM-dd", new Date());
			return format(start, "yyyy-MM-dd");
		} catch {
			return undefined;
		}
	}, [values.startDate]);

	const isSubmitting = useStore(form.store, (s) => s.isSubmitting);

	const now = new Date();
	const currentTime = now.toTimeString().slice(0, 5);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Job Details</CardTitle>
				<CardDescription>
					All fields are pre-filled from the selected template. You can
					customize any field for this specific job posting.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form className="space-y-6" onSubmit={handleFormSubmit}>
					<FieldGroup>
						<div className="space-y-1">
							<h3 className="font-semibold">General Information</h3>
						</div>

						<form.Field
							name="requisitionName"
							validators={{
								onChange: jobPostingDetailsFieldsSchema.shape.requisitionName,
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
											Requisition Name <RequiredStar /> <InheritedIndicator />
										</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											disabled={lockFields}
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

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<form.Field
								name="location"
								validators={{
									onChange: jobPostingDetailsFieldsSchema.shape.location,
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
												Location <RequiredStar /> <InheritedIndicator />
											</FieldLabel>
											<Select
												value={field.state.value}
												onValueChange={field.handleChange}
												disabled={lockFields}
											>
												<SelectTrigger id={field.name} aria-invalid={isInvalid}>
													<SelectValue placeholder="Select location" />
												</SelectTrigger>
												<SelectContent>
													{(locationsQuery.data ?? []).map((loc) => (
														<SelectItem key={loc.id} value={loc.id}>
															{loc.name}
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
							<form.Field name="unitName">
								{(field) => (
									<Field>
										<FieldLabel htmlFor={field.name}>
											Unit Name <InheritedIndicator />
										</FieldLabel>
										<Input
											id={field.name}
											value={(field.state.value as string) ?? ""}
											placeholder="ICU - Night Unit"
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
									</Field>
								)}
							</form.Field>
							<form.Field
								name="occupation"
								validators={{
									onChange: jobPostingDetailsFieldsSchema.shape.occupation,
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
												Required Occupation <RequiredStar />{" "}
												<InheritedIndicator />
											</FieldLabel>
											<Select
												value={field.state.value}
												onValueChange={(v) => {
													field.handleChange(v);
													form.setFieldValue("specialty", []);
													form.setFieldValue("department", "");
												}}
												disabled={lockFields}
											>
												<SelectTrigger id={field.name} aria-invalid={isInvalid}>
													<SelectValue placeholder="Select occupation" />
												</SelectTrigger>
												<SelectContent>
													{(occupationsQuery.data ?? []).map((o) => (
														<SelectItem
															key={o.organizationOccupationId}
															value={o.organizationOccupationId}
														>
															{o.name}
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
							<form.Field name="specialty">
								{(field) => {
									const multiSelectDisabled =
										lockFields ||
										!selectedOrganizationOccupationId ||
										organizationSpecialtyOptions.length === 0;
									return (
										<Field>
											<FieldLabel htmlFor={field.name}>
												Specialties <InheritedIndicator />
											</FieldLabel>
											<MultiSelect
												values={field.state.value}
												onValuesChange={(vals) => field.handleChange(vals)}
											>
												<MultiSelectTrigger
													id={field.name}
													className="w-full"
													disabled={multiSelectDisabled}
												>
													<MultiSelectValue
														placeholder={
															!selectedOrganizationOccupationId
																? "Select an occupation first"
																: organizationSpecialtyOptions.length === 0
																	? "No specialties linked for this occupation"
																	: "Any specialty (optional)"
														}
													/>
												</MultiSelectTrigger>
												<MultiSelectContent
													search={{
														placeholder: "Search specialties…",
														emptyMessage: "No specialties match your search.",
													}}
												>
													{organizationSpecialtyOptions.length === 0 ? (
														<p className="text-muted-foreground px-2 py-6 text-center text-sm">
															No specialties found for this occupation.
														</p>
													) : (
														organizationSpecialtyOptions.map((o) => (
															<MultiSelectItem key={o.id} value={o.id}>
																{o.name}
															</MultiSelectItem>
														))
													)}
												</MultiSelectContent>
											</MultiSelect>
										</Field>
									);
								}}
							</form.Field>
							<form.Field
								name="department"
								validators={{
									onChange: jobPostingDetailsFieldsSchema.shape.department,
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
												Department <RequiredStar /> <InheritedIndicator />
											</FieldLabel>
											<Select
												value={field.state.value}
												onValueChange={field.handleChange}
												disabled={lockFields}
											>
												<SelectTrigger id={field.name} aria-invalid={isInvalid}>
													<SelectValue placeholder="Select department" />
												</SelectTrigger>
												<SelectContent>
													{(departmentsQuery.data ?? []).length === 0 ? (
														<SelectItem value="__empty__" disabled>
															{selectedOrganizationOccupationId
																? "No departments linked for this occupation"
																: "Select an occupation first"}
														</SelectItem>
													) : (
														(departmentsQuery.data ?? []).map((d) => (
															<SelectItem key={d.id} value={d.id}>
																{d.name}
															</SelectItem>
														))
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
								name="shiftType"
								validators={{
									onChange: jobPostingDetailsFieldsSchema.shape.shiftType,
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
												Shift Type <RequiredStar /> <InheritedIndicator />
											</FieldLabel>
											<Select
												value={field.state.value}
												onValueChange={(v) =>
													field.handleChange(
														v as JobPostingDetailsValues["shiftType"],
													)
												}
												disabled={lockFields}
											>
												<SelectTrigger id={field.name} aria-invalid={isInvalid}>
													<SelectValue placeholder="Select shift type" />
												</SelectTrigger>
												<SelectContent>
													{REQUISITION_TEMPLATE_SHIFT_TYPE_OPTIONS.map((o) => (
														<SelectItem key={o.value} value={o.value}>
															{o.label}
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
						<Separator />
						<h3 className="font-semibold">Shift & Schedule</h3>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
							<form.Field
								name="startDate"
								validators={{
									onChange: jobPostingDetailsFieldsSchema.shape.startDate,
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
											<FieldLabel>
												Start Date <RequiredStar />
											</FieldLabel>
											<DatePicker
												value={field.state.value}
												onChange={field.handleChange}
												aria-invalid={isInvalid}
												disabled={lockFields}
												min={todayIsoDate()}
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							</form.Field>
							<form.Field name="endDate">
								{(field) => {
									const isInvalid = formFieldShowInvalid(
										field.state.meta.isTouched,
										field.state.meta.isValid,
										submissionAttempts,
									);

									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel>End Date</FieldLabel>
											<DatePicker
												value={field.state.value ?? ""}
												onChange={(v) => field.handleChange(v || "")}
												aria-invalid={isInvalid}
												disabled={lockFields}
												min={minEndDate}
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
									onChange: jobPostingDetailsFieldsSchema.shape.lengthWeeks,
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
											<FieldLabel>
												Length (Weeks) <InheritedIndicator />
											</FieldLabel>
											<Input
												type="number"
												value={
													Number.isNaN(field.state.value)
														? ""
														: String(field.state.value)
												}
												disabled={lockFields}
												onBlur={field.handleBlur}
												onChange={(e) => {
													const v = e.target.value;
													field.handleChange(
														v ? Number.parseInt(v, 10) : Number.NaN,
													);
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
									onChange: jobPostingDetailsFieldsSchema.shape.startTime,
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
											<FieldLabel>
												Start Time <InheritedIndicator />
											</FieldLabel>
											<TimePicker
												value={field.state.value}
												onChange={field.handleChange}
												min={
													values.startDate === todayIsoDate()
														? currentTime
														: undefined
												}
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
									onChange: jobPostingDetailsFieldsSchema.shape.endTime,
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
											<FieldLabel>
												End Time <InheritedIndicator />
												{values.startTime &&
													values.endTime &&
													values.endTime < values.startTime && (
														<Badge variant="secondary" className="text-[10px]">
															Next Day
														</Badge>
													)}
											</FieldLabel>
											<Input
												type="time"
												value={field.state.value}
												readOnly
												className="pointer-events-none bg-muted"
												tabIndex={-1}
											/>
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
									onChange: jobPostingDetailsFieldsSchema.shape.shiftHours,
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
											<FieldLabel>
												Shift Hours <InheritedIndicator />
											</FieldLabel>
											<Input
												type="number"
												value={String(field.state.value)}
												disabled={lockFields}
												min={0.5}
												step={0.5}
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
							<form.Field
								name="shiftsPerWeek"
								validators={{
									onChange: jobPostingDetailsFieldsSchema.shape.shiftsPerWeek,
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
											<FieldLabel>
												Shifts Per Week <InheritedIndicator />
											</FieldLabel>
											<Input
												type="number"
												value={String(field.state.value)}
												disabled={lockFields}
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
							<Field>
								<FieldLabel>
									Hours Per Week{" "}
									<span className="text-primary text-xs">Auto-calculated</span>
								</FieldLabel>
								<Input
									value={String(hoursPerWeek)}
									readOnly
									className="bg-muted"
								/>
							</Field>
						</div>
						<Separator />
						<h3 className="font-semibold">Compensation & Hiring</h3>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<form.Field
								name="billRate"
								validators={{
									onChange: jobPostingDetailsFieldsSchema.shape.billRate,
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
											<FieldLabel>
												Bill Rate <InheritedIndicator />
											</FieldLabel>
											<InputGroup>
												<InputGroupAddon>$</InputGroupAddon>
												<InputGroupInput
													type="number"
													value={String(field.state.value)}
													disabled={lockFields}
													onBlur={field.handleBlur}
													onChange={(e) => {
														const v = e.target.value;
														field.handleChange(v ? Number.parseInt(v, 10) : 0);
													}}
													aria-invalid={isInvalid}
												/>
												<InputGroupAddon align="inline-end">
													/hr
												</InputGroupAddon>
											</InputGroup>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							</form.Field>
							<form.Field
								name="numberOfPositions"
								validators={{
									onChange:
										jobPostingDetailsFieldsSchema.shape.numberOfPositions,
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
											<FieldLabel>
												# of Open Positions <InheritedIndicator />
											</FieldLabel>
											<Input
												type="number"
												min={0}
												value={String(field.state.value)}
												disabled={lockFields}
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
							<form.Field name="incentiveType">
								{(field) => (
									<Field>
										<FieldLabel>
											Incentive Type <InheritedIndicator />
										</FieldLabel>
										<Input
											value={field.state.value ?? ""}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
									</Field>
								)}
							</form.Field>
							<form.Field name="incentiveAmount">
								{(field) => (
									<Field>
										<FieldLabel>
											Incentives <InheritedIndicator />
										</FieldLabel>
										<Input
											type="number"
											value={
												field.state.value == null
													? ""
													: String(field.state.value)
											}
											onChange={(e) =>
												field.handleChange(
													e.target.value
														? Number.parseInt(e.target.value, 10)
														: undefined,
												)
											}
											disabled={lockFields}
											onBlur={field.handleBlur}
										/>
									</Field>
								)}
							</form.Field>
							<form.Field name="interviewRequired">
								{(field) => (
									<Field>
										<FieldLabel>
											Interview Required <InheritedIndicator />
										</FieldLabel>
										<Select
											value={field.state.value ?? ""}
											onValueChange={(v) =>
												field.handleChange(
													v === ""
														? undefined
														: (v as JobPostingDetailsValues["interviewRequired"]),
												)
											}
											disabled={lockFields}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select interview type" />
											</SelectTrigger>
											<SelectContent>
												{REQUISITION_TEMPLATE_INTERVIEW_TYPE_OPTIONS.map(
													(o) => (
														<SelectItem key={o.value} value={o.value}>
															{o.label}
														</SelectItem>
													),
												)}
											</SelectContent>
										</Select>
									</Field>
								)}
							</form.Field>
							<form.Field
								name="hiringManagerId"
								validators={{
									onChange: jobPostingDetailsFieldsSchema.shape.hiringManagerId,
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
												Hiring Manager <RequiredStar />
											</FieldLabel>
											<Select
												value={field.state.value}
												onValueChange={field.handleChange}
												disabled={lockFields}
											>
												<SelectTrigger id={field.name} aria-invalid={isInvalid}>
													<SelectValue placeholder="Select hiring manager" />
												</SelectTrigger>
												<SelectContent>
													{(membersQuery.data?.data ?? []).map((m) => (
														<SelectItem key={m.user.id} value={m.user.id}>
															{m.user.name ?? m.user.email}
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
						<Separator />
						<h3 className="font-semibold">Job Description</h3>
						<form.Field
							name="description"
							validators={{
								onChange: jobPostingDetailsFieldsSchema.shape.description,
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
											Description <RequiredStar /> <InheritedIndicator />
										</FieldLabel>
										<Textarea
											id={field.name}
											rows={4}
											value={field.state.value}
											disabled={lockFields}
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

						<Separator />
						<h3 className="font-semibold">Benefits & Perks</h3>
						<form.Field name="benefitsPerks">
							{(field) => (
								<Field>
									<FieldLabel>
										Benefits & Perks
										<Badge variant="secondary">Optional</Badge>
										<InheritedIndicator />
									</FieldLabel>
									<div className="flex gap-2">
										<Input
											value={benefitInput}
											disabled={lockFields}
											onChange={(e) => setBenefitInput(e.target.value)}
											placeholder="Type a benefit and press Enter"
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													e.preventDefault();
													addBenefit();
												}
											}}
										/>
										<Button
											type="button"
											onClick={addBenefit}
											disabled={lockFields}
										>
											<Plus className="size-4" />
											Add
										</Button>
									</div>
									<div className="mt-2 flex flex-wrap gap-2">
										{field.state.value.map((item, index) => (
											<span
												key={`${item}-${index}`}
												className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground"
											>
												{item}
												<button
													type="button"
													disabled={lockFields}
													onClick={() => {
														const next = [...field.state.value];
														next.splice(index, 1);
														field.handleChange(next);
													}}
												>
													<X className="size-3.5" />
												</button>
											</span>
										))}
									</div>
								</Field>
							)}
						</form.Field>
						<Separator />
						<h3 className="font-semibold">Compliance</h3>
						<form.Field
							name="complianceTemplateId"
							validators={{
								onChange:
									jobPostingDetailsFieldsSchema.shape.complianceTemplateId,
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
										<div className="bg-muted/50 flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
											<div className="min-w-0 flex-1 space-y-2">
												<FieldLabel htmlFor={field.name}>
													Compliance Checklist Template <RequiredStar />{" "}
													<InheritedIndicator />
												</FieldLabel>
												<Select
													value={field.state.value}
													onValueChange={field.handleChange}
													disabled={lockFields}
												>
													<SelectTrigger
														id={field.name}
														aria-invalid={isInvalid}
														className="bg-background"
													>
														<SelectValue placeholder="Select checklist" />
													</SelectTrigger>
													<SelectContent>
														{(checklistsQuery.data?.data ?? []).map((c) => (
															<SelectItem key={c.id} value={c.id}>
																{c.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</div>
											<Button
												type="button"
												variant="outline"
												onClick={() => setComplianceOpen(true)}
												className="text-primary shrink-0"
												disabled={!field.state.value}
											>
												View Template
											</Button>
										</div>
									</Field>
								);
							}}
						</form.Field>
					</FieldGroup>

					<div className="flex justify-end gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={onBack}
							disabled={isPending}
						>
							Back
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={onCancel}
							disabled={isPending}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting || isPending}>
							{isSubmitting || isPending ? "Saving..." : "Next \u2192"}
						</Button>
					</div>
				</form>

				<ComplianceTemplateDialog
					open={complianceOpen}
					onOpenChange={setComplianceOpen}
					complianceTemplateId={complianceTemplateId}
					showInheritedDescription
				/>
			</CardContent>
		</Card>
	);
}
