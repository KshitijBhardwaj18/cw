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
import { Plus, X } from "lucide-react";
import {
	REQUISITION_TEMPLATE_INTERVIEW_TYPE_OPTIONS,
	REQUISITION_TEMPLATE_SHIFT_TYPE_OPTIONS,
} from "@/constants/requisition-templates";
import { useJobPostingDetailsStepForm } from "@/hooks/job-posting/use-job-posting-details-step-form";
import {
	type JobPostingDetailsValues,
	jobPostingDetailsSchema,
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
}: JobDetailsStepProps) {
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
								onChange: jobPostingDetailsSchema.shape.requisitionName,
							}}
						>
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
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
									onChange: jobPostingDetailsSchema.shape.location,
								}}
							>
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
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
									onChange: jobPostingDetailsSchema.shape.occupation,
								}}
							>
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
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
													form.setFieldValue("specialty", "");
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
							<form.Field
								name="specialty"
								validators={{
									onChange: jobPostingDetailsSchema.shape.specialty,
								}}
							>
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>
												Required Specialty <RequiredStar />{" "}
												<InheritedIndicator />
											</FieldLabel>
											<Select
												value={field.state.value}
												onValueChange={(v) => field.handleChange(v)}
												disabled={
													lockFields ||
													!selectedOrganizationOccupationId ||
													organizationSpecialtyOptions.length === 0
												}
											>
												<SelectTrigger id={field.name} aria-invalid={isInvalid}>
													<SelectValue placeholder="Select specialty" />
												</SelectTrigger>
												<SelectContent>
													{organizationSpecialtyOptions.length === 0 ? (
														<SelectItem value="__empty__" disabled>
															{selectedOrganizationOccupationId
																? "No specialties linked for this occupation"
																: "Select an occupation first"}
														</SelectItem>
													) : (
														organizationSpecialtyOptions.map((o) => (
															<SelectItem key={o.id} value={o.id}>
																{o.name}
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
								name="department"
								validators={{
									onChange: jobPostingDetailsSchema.shape.department,
								}}
							>
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
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
													{(departmentsQuery.data ?? []).map((d) => (
														<SelectItem key={d.id} value={d.id}>
															{d.name}
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
								name="shiftType"
								validators={{
									onChange: jobPostingDetailsSchema.shape.shiftType,
								}}
							>
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
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
							<form.Field name="startDate">
								{(field) => (
									<Field>
										<FieldLabel>
											Start Date <InheritedIndicator />
										</FieldLabel>
										<DatePicker
											value={field.state.value}
											onChange={field.handleChange}
										/>
									</Field>
								)}
							</form.Field>
							<form.Field name="endDate">
								{(field) => (
									<Field>
										<FieldLabel>
											End Date <InheritedIndicator />
										</FieldLabel>
										<DatePicker
											value={field.state.value ?? ""}
											onChange={(v) => field.handleChange(v || "")}
										/>
									</Field>
								)}
							</form.Field>
							<form.Field name="lengthWeeks">
								{(field) => (
									<Field>
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
										/>
									</Field>
								)}
							</form.Field>
							<form.Field name="startTime">
								{(field) => (
									<Field>
										<FieldLabel>
											Start Time <InheritedIndicator />
										</FieldLabel>
										<TimePicker
											value={field.state.value}
											onChange={field.handleChange}
										/>
									</Field>
								)}
							</form.Field>
							<form.Field name="endTime">
								{(field) => (
									<Field>
										<FieldLabel>
											End Time <InheritedIndicator />
										</FieldLabel>
										<TimePicker
											value={field.state.value}
											onChange={field.handleChange}
										/>
									</Field>
								)}
							</form.Field>
							<form.Field name="shiftHours">
								{(field) => (
									<Field>
										<FieldLabel>
											Shift Hours <InheritedIndicator />
										</FieldLabel>
										<Input
											type="number"
											value={String(field.state.value)}
											disabled={lockFields}
											onBlur={field.handleBlur}
											onChange={(e) => {
												const v = e.target.value;
												field.handleChange(v ? Number.parseFloat(v) : 0);
											}}
										/>
									</Field>
								)}
							</form.Field>
							<form.Field name="shiftsPerWeek">
								{(field) => (
									<Field>
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
										/>
									</Field>
								)}
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
							<form.Field name="billRate">
								{(field) => (
									<Field>
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
											/>
											<InputGroupAddon align="inline-end">/hr</InputGroupAddon>
										</InputGroup>
									</Field>
								)}
							</form.Field>
							<form.Field name="numberOfPositions">
								{(field) => (
									<Field>
										<FieldLabel>
											# of Open Positions <InheritedIndicator />
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
										/>
									</Field>
								)}
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
									onChange: jobPostingDetailsSchema.shape.hiringManagerId,
								}}
							>
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>
												Hiring Manager <RequiredStar /> <InheritedIndicator />
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
						<form.Field name="description">
							{(field) => (
								<Field>
									<FieldLabel>
										Description <InheritedIndicator />
									</FieldLabel>
									<Textarea
										rows={4}
										value={field.state.value}
										disabled={lockFields}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
								</Field>
							)}
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
								onChange: jobPostingDetailsSchema.shape.complianceTemplateId,
							}}
						>
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
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
						<Button
							type="submit"
							disabled={form.state.isSubmitting || isPending}
						>
							{form.state.isSubmitting || isPending
								? "Saving..."
								: "Next \u2192"}
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
