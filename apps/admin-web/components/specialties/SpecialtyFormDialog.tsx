"use client";

import { type SpecialtyResponseType, SpecialtyStatus } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
	MultiSelect,
	MultiSelectContent,
	MultiSelectItem,
	MultiSelectTrigger,
	MultiSelectValue,
} from "@repo/ui/components/multi-select";
import { Textarea } from "@repo/ui/components/textarea";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { formFieldShowInvalid } from "@repo/ui/lib/form-field-display";
import { useForm, useStore } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useOccupations } from "@/queries/occupations.query";
import {
	useCreateSpecialty,
	useUpdateSpecialty,
} from "@/queries/specialties.query";
import {
	SpecialtyFormSchema,
	type SpecialtyFormValues,
} from "@/schemas/specialty.schema";

function getSpecialtyDefaultValues(
	specialty?: SpecialtyResponseType,
): SpecialtyFormValues {
	return {
		acronym: specialty?.acronym ?? "",
		name: specialty?.name ?? "",
		group: specialty?.group ?? null,
		description: specialty?.description ?? null,
		status: (specialty?.status as SpecialtyStatus) ?? SpecialtyStatus.ACTIVE,
		occupationIds:
			specialty?.occupationSpecialties?.map((os) => os.occupation.id) ?? [],
	};
}

export interface SpecialtyFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	specialty?: SpecialtyResponseType;
}

