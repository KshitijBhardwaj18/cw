"use client";

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
import RequiredStar from "@repo/ui/general/RequiredStar";
import { formFieldShowInvalid } from "@repo/ui/lib/form-field-display";
import { useForm, useStore } from "@tanstack/react-form";
import { toast } from "sonner";
import { REQUISITION_TEMPLATE_INTERVIEW_TYPE_OPTIONS } from "@/constants/requisition-templates";
import {
	type RequisitionTemplateCompensationFormValues,
	requisitionTemplateCompensationSchema,
} from "@/schemas/requisition-template-compensation.schema";
import { STEP_VALIDATION_TOAST } from "./CreateRequisitionTemplatePageContent";

const defaultValues: RequisitionTemplateCompensationFormValues = {
	billRate: 0,
	numberOfPositions: 1,
	incentiveType: "",
	incentiveAmount: undefined,
	interviewRequired: undefined,
	hiringManagerId: undefined,
};

interface CompensationHiringFormProps {
	onSubmit: (values: RequisitionTemplateCompensationFormValues) => void;
	onCancel: () => void;
	onBack?: () => void;
	isPending?: boolean;
	initialValues?: RequisitionTemplateCompensationFormValues;
	readOnly?: boolean;
}

export function CompensationHiringForm({
	onSubmit,
	onCancel,
	onBack,
	isPending = false,
	initialValues,
	readOnly = false,
}: CompensationHiringFormProps) {
	const form = useForm({
		defaultValues: initialValues ?? defaultValues,
		validators: {
			onSubmit: requisitionTemplateCompensationSchema,
		},
		onSubmitInvalid: () => {
			toast.error(STEP_VALIDATION_TOAST);
		},
		onSubmit: ({ value }) => {
			onSubmit(value);
		},
	});

	const submissionAttempts = useStore(
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Compensation & Hiring</CardTitle>
				<CardDescription>
					Define the bill rate, positions, incentives, and hiring details for
					this requisition template
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
								name="billRate"
								validators={{
									onChange:
										requisitionTemplateCompensationSchema.shape.billRate,
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
												Bill Rate <RequiredStar />
											</FieldLabel>
											<InputGroup>
												<InputGroupAddon>
													<span>$</span>
												</InputGroupAddon>
												<InputGroupInput
													id={field.name}
													name={field.name}
													type="number"
													min={1}
													step={1}
													disabled={isPending || readOnly}
													placeholder="95"
													value={
														!field.state.value || field.state.value === 0
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
												<InputGroupAddon align="inline-end">
													<span className="text-muted-foreground">
														per hour
													</span>
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
										requisitionTemplateCompensationSchema.shape
											.numberOfPositions,
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
												Number of Positions <RequiredStar />
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

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<form.Field name="incentiveType">
								{(field) => (
									<Field>
										<FieldLabel htmlFor={field.name}>Incentive Type</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											disabled={isPending || readOnly}
											value={field.state.value ?? ""}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="e.g., Signing Bonus, Overtime Bonus"
										/>
									</Field>
								)}
							</form.Field>

							<form.Field
								name="incentiveAmount"
								validators={{
									onChange:
										requisitionTemplateCompensationSchema.shape.incentiveAmount,
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
											<FieldLabel htmlFor={field.name}>Incentives</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												type="number"
												min={0}
												step={1}
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
														v ? Number.parseInt(v, 10) : undefined,
													);
												}}
												placeholder="e.g., 5000"
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
								name="interviewRequired"
								validators={{
									onChange:
										requisitionTemplateCompensationSchema.shape
											.interviewRequired,
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
												Interview Required
											</FieldLabel>
											<Select
												value={field.state.value ?? ""}
												onValueChange={(v) =>
													field.handleChange(
														v === ""
															? undefined
															: (v as RequisitionTemplateCompensationFormValues["interviewRequired"]),
													)
												}
												disabled={isPending || readOnly}
											>
												<SelectTrigger id={field.name} aria-invalid={isInvalid}>
													<SelectValue placeholder="Select option" />
												</SelectTrigger>
												<SelectContent>
													{REQUISITION_TEMPLATE_INTERVIEW_TYPE_OPTIONS.map(
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
