"use client";

import { Checkbox } from "@repo/ui/components/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { FormDialogFooter } from "@repo/ui/general/FormDialogFooter";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { formFieldShowInvalid } from "@repo/ui/lib/form-field-display";
import { useForm, useStore } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useDialogFormEntitySnapshot } from "@/hooks/use-dialog-form-entity-snapshot";
import {
	useCreateTaggingRuleMutation,
	useTaggingRulesQuestionsQuery,
	useTaggingRulesTagsListQuery,
	useUpdateTaggingRuleMutation,
} from "@/queries/tagging-rules.query";
import {
	CATEGORY_OPTIONS,
	CONDITION_OPTIONS,
	type TaggingRuleFormValues,
	taggingRuleFormBaseSchema,
	taggingRuleFormSchema,
} from "@/schemas/tagging-rule.schema";
import type {
	QuestionSourceType,
	TaggingRuleWithDetails,
} from "@/services/tagging-rules.service";
import { TaggingRulesService } from "@/services/tagging-rules.service";

function getDefaultFormValues(): TaggingRuleFormValues {
	return {
		ruleName: "",
		questionSourceType: "OCCUPATION",
		organizationOccupationId: "",
		organizationSpecialtyId: "",
		questionId: "",
		condition: "EQUALS",
		triggerValue: "",
		tagId: "",
		category: "Nursing",
		showOnSubmission: false,
	};
}

function ruleToFormValues(rule: TaggingRuleWithDetails): TaggingRuleFormValues {
	const trigger = rule.taggingRuleQuestions[0];
	const q = trigger?.question?.questionnaire;
	const questionSourceType: QuestionSourceType = q?.occupationId
		? "OCCUPATION"
		: "SPECIALTY";
	return {
		ruleName: rule.ruleName,
		questionSourceType,
		organizationOccupationId: q?.occupationId ?? "",
		organizationSpecialtyId: q?.specialtyId ?? "",
		questionId: trigger?.questionId ?? "",
		condition:
			(trigger?.condition as TaggingRuleFormValues["condition"]) ?? "EQUALS",
		triggerValue: trigger?.triggerValue ?? "",
		tagId: rule.tagId,
		category: rule.category,
		showOnSubmission: rule.showOnSubmission,
	};
}

type CreateTaggingRuleDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	organizationId: string;
	initialRule?: TaggingRuleWithDetails | null;
};