export function SpecialtyFormDialog({
	open,
	onOpenChange,
	specialty,
}: SpecialtyFormDialogProps) {
	const isEditMode = !!specialty;

	const createMutation = useCreateSpecialty();
	const updateMutation = useUpdateSpecialty();
	const { data: occupations } = useOccupations();

	const isPending = createMutation.isPending || updateMutation.isPending;

	const form = useForm({
		defaultValues: getSpecialtyDefaultValues(specialty),
		validators: {
			onSubmit: SpecialtyFormSchema,
		},
		onSubmit: ({ value }) => {
			if (isEditMode) {
				updateMutation.mutate(
					{ id: specialty.id, data: value },
					{
						onSuccess: () => {
							toast.success("Specialty updated successfully");
							closeForm();
						},
						onError: (err) => {
							toast.error(
								err instanceof Error ? err.message : "Something went wrong",
							);
						},
					},
				);
			} else {
				createMutation.mutate(value, {
					onSuccess: () => {
						toast.success("Specialty created successfully");
						closeForm();
					},
					onError: (err) => {
						toast.error(
							err instanceof Error ? err.message : "Something went wrong",
						);
					},
				});
			}
		},
	});

	const submissionAttempts = useStore(
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);

	useEffect(() => {
		if (!open) return;
		form.reset(getSpecialtyDefaultValues(specialty));
	}, [open, specialty, form]);

	const closeForm = () => {
		form.reset();
		onOpenChange(false);
	};

	const handleOpenChange = (nextOpen: boolean) => {
		if (isPending) return;
		if (!nextOpen) form.reset();
		onOpenChange(nextOpen);
	};

	const handleClose = () => {
		if (isPending) return;
		form.reset();
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{isEditMode ? "Edit Specialty" : "Create New Specialty"}
					</DialogTitle>
					<DialogDescription>
						{isEditMode
							? "Update the specialty details below."
							: "Add a new specialty that can be linked to occupations."}
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						void form.handleSubmit();
					}}
					className="space-y-5"
				>
					<FieldGroup>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<form.Field
								name="acronym"
								validators={{ onChange: SpecialtyFormSchema.shape.acronym }}
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
												Specialties Acronym <RequiredStar />
											</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												placeholder="e.g., ICU, ER, TELE"
												disabled={isPending}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
											/>
											<FieldDescription>Short display name</FieldDescription>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							</form.Field>

							<form.Field
								name="name"
								validators={{ onChange: SpecialtyFormSchema.shape.name }}
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
												Full Name <RequiredStar />
											</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												placeholder="e.g., Intensive Care Unit"
												disabled={isPending}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
											/>
											<FieldDescription>
												Complete specialty name
											</FieldDescription>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							</form.Field>
						</div>

						<form.Field
							name="group"
							validators={{ onChange: SpecialtyFormSchema.shape.group }}
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
											Group (Optional)
										</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											placeholder="e.g., Critical Care, Medical, Surgical"
											disabled={isPending}
											value={field.state.value ?? ""}
											onBlur={field.handleBlur}
											onChange={(e) =>
												field.handleChange(
													e.target.value === "" ? null : e.target.value,
												)
											}
											aria-invalid={isInvalid}
										/>
										<FieldDescription>
											Group name for organizing specialties
										</FieldDescription>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						</form.Field>

						<form.Field
							name="occupationIds"
							validators={{
								onChange: SpecialtyFormSchema.shape.occupationIds,
							}}
						>
							{(field) => {
								const isInvalid = formFieldShowInvalid(
									field.state.meta.isTouched,
									field.state.meta.isValid,
									submissionAttempts,
								);
								const options = (occupations ?? [])
									.filter((o) => o.hasSpecialty)
									.map((o) => ({
										value: o.id,
										label: o.acronym,
										description: o.name,
									}));
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>
											Linked Occupations <RequiredStar />
										</FieldLabel>
										<MultiSelect
											values={field.state.value ?? []}
											onValuesChange={field.handleChange}
										>
											<MultiSelectTrigger
												disabled={isPending}
												className="w-full"
											>
												<MultiSelectValue placeholder="Select occupations..." />
											</MultiSelectTrigger>
											<MultiSelectContent
												search={{
													placeholder: "Search occupations...",
													emptyMessage: "No occupations found",
												}}
											>
												{options.map((opt) => (
													<MultiSelectItem
														key={opt.value}
														value={opt.value}
														badgeLabel={opt.label}
													>
														<span className="font-medium">{opt.label}</span>
														{opt.description && (
															<span className="text-muted-foreground ml-2 text-xs">
																{opt.description}
															</span>
														)}
													</MultiSelectItem>
												))}
											</MultiSelectContent>
										</MultiSelect>
										<FieldDescription>
											Select which occupations can use this specialty.
										</FieldDescription>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						</form.Field>
						<form.Field
							name="description"
							validators={{ onChange: SpecialtyFormSchema.shape.description }}
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
											Description (Optional)
										</FieldLabel>
										<Textarea
											id={field.name}
											name={field.name}
											placeholder="Optional description"
											rows={3}
											disabled={isPending}
											value={field.state.value ?? ""}
											onBlur={field.handleBlur}
											onChange={(e) =>
												field.handleChange(
													e.target.value === "" ? null : e.target.value,
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

						<form.Field name="status">
							{(field) => (
								<div className="bg-muted/40 rounded-lg border p-4">
									<div className="flex items-start gap-3">
										<Checkbox
											id={field.name}
											checked={field.state.value === SpecialtyStatus.ACTIVE}
											disabled={isPending}
											onCheckedChange={(checked) =>
												field.handleChange(
													checked
														? SpecialtyStatus.ACTIVE
														: SpecialtyStatus.INACTIVE,
												)
											}
											className="mt-0.5"
										/>
										<div className="space-y-0.5">
											<Label
												htmlFor={field.name}
												className="cursor-pointer font-medium"
											>
												Active (visible in system)
											</Label>
											<FieldDescription>
												When active, this specialty will be available across
												Admin, Org, and Candidate portals.
											</FieldDescription>
										</div>
									</div>
								</div>
							)}
						</form.Field>
					</FieldGroup>

					<DialogFooter className="sm:justify-start">
						<form.Subscribe
							selector={(state) => ({
								canSubmit: state.canSubmit,
								isSubmitting: state.isSubmitting,
								isDirty: state.isDirty,
							})}
						>
							{({ canSubmit, isSubmitting, isDirty }) => (
								<Button
									type="submit"
									disabled={
										!canSubmit ||
										isSubmitting ||
										isPending ||
										(isEditMode && !isDirty)
									}
								>
									{isSubmitting || isPending ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin" />
											{isEditMode ? "Saving..." : "Creating..."}
										</>
									) : isEditMode ? (
										"Update Specialty"
									) : (
										"Create Specialty"
									)}
								</Button>
							)}
						</form.Subscribe>
						<Button
							type="button"
							variant="outline"
							onClick={handleClose}
							disabled={isPending}
						>
							Cancel
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
