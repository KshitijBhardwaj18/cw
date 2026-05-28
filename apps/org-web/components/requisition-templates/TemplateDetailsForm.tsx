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
import { Textarea } from "@repo/ui/components/textarea";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { formFieldShowInvalid } from "@repo/ui/lib/form-field-display";
import { useForm, useStore } from "@tanstack/react-form";
import { Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { REQUISITION_TEMPLATE_STATUS_OPTIONS } from "@/constants/requisition-templates";
import {
	useOrgOccupationSpecialties,
	useShiftTemplateDepartments,
	useShiftTemplateOccupations,
} from "@/queries/shift-templates.queries";
import {
	type RequisitionTemplateDetailsFormValues,
	requisitionTemplateDetailsSchema,
} from "@/schemas/requisition-template-details.schema";
import { STEP_VALIDATION_TOAST } from "./CreateRequisitionTemplatePageContent";

const defaultValues: RequisitionTemplateDetailsFormValues = {
	templateName: "",
	occupationId: "",
	specialtyIds: [],
	locationId: "",
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
}: Readonly<TemplateDetailsFormProps>) {
	const form = useForm({
		defaultValues: initialValues ?? defaultValues,
		validators: {
			onSubmit: requisitionTemplateDetailsSchema,
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

	const [benefitInput, setBenefitInput] = useState("");
	const selectedOccupationId = useStore(
		form.store,
		(s) => s.values.occupationId,
	);
	const selectedLocationId = useStore(form.store, (s) => s.values.locationId);
	const occupationsQuery = useShiftTemplateOccupations();

	const occupationRow = useMemo(
		() =>
			(occupationsQuery.data ?? []).find((o) => o.id === selectedOccupationId),
		[occupationsQuery.data, selectedOccupationId],
	);
	const organizationOccupationId = occupationRow?.organizationOccupationId;

	const allOrganizationDepartmentsQuery = useShiftTemplateDepartments({
		limit: 100,
	});
	const departmentsQuery = useShiftTemplateDepartments({
		limit: 100,
		organizationOccupationId,
		enabled: Boolean(organizationOccupationId),
	});

	const eligibleCatalogOccupationIds = useMemo(() => {
		if (!allOrganizationDepartmentsQuery.isSuccess) return null;
		const rows = allOrganizationDepartmentsQuery.data ?? [];
		const ids = new Set<string>();
		for (const dept of rows) {
			for (const link of dept.departmentOccupations ?? []) {
				const catalogId = link.organizationOccupation?.occupation?.id;
				if (catalogId) ids.add(catalogId);
			}
		}
		return ids;
	}, [
		allOrganizationDepartmentsQuery.isSuccess,
		allOrganizationDepartmentsQuery.data,
	]);

	const occupationOptions = useMemo(() => {
		const rows = occupationsQuery.data ?? [];
		if (!allOrganizationDepartmentsQuery.isSuccess) return rows;
		if (eligibleCatalogOccupationIds == null) return rows;
		return rows.filter((opt) => eligibleCatalogOccupationIds.has(opt.id));
	}, [
		occupationsQuery.data,
		eligibleCatalogOccupationIds,
		allOrganizationDepartmentsQuery.isSuccess,
	]);

	const catalogsReady =
		occupationsQuery.isSuccess && allOrganizationDepartmentsQuery.isSuccess;

	const locationOptions = useMemo(() => {
		const rows = departmentsQuery.data ?? [];
		const byId = new Map<string, { id: string; name: string }>();
		for (const d of rows) {
			byId.set(d.location.id, { id: d.location.id, name: d.location.name });
		}
		return [...byId.values()].sort((a, b) =>
			a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
		);
	}, [departmentsQuery.data]);
	const { data: specialtyRows, isLoading: specialtiesLoading } =
		useOrgOccupationSpecialties(organizationOccupationId);
	const specialtyOptions = useMemo(
		() => (specialtyRows ?? []).map((s) => ({ id: s.id, name: s.name })),
		[specialtyRows],
	);

	const departmentsForLocation = useMemo(() => {
		const rows = departmentsQuery.data ?? [];
		if (!selectedLocationId) return [];
		return rows.filter((d) => d.location.id === selectedLocationId);
	}, [departmentsQuery.data, selectedLocationId]);

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
								const isInvalid = formFieldShowInvalid(
									field.state.meta.isTouched,
									field.state.meta.isValid,
									submissionAttempts,
								);
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
										<Select
											value={field.state.value}
											onValueChange={(v) => {
												field.handleChange(v);
												form.setFieldValue("specialtyIds", []);
												form.setFieldValue("locationId", "");
												form.setFieldValue("departmentId", "");
											}}
											disabled={isPending || readOnly || !catalogsReady}
										>
											<SelectTrigger id={field.name} aria-invalid={isInvalid}>
												<SelectValue placeholder="Select occupation" />
											</SelectTrigger>
											<SelectContent>
												{!catalogsReady ? (
													<SelectItem value="__loading__" disabled>
														Loading occupations…
													</SelectItem>
												) : occupationOptions.length === 0 ? (
													<SelectItem value="__empty__" disabled>
														No occupations with configured departments
													</SelectItem>
												) : (
													occupationOptions.map((opt) => (
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

						<form.Field name="specialtyIds">
							{(field) => {
								const options = specialtyOptions;
								const disabled =
									isPending ||
									readOnly ||
									!selectedOccupationId ||
									specialtiesLoading;
								return (
									<Field>
										<FieldLabel htmlFor={field.name}>Specialties</FieldLabel>
										<MultiSelect
											values={field.state.value}
											onValuesChange={(vals) => field.handleChange(vals)}
										>
											<MultiSelectTrigger
												id={field.name}
												className="w-full"
												disabled={disabled}
											>
												<MultiSelectValue
													placeholder={
														!selectedOccupationId
															? "Select an occupation first"
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
												{specialtiesLoading ? (
													<p className="text-muted-foreground px-2 py-6 text-center text-sm">
														Loading specialties…
													</p>
												) : options.length === 0 ? (
													<p className="text-muted-foreground px-2 py-6 text-center text-sm">
														No specialties found for this occupation.
													</p>
												) : (
													options.map((opt) => (
														<MultiSelectItem key={opt.id} value={opt.id}>
															{opt.name}
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
							name="locationId"
							validators={{
								onChange: requisitionTemplateDetailsSchema.shape.locationId,
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
											Location <RequiredStar />
										</FieldLabel>
										<Select
											value={field.state.value}
											onValueChange={(v) => {
												field.handleChange(v);
												form.setFieldValue("departmentId", "");
											}}
											disabled={
												isPending ||
												readOnly ||
												!organizationOccupationId ||
												departmentsQuery.isPending
											}
										>
											<SelectTrigger id={field.name} aria-invalid={isInvalid}>
												<SelectValue placeholder="Select location" />
											</SelectTrigger>
											<SelectContent>
												{!organizationOccupationId ? (
													<SelectItem value="__needocc__" disabled>
														Select occupation first
													</SelectItem>
												) : departmentsQuery.isPending ? (
													<SelectItem value="__loading__" disabled>
														Loading locations…
													</SelectItem>
												) : locationOptions.length === 0 ? (
													<SelectItem value="__empty__" disabled>
														No locations for this occupation
													</SelectItem>
												) : (
													locationOptions.map((loc) => (
														<SelectItem key={loc.id} value={loc.id}>
															{loc.name}
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
								const isInvalid = formFieldShowInvalid(
									field.state.meta.isTouched,
									field.state.meta.isValid,
									submissionAttempts,
								);
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>
											Department <RequiredStar />
										</FieldLabel>
										<Select
											value={field.state.value}
											onValueChange={(v) => field.handleChange(v)}
											disabled={
												isPending ||
												readOnly ||
												!selectedLocationId ||
												!organizationOccupationId ||
												departmentsQuery.isPending
											}
										>
											<SelectTrigger id={field.name} aria-invalid={isInvalid}>
												<SelectValue
													placeholder={
														selectedLocationId
															? "Select department"
															: "Select location first"
													}
												/>
											</SelectTrigger>
											<SelectContent>
												{!selectedLocationId ? (
													<SelectItem value="__needloc__" disabled>
														Select location first
													</SelectItem>
												) : departmentsQuery.isPending ? (
													<SelectItem value="__loading__" disabled>
														Loading departments…
													</SelectItem>
												) : departmentsForLocation.length === 0 ? (
													<SelectItem value="__empty__" disabled>
														No departments at this location
													</SelectItem>
												) : (
													departmentsForLocation.map((opt) => (
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
								const isInvalid = formFieldShowInvalid(
									field.state.meta.isTouched,
									field.state.meta.isValid,
									submissionAttempts,
								);
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