export function CreateTaggingRuleDialog({
	open,
	onOpenChange,
	organizationId,
	initialRule,
}: Readonly<CreateTaggingRuleDialogProps>) {
	const snapshotRule =
		useDialogFormEntitySnapshot(open, initialRule ?? null) ?? undefined;
	const isEdit = !!snapshotRule;

	const createMutation = useCreateTaggingRuleMutation(organizationId);
	const updateMutation = useUpdateTaggingRuleMutation(organizationId);

	const { data: occupations = [] } = useQuery({
		queryKey: ["tagging-rules", "occupations", organizationId],
		queryFn: () => TaggingRulesService.getOccupations(organizationId),
		enabled: open,
	});

	const { data: specialties = [] } = useQuery({
		queryKey: ["tagging-rules", "specialties", organizationId],
		queryFn: () => TaggingRulesService.getSpecialties(organizationId),
		enabled: open,
	});

	const { data: tagsList = [] } = useTaggingRulesTagsListQuery(organizationId, {
		enabled: open,
	});

	const form = useForm({
		defaultValues: snapshotRule
			? ruleToFormValues(snapshotRule)
			: getDefaultFormValues(),
		validators: { onSubmit: taggingRuleFormSchema },
		onSubmitInvalid: () => {
			toast.error("Please fill in all required fields");
		},
		onSubmit: ({ value }) => {
			const payload = {
				ruleName: value.ruleName,
				questionSourceType: value.questionSourceType as QuestionSourceType,
				organizationOccupationId:
					value.questionSourceType === "OCCUPATION"
						? value.organizationOccupationId
						: undefined,
				organizationSpecialtyId:
					value.questionSourceType === "SPECIALTY"
						? value.organizationSpecialtyId
						: undefined,
				questionId: value.questionId,
				condition: value.condition,
				triggerValue: value.triggerValue,
				tagId: value.tagId,
				category: value.category,
				showOnSubmission: value.showOnSubmission,
			};

			const onError = (err: unknown) => {
				toast.error(
					err instanceof Error ? err.message : "Failed to save tagging rule",
				);
			};
			const onSaved = () => {
				onOpenChange(false);
			};

			if (isEdit && snapshotRule) {
				updateMutation.mutate(
					{
						taggingRuleId: snapshotRule.id,
						payload: {
							ruleName: payload.ruleName,
							questionId: payload.questionId,
							condition: payload.condition,
							triggerValue: payload.triggerValue,
							tagId: payload.tagId,
							category: payload.category,
							showOnSubmission: payload.showOnSubmission,
						},
					},
					{
						onSuccess: () => {
							toast.success("Tagging rule updated successfully");
							onSaved();
						},
						onError,
					},
				);
			} else {
				createMutation.mutate(payload, {
					onSuccess: () => {
						toast.success("Tagging rule created successfully");
						onSaved();
					},
					onError,
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
			form.reset(
				snapshotRule ? ruleToFormValues(snapshotRule) : getDefaultFormValues(),
			);
		}
		wasOpenRef.current = open;
	}, [open, snapshotRule, form]);

	type FormValuesSlice = {
		sourceType: QuestionSourceType;
		organizationOccupationId: string;
		organizationSpecialtyId: string;
		questionId: string;
		condition: string;
		triggerValue: string;
	};

	const formValues = useStore(
		form.store,
		(state): FormValuesSlice => ({
			sourceType: state.values.questionSourceType as QuestionSourceType,
			organizationOccupationId: state.values.organizationOccupationId ?? "",
			organizationSpecialtyId: state.values.organizationSpecialtyId ?? "",
			questionId: state.values.questionId ?? "",
			condition: state.values.condition ?? "EQUALS",
			triggerValue: state.values.triggerValue ?? "",
		}),
		(a, b) => {
			const prev = a as FormValuesSlice;
			const next = b as FormValuesSlice;
			return (
				prev.sourceType === next.sourceType &&
				prev.organizationOccupationId === next.organizationOccupationId &&
				prev.organizationSpecialtyId === next.organizationSpecialtyId &&
				prev.questionId === next.questionId &&
				prev.condition === next.condition &&
				prev.triggerValue === next.triggerValue
			);
		},
	);

	const { data: questions = [], isLoading: questionsLoading } =
		useTaggingRulesQuestionsQuery(
			organizationId,
			formValues.sourceType,
			formValues.sourceType === "OCCUPATION"
				? formValues.organizationOccupationId
				: undefined,
			formValues.sourceType === "SPECIALTY"
				? formValues.organizationSpecialtyId
				: undefined,
			{ enabled: open },
		);

	const selectedQuestion = questions.find(
		(q) => q.id === formValues.questionId,
	);
	const conditionLabel =
		CONDITION_OPTIONS.find((o) => o.value === formValues.condition)?.label ??
		formValues.condition;

	const rulePreview =
		selectedQuestion && formValues.triggerValue
			? `When the answer to "${selectedQuestion.questionText}" ${conditionLabel.toLowerCase()} "${formValues.triggerValue}", the tag will be applied automatically`
			: "Select a question and trigger value to see the preview";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{isEdit ? "Edit Tagging Rule" : "Create Tagging Rule"}
					</DialogTitle>
					<DialogDescription>
						Define automated tagging logic based on Occupation or Specialty
						questionnaire responses.
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						void form.handleSubmit();
					}}
					className="space-y-6"
				>
					<FieldGroup>
						<form.Field
							name="ruleName"
							validators={{
								onChange: taggingRuleFormBaseSchema.shape.ruleName,
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
											Rule Name <RequiredStar />
										</FieldLabel>
										<Input
											id={field.name}
											placeholder="e.g., ICU Experience Tag"
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

						<div className="space-y-4">
							<h3 className="font-semibold text-sm">Tagging Logic</h3>

							<form.Field
								name="questionSourceType"
								validators={{
									onChange: taggingRuleFormBaseSchema.shape.questionSourceType,
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
												Question Source Type <RequiredStar />
											</FieldLabel>
											<Select
												value={field.state.value}
												onValueChange={(v) => {
													field.handleChange(v as "OCCUPATION" | "SPECIALTY");
													form.setFieldValue("organizationOccupationId", "");
													form.setFieldValue("organizationSpecialtyId", "");
													form.setFieldValue("questionId", "");
												}}
											>
												<SelectTrigger
													id={field.name}
													className="w-full"
													aria-invalid={isInvalid}
												>
													<SelectValue placeholder="Select source type" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="OCCUPATION">
														Occupation Questionnaire
													</SelectItem>
													<SelectItem value="SPECIALTY">
														Specialty Questionnaire
													</SelectItem>
												</SelectContent>
											</Select>
											<FieldDescription>
												Choose whether this rule applies to Occupation or
												Specialty questionnaires.
											</FieldDescription>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							</form.Field>

							{formValues.sourceType === "OCCUPATION" && (
								<form.Field
									name="organizationOccupationId"
									validators={{
										onChange:
											taggingRuleFormBaseSchema.shape.organizationOccupationId,
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
														form.setFieldValue("questionId", "");
													}}
												>
													<SelectTrigger
														id={field.name}
														className="w-full"
														aria-invalid={isInvalid}
													>
														<SelectValue placeholder="Select occupation" />
													</SelectTrigger>
													<SelectContent>
														{occupations.map((o) => (
															<SelectItem key={o.id} value={o.id}>
																{o.occupation.name}
															</SelectItem>
														))}
														{occupations.length === 0 && (
															<div className="py-1 px-2 text-sm text-muted-foreground">
																No occupations found for this organization.
															</div>
														)}
													</SelectContent>
												</Select>
												<FieldDescription>
													Select the specific occupation that contains the
													question
												</FieldDescription>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								</form.Field>
							)}

							{formValues.sourceType === "SPECIALTY" && (
								<form.Field
									name="organizationSpecialtyId"
									validators={{
										onChange:
											taggingRuleFormBaseSchema.shape.organizationSpecialtyId,
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
													Specialty <RequiredStar />
												</FieldLabel>
												<Select
													value={field.state.value}
													onValueChange={(v) => {
														field.handleChange(v);
														form.setFieldValue("questionId", "");
													}}
												>
													<SelectTrigger
														id={field.name}
														className="w-full"
														aria-invalid={isInvalid}
													>
														<SelectValue placeholder="Select specialty" />
													</SelectTrigger>
													<SelectContent>
														{specialties.map((s) => (
															<SelectItem key={s.id} value={s.id}>
																{s.specialty.name}
																{s.organizationOccupation?.occupation && (
																	<span className="text-muted-foreground ml-1 text-xs">
																		({s.organizationOccupation.occupation.name})
																	</span>
																)}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FieldDescription>
													Select the specific specialty that contains the
													question
												</FieldDescription>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								</form.Field>
							)}

							<form.Field
								name="questionId"
								validators={{
									onChange: taggingRuleFormBaseSchema.shape.questionId,
								}}
							>
								{(field) => {
									const isInvalid = formFieldShowInvalid(
										field.state.meta.isTouched,
										field.state.meta.isValid,
										submissionAttempts,
									);
									const disabled =
										!(
											(formValues.sourceType === "OCCUPATION" &&
												formValues.organizationOccupationId) ||
											(formValues.sourceType === "SPECIALTY" &&
												formValues.organizationSpecialtyId)
										) || questionsLoading;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>
												Trigger Question <RequiredStar />
											</FieldLabel>
											<Select
												value={field.state.value}
												onValueChange={(v) =>
													field.handleChange(v as typeof field.state.value)
												}
												disabled={disabled}
											>
												<SelectTrigger
													id={field.name}
													className="w-full"
													aria-invalid={isInvalid}
												>
													<SelectValue
														placeholder={
															disabled
																? "First select an occupation or specialty"
																: "Select a question"
														}
													/>
												</SelectTrigger>
												<SelectContent>
													{questions.map((q) => (
														<SelectItem key={q.id} value={q.id}>
															<span className="line-clamp-2">
																{q.questionText}
															</span>
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FieldDescription>
												Questions from the
												{formValues.sourceType === "OCCUPATION" &&
												formValues.organizationOccupationId
													? ` ${
															occupations.find(
																(o) =>
																	o.id === formValues.organizationOccupationId,
															)?.occupation.name ?? ""
														} Occupation questionnaire`
													: formValues.sourceType === "SPECIALTY" &&
															formValues.organizationSpecialtyId
														? ` ${
																specialties.find(
																	(s) =>
																		s.id === formValues.organizationSpecialtyId,
																)?.specialty.name ?? ""
															} Specialty questionnaire`
														: " selected questionnaire"}
											</FieldDescription>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							</form.Field>

							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<form.Field
									name="condition"
									validators={{
										onChange: taggingRuleFormBaseSchema.shape.condition,
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
													Condition <RequiredStar />
												</FieldLabel>
												<Select
													value={field.state.value}
													onValueChange={(v) =>
														field.handleChange(v as typeof field.state.value)
													}
												>
													<SelectTrigger
														id={field.name}
														className="w-full"
														aria-invalid={isInvalid}
													>
														<SelectValue placeholder="Select condition" />
													</SelectTrigger>
													<SelectContent>
														{CONDITION_OPTIONS.map((opt) => (
															<SelectItem key={opt.value} value={opt.value}>
																{opt.label}
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
									name="triggerValue"
									validators={{
										onChange: taggingRuleFormBaseSchema.shape.triggerValue,
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
													Trigger Value <RequiredStar />
												</FieldLabel>
												<Input
													id={field.name}
													placeholder="e.g., ICU, Yes, 5"
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
							</div>

							<div className="rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-900/50 dark:bg-blue-950/30">
								<p className="text-muted-foreground text-sm">
									<strong>Rule Preview:</strong> {rulePreview}
								</p>
							</div>

							<form.Field
								name="tagId"
								validators={{ onChange: taggingRuleFormBaseSchema.shape.tagId }}
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
												Tag to Apply <RequiredStar />
											</FieldLabel>
											<Select
												value={field.state.value}
												onValueChange={(v) =>
													field.handleChange(v as typeof field.state.value)
												}
											>
												<SelectTrigger
													id={field.name}
													className="w-full"
													aria-invalid={isInvalid}
												>
													<SelectValue placeholder="Select a tag" />
												</SelectTrigger>
												<SelectContent>
													{tagsList.map((t) => (
														<SelectItem key={t.id} value={t.id}>
															{t.name}
														</SelectItem>
													))}
													{tagsList.length === 0 && (
														<div className="py-1 px-2 text-sm text-muted-foreground">
															No tags found. Please create tags in the Tags
															section before creating rules.
														</div>
													)}
												</SelectContent>
											</Select>
											<FieldDescription>
												This tag will be applied to the candidate profile
												(hidden from candidates, visible to admins/vendors/MSPs)
											</FieldDescription>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							</form.Field>

							<form.Field
								name="category"
								validators={{
									onChange: taggingRuleFormBaseSchema.shape.category,
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
												Category <RequiredStar />
											</FieldLabel>
											<Select
												value={field.state.value}
												onValueChange={(v) =>
													field.handleChange(v as typeof field.state.value)
												}
											>
												<SelectTrigger
													id={field.name}
													className="w-full"
													aria-invalid={isInvalid}
												>
													<SelectValue placeholder="Select category" />
												</SelectTrigger>
												<SelectContent>
													{CATEGORY_OPTIONS.map((opt) => (
														<SelectItem key={opt.value} value={opt.value}>
															{opt.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FieldDescription>
												Rules will be grouped by category for easier
												organization
											</FieldDescription>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							</form.Field>

							<form.Field name="showOnSubmission">
								{(field) => (
									<Field>
										<div className="flex items-start gap-2">
											<Checkbox
												id={field.name}
												checked={field.state.value}
												onCheckedChange={(c) => field.handleChange(c === true)}
												className="mt-0.5"
											/>
											<div>
												<FieldLabel
													htmlFor={field.name}
													className="font-normal"
												>
													Show on Submission
												</FieldLabel>
												<FieldDescription>
													When enabled, this tag will be visible to Organization
													Managers during candidate review
												</FieldDescription>
											</div>
										</div>
									</Field>
								)}
							</form.Field>
						</div>
					</FieldGroup>

					<FormDialogFooter
						form={form}
						submitLabel={isEdit ? "Save Rule" : "Create Rule"}
						submitLoadingLabel={isEdit ? "Saving..." : "Creating..."}
						onCancel={() => onOpenChange(false)}
						isPending={createMutation.isPending || updateMutation.isPending}
					/>
				</form>
			</DialogContent>
		</Dialog>
	);
}
