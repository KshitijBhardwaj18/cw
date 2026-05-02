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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { Textarea } from "@repo/ui/components/textarea";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { useForm, useStore } from "@tanstack/react-form";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { REQUISITION_TEMPLATE_STATUS_OPTIONS } from "@/constants/requisition-templates";
import { useOrgContext } from "@/contexts/org-context";
import {
	useShiftTemplateDepartments,
	useShiftTemplateOccupations,
} from "@/queries/shift-templates.queries";
import { useSpecialtiesForOccupation } from "@/queries/talent-community.queries";
import {
	type RequisitionTemplateDetailsFormValues,
	requisitionTemplateDetailsSchema,
} from "@/schemas/requisition-template-details.schema";

const defaultValues: RequisitionTemplateDetailsFormValues = {
	templateName: "",
	occupationId: "",
	specialtyId: "",
	departmentId: "",
	unitName: "",
	jobDescription: "",
	benefitsPerks: [],
	status: "DRAFT",
};

interface TemplateDetailsFormProps {
	onSubmit: (values: RequisitionTemplateDetailsFormValues) => void;
	onCancel: () => void;
	isPending?: boolean;
	initialValues?: RequisitionTemplateDetailsFormValues;
	readOnly?: boolean;
}

export function TemplateDetailsForm({
	onSubmit,
	onCancel,
	isPending = false,
	initialValues,
	readOnly = false,
}: TemplateDetailsFormProps) {
	const { id: orgId } = useOrgContext();
	const form = useForm({
		defaultValues: initialValues ?? defaultValues,
		validators: {
			onSubmit: requisitionTemplateDetailsSchema,
		},
		onSubmit: ({ value }) => {
			onSubmit(value);
		},
	});

	const [benefitInput, setBenefitInput] = useState("");
	const selectedOccupationId = useStore(
		form.store,
		(s) => s.values.occupationId,
	);
	const occupationsQuery = useShiftTemplateOccupations();
	const departmentsQuery = useShiftTemplateDepartments();
	const specialtiesQuery = useSpecialtiesForOccupation(
		orgId,
		selectedOccupationId || null,
	);

	const handleAddBenefit = () => {
		const value = benefitInput.trim();
		if (!value) return;
		const current = form.state.values.benefitsPerks;
		if (current.includes(value)) return;
		form.setFieldValue("benefitsPerks", [...current, value]);
		setBenefitInput("");
	};

	const handleRemoveBenefit = (index: number) => {
		const current = [...form.state.values.benefitsPerks];
		current.splice(index, 1);
		form.setFieldValue("benefitsPerks", current);
	};

	const handleBenefitsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleAddBenefit();
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Template Details</CardTitle>
				<CardDescription>
					Define the basic information for this requisition template
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
						<form.Field
							name="templateName"
							validators={{
								onChange: requisitionTemplateDetailsSchema.shape.templateName,
							}}
						>
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>
											Template Name <RequiredStar />
										</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											placeholder="e.g., RN - ICU Standard Template"
											disabled={isPending || readOnly}
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

						<form.Field
							name="occupationId"
							validators={{
								onChange: requisitionTemplateDetailsSchema.shape.occupationId,
							}}
						>
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>
											Occupation <RequiredStar />
										</FieldLabel>
										<Select
											value={field.state.value}
											onValueChange={(v) => {
												field.handleChange(v);
												form.setFieldValue("specialtyId", "");
											}}
											disabled={isPending || readOnly}
										>
											<SelectTrigger id={field.name} aria-invalid={isInvalid}>
												<SelectValue placeholder="Select occupation" />
											</SelectTrigger>
											<SelectContent>
												{(occupationsQuery.data ?? []).map((opt) => (
													<SelectItem key={opt.id} value={opt.id}>
														{opt.name}
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
							name="specialtyId"
							validators={{
								onChange: requisitionTemplateDetailsSchema.shape.specialtyId,
							}}
						>
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>
											Specialty <RequiredStar />
										</FieldLabel>
										<Select
											value={field.state.value}
											onValueChange={(v) => field.handleChange(v)}
											disabled={
												isPending ||
												readOnly ||
												!selectedOccupationId ||
												specialtiesQuery.isLoading
											}
										>
											<SelectTrigger id={field.name} aria-invalid={isInvalid}>
												<SelectValue placeholder="Select specialty" />
											</SelectTrigger>
											<SelectContent>
												{specialtiesQuery.isLoading ? (
													<SelectItem value="__loading__" disabled>
														Loading specialties…
													</SelectItem>
												) : (specialtiesQuery.data ?? []).length === 0 ? (
													<SelectItem value="__empty__" disabled>
														No specialties found
													</SelectItem>
												) : (
													(specialtiesQuery.data ?? []).map((opt) => (
														<SelectItem key={opt.id} value={opt.id}>
															{opt.name}
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
							name="departmentId"
							validators={{
								onChange: requisitionTemplateDetailsSchema.shape.departmentId,
							}}
						>
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>
											Department <RequiredStar />
										</FieldLabel>
										<Select
											value={field.state.value}
											onValueChange={(v) => field.handleChange(v)}
											disabled={isPending || readOnly}
										>
											<SelectTrigger id={field.name} aria-invalid={isInvalid}>
												<SelectValue placeholder="Select department" />
											</SelectTrigger>
											<SelectContent>
												{(departmentsQuery.data ?? []).map((opt) => (
													<SelectItem key={opt.id} value={opt.id}>
														{opt.name}
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
									<FieldLabel htmlFor={field.name}>Unit Name</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										placeholder="e.g., ICU - Night Unit"
										disabled={isPending || readOnly}
										value={field.state.value ?? ""}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value || null)}
									/>
								</Field>
							)}
						</form.Field>

						<form.Field
							name="jobDescription"
							validators={{
								onChange: requisitionTemplateDetailsSchema.shape.jobDescription,
							}}
						>
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>
											Job Description <RequiredStar />
										</FieldLabel>
										<Textarea
											id={field.name}
											name={field.name}
											placeholder="Enter job description..."
											disabled={isPending || readOnly}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
											rows={3}
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						</form.Field>

						<form.Field name="benefitsPerks">
							{(field) => (
								<Field>
									<FieldLabel htmlFor="benefits-input">
										Benefits & Perks
									</FieldLabel>
									<div className="flex gap-2">
										<Input
											id="benefits-input"
											placeholder="Type a benefit and press Enter"
											disabled={isPending || readOnly}
											value={benefitInput}
											onChange={(e) => setBenefitInput(e.target.value)}
											onKeyDown={handleBenefitsKeyDown}
										/>
										<Button
											type="button"
											variant="default"
											size="default"
											onClick={handleAddBenefit}
											disabled={isPending || readOnly}
										>
											<Plus className="size-4" data-icon="inline-start" />
											Add
										</Button>
									</div>
									{field.state.value.length === 0 ? (
										<div className="border-muted-foreground/25 mt-2 rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-center text-sm text-muted-foreground">
											No benefits added yet. Add them if needed.
										</div>
									) : (
										<div className="mt-2 flex flex-wrap gap-2">
											{field.state.value.map((item, index) => (
												<span
													key={`${item}-${index}`}
													className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-sm text-primary-foreground"
												>
													{item}
													<button
														type="button"
														aria-label={`Remove ${item}`}
														className="hover:bg-primary-foreground/20 rounded-full p-0.5"
														onClick={() => handleRemoveBenefit(index)}
														disabled={isPending || readOnly}
													>
														<X className="size-3.5" />
													</button>
												</span>
											))}
										</div>
									)}
								</Field>
							)}
						</form.Field>

						<form.Field name="status">
							{(field) => (
								<Field>
									<FieldLabel htmlFor={field.name}>Status</FieldLabel>
									<Select
										value={field.state.value}
										onValueChange={(v) =>
											field.handleChange(
												v as RequisitionTemplateDetailsFormValues["status"],
											)
										}
										disabled={isPending || readOnly}
									>
										<SelectTrigger id={field.name}>
											<SelectValue placeholder="Select status" />
										</SelectTrigger>
										<SelectContent>
											{REQUISITION_TEMPLATE_STATUS_OPTIONS.map((opt) => (
												<SelectItem key={opt.value} value={opt.value}>
													{opt.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</Field>
							)}
						</form.Field>
					</FieldGroup>

					<div className="flex justify-end gap-3 pt-4">
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
							{form.state.isSubmitting || isPending ? "Saving..." : "Next →"}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
