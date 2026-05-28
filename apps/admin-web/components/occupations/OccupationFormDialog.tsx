"use client";
import { type OccupationResponseType, OccupationStatus } from "@repo/shared";
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
import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { INDUSTRY_OPTIONS } from "@/constants/occupations";
import { useDialogFormEntitySnapshot } from "@/hooks/use-dialog-form-entity-snapshot";
import {
	useCreateOccupation,
	useUpdateOccupation,
} from "@/queries/occupations.query";
import { useSpecialties } from "@/queries/specialties.query";
import {
	OccupationFormSchema,
	type OccupationFormValues,
} from "@/schemas/occupation.schema";

function getOccupationDefaultValues(
	occupation?: OccupationResponseType,
): OccupationFormValues {
	return {
		name: occupation?.name ?? "",
		code: occupation?.code ?? "",
		industry:
			(occupation?.industry as OccupationFormValues["industry"]) ?? null,
		acronym: occupation?.acronym ?? "",
		description: occupation?.description ?? null,
		status: (occupation?.status as OccupationStatus) ?? OccupationStatus.ACTIVE,
		hasSpecialty: occupation?.hasSpecialty ?? false,
		specialtyIds:
			occupation?.occupationSpecialties?.map((os) => os.specialty.id) ?? [],
	};
}

export interface OccupationFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	occupation?: OccupationResponseType;
}

export function OccupationFormDialog({
	open,
	onOpenChange,
	occupation,
}: Readonly<OccupationFormDialogProps>) {
	const snapshotOccupation =
		useDialogFormEntitySnapshot(open, occupation ?? null) ?? undefined;
	const isEditMode = !!snapshotOccupation;

	const createMutation = useCreateOccupation();
	const updateMutation = useUpdateOccupation();
	const { data: specialties } = useSpecialties();

	const isPending = createMutation.isPending || updateMutation.isPending;

	const form = useForm({
		defaultValues: getOccupationDefaultValues(snapshotOccupation),
		validators: {
			onSubmit: OccupationFormSchema,
		},
		onSubmit: ({ value }) => {
			if (isEditMode && snapshotOccupation) {
				updateMutation.mutate(
					{ id: snapshotOccupation.id, data: value },
					{
						onSuccess: () => {
							toast.success("Occupation updated successfully");
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
						toast.success("Occupation created successfully");
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

	const wasOpenRef = useRef(false);
	useEffect(() => {
		if (open && !wasOpenRef.current) {
			form.reset(getOccupationDefaultValues(snapshotOccupation));
		}
		wasOpenRef.current = open;
	}, [open, snapshotOccupation, form]);

	const closeForm = () => {
		onOpenChange(false);
	};

	const handleOpenChange = (nextOpen: boolean) => {
		if (isPending) return;
		onOpenChange(nextOpen);
	};

	const handleClose = () => {
		handleOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{isEditMode ? "Edit Occupation" : "Create New Occupation"}
					</DialogTitle>
					<DialogDescription>
						{isEditMode
							? "Update the occupation details below."
							: "Add a new occupation that candidates can select during sign-up."}
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
								name="name"
								validators={{ onChange: OccupationFormSchema.shape.name }}
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
												Name <RequiredStar />
											</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												placeholder="e.g., Registered Nurse"
												disabled={isPending}
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
								name="code"
								validators={{ onChange: OccupationFormSchema.shape.code }}
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
												Code <RequiredStar />
											</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												placeholder="e.g., 29-1141.00"
												disabled={isPending}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
											/>
											<FieldDescription>
												Occupation code (e.g., SOC code, O*NET code, or custom).
											</FieldDescription>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							</form.Field>
						</div>

						<form.Field name="industry">
							{(field) => (
								<Field>
									<FieldLabel htmlFor={field.name}>Industry</FieldLabel>
									<Select
										value={field.state.value ?? ""}
										onValueChange={(val) =>
											field.handleChange(
												val === ""
													? null
													: (val as OccupationFormValues["industry"]),
											)
										}
									>
										<SelectTrigger
											id={field.name}
											className="w-full"
											disabled={isPending}
										>
											<SelectValue placeholder="Select industry" />
										</SelectTrigger>
										<SelectContent>
											{INDUSTRY_OPTIONS.map((opt) => (
												<SelectItem key={opt.value} value={opt.value}>
													{opt.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</Field>
							)}
						</form.Field>

						<form.Field
							name="acronym"
							validators={{ onChange: OccupationFormSchema.shape.acronym }}
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
											Acronym <RequiredStar />
										</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											placeholder="e.g., RN, LPN"
											disabled={isPending}
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
							name="description"
							validators={{ onChange: OccupationFormSchema.shape.description }}
						>
							{(field) => {
								const isInvalid = formFieldShowInvalid(
									field.state.meta.isTouched,
									field.state.meta.isValid,
									submissionAttempts,
								);
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Description</FieldLabel>
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
								<div className="flex items-center gap-2.5">
									<Checkbox
										id={field.name}
										checked={field.state.value === OccupationStatus.ACTIVE}
										disabled={isPending}
										onCheckedChange={(checked) =>
											field.handleChange(
												checked
													? OccupationStatus.ACTIVE
													: OccupationStatus.INACTIVE,
											)
										}
									/>
									<Label
										htmlFor={field.name}
										className="cursor-pointer font-normal"
									>
										Active (visible in candidate sign-up)
									</Label>
								</div>
							)}
						</form.Field>

						<form.Field name="hasSpecialty">
							{(field) => (
								<div className="flex items-center gap-2.5">
									<Checkbox
										id={field.name}
										checked={field.state.value}
										disabled={isPending}
										onCheckedChange={(checked) => {
											field.handleChange(checked === true);
											if (!checked) {
												form.setFieldValue("specialtyIds", []);
											}
										}}
									/>
									<Label
										htmlFor={field.name}
										className="cursor-pointer font-normal"
									>
										Does this occupation have any specialty?
									</Label>
								</div>
							)}
						</form.Field>

						<form.Subscribe selector={(s) => s.values.hasSpecialty}>
							{(hasSpecialty) =>
								hasSpecialty ? (
									<form.Field name="specialtyIds">
										{(field) => {
											const options = (specialties ?? [])
												.filter((s) => s.status === "ACTIVE")
												.map((s) => ({
													value: s.id,
													label: s.acronym,
													description: s.name,
												}));
											return (
												<Field>
													<FieldLabel>Specialties</FieldLabel>
													<MultiSelect
														values={field.state.value ?? []}
														onValuesChange={field.handleChange}
													>
														<MultiSelectTrigger
															disabled={isPending}
															className="w-full"
														>
															<MultiSelectValue placeholder="Select specialties" />
														</MultiSelectTrigger>
														<MultiSelectContent
															search={{
																placeholder: "Search specialties...",
																emptyMessage: "No specialties found",
															}}
														>
															{options.map((opt) => (
																<MultiSelectItem
																	key={opt.value}
																	value={opt.value}
																	badgeLabel={opt.label}
																>
																	<span className="font-medium">
																		{opt.label}
																	</span>
																	{opt.description && (
																		<span className="text-muted-foreground ml-2 text-xs">
																			{opt.description}
																		</span>
																	)}
																</MultiSelectItem>
															))}
														</MultiSelectContent>
													</MultiSelect>
												</Field>
											);
										}}
									</form.Field>
								) : null
							}
						</form.Subscribe>
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
										"Update Occupation"
									) : (
										"Create Occupation"
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
