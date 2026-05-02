"use client";

import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
	Dialog,
	DialogContent,
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
import { Textarea } from "@repo/ui/components/textarea";
import { FormDialogFooter } from "@repo/ui/general/FormDialogFooter";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { useForm } from "@tanstack/react-form";
import { Plus, X } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import {
	QUESTION_TYPE_OPTIONS,
	QUESTION_TYPE_REQUIRES_OPTIONS,
} from "@/constants/questionnaire";
import {
	type QuestionFormValues,
	questionFormBaseSchema,
} from "@/schemas/questionnaire.schema";
import type { QuestionWithTagging } from "@/services/questionnaire.service";

export interface AddQuestionDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	questionnaireId: string;
	organizationId: string;
	onSuccess: () => void;
	onCreate: (payload: QuestionFormValues) => Promise<unknown>;
	onUpdate?: (
		questionId: string,
		payload: QuestionFormValues,
	) => Promise<unknown>;
	initialQuestion?: QuestionWithTagging | null;
}

function getDefaultValues(
	initialQuestion?: QuestionWithTagging | null,
): QuestionFormValues {
	if (initialQuestion) {
		return {
			questionText: initialQuestion.questionText,
			type: initialQuestion.type,
			options:
				initialQuestion.options.length > 0
					? [...initialQuestion.options]
					: [""],
			required: initialQuestion.required,
			includeInSubmission: initialQuestion.includeInSubmission,
		};
	}
	return {
		questionText: "",
		type: "TEXT",
		options: [],
		required: false,
		includeInSubmission: false,
	};
}

export function AddQuestionDialog({
	open,
	onOpenChange,
	onSuccess,
	onCreate,
	onUpdate,
	initialQuestion,
}: AddQuestionDialogProps) {
	const isEditMode = !!initialQuestion;

	const form = useForm({
		defaultValues: getDefaultValues(initialQuestion),
		validators: {
			onSubmit: questionFormBaseSchema,
		},
		onSubmit: async ({ value }) => {
			if (
				QUESTION_TYPE_REQUIRES_OPTIONS.includes(
					value.type as "CHECKBOX" | "SELECT" | "RADIO_BUTTON",
				)
			) {
				const validOptions = value.options.filter((o) => o.trim().length > 0);
				if (validOptions.length === 0) {
					toast.error("At least one option is required for this question type");
					return;
				}
			}

			const payload: QuestionFormValues = {
				...value,
				options: QUESTION_TYPE_REQUIRES_OPTIONS.includes(
					value.type as "CHECKBOX" | "SELECT" | "RADIO_BUTTON",
				)
					? value.options.filter((o) => o.trim().length > 0)
					: [],
			};

			try {
				if (isEditMode && initialQuestion && onUpdate) {
					await onUpdate(initialQuestion.id, payload);
					toast.success("Question updated successfully");
				} else {
					await onCreate(payload);
					toast.success("Question added successfully");
				}
				onSuccess();
				onOpenChange(false);
			} catch (err) {
				toast.error(
					err instanceof Error ? err.message : "Something went wrong",
				);
			}
		},
	});

	useEffect(() => {
		if (open) {
			form.reset(getDefaultValues(initialQuestion));
		}
	}, [open, initialQuestion, form]);

	const handleAddOption = () => {
		form.setFieldValue("options", [...form.state.values.options, ""]);
	};

	const handleRemoveOption = (index: number) => {
		const next = form.state.values.options.filter((_, i) => i !== index);
		form.setFieldValue("options", next.length > 0 ? next : [""]);
	};

	const handleOptionChange = (index: number, value: string) => {
		const next = [...form.state.values.options];
		next[index] = value;
		form.setFieldValue("options", next);
	};

	const closeForm = () => {
		form.reset();
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{isEditMode ? "Edit Question" : "Add Question"}
					</DialogTitle>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						void form.handleSubmit();
					}}
					className="space-y-5"
				>
					<FieldGroup>
						<form.Field
							name="questionText"
							validators={{
								onChange: questionFormBaseSchema.shape.questionText,
							}}
						>
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>
											Question Text <RequiredStar />
										</FieldLabel>
										<Textarea
											id={field.name}
											name={field.name}
											placeholder="Enter your question..."
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
											rows={3}
										/>
										{isInvalid && (
											<FieldError>
												{field.state.meta.errors.join(", ")}
											</FieldError>
										)}
									</Field>
								);
							}}
						</form.Field>

						<form.Field name="type">
							{(field) => (
								<Field>
									<FieldLabel htmlFor={field.name}>Question Type</FieldLabel>
									<Select
										value={field.state.value}
										onValueChange={(v) => {
											const newType = v as QuestionFormValues["type"];
											field.handleChange(newType);
											if (
												QUESTION_TYPE_REQUIRES_OPTIONS.includes(
													newType as "CHECKBOX" | "SELECT" | "RADIO_BUTTON",
												)
											) {
												const opts = form.state.values.options;
												if (opts.filter((o) => o.trim()).length === 0) {
													form.setFieldValue("options", [""]);
												}
											} else {
												form.setFieldValue("options", []);
											}
										}}
									>
										<SelectTrigger id={field.name}>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{QUESTION_TYPE_OPTIONS.map((opt) => (
												<SelectItem key={opt.value} value={opt.value}>
													{opt.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</Field>
							)}
						</form.Field>

						<form.Subscribe selector={(s) => s.values.type}>
							{(typeValue) =>
								QUESTION_TYPE_REQUIRES_OPTIONS.includes(
									typeValue as "CHECKBOX" | "SELECT" | "RADIO_BUTTON",
								) ? (
									<form.Field name="options">
										{(field) => (
											<Field>
												<FieldLabel>Options</FieldLabel>
												<FieldDescription>
													Add options for candidates to choose from.
												</FieldDescription>
												<div className="space-y-2">
													{field.state.value.map((opt, index) => (
														<div
															key={index}
															className="flex items-center gap-2"
														>
															<Input
																placeholder={`Option ${index + 1}`}
																value={opt}
																onChange={(e) =>
																	handleOptionChange(index, e.target.value)
																}
																className="flex-1"
															/>
															<Button
																type="button"
																variant="ghost"
																size="icon"
																className="h-8 w-8 shrink-0"
																aria-label="Remove option"
																onClick={() => handleRemoveOption(index)}
															>
																<X className="size-4" />
															</Button>
														</div>
													))}
													<Button
														type="button"
														variant="outline"
														size="sm"
														onClick={handleAddOption}
													>
														<Plus className="size-4" data-icon="inline-start" />
														Add option
													</Button>
												</div>
											</Field>
										)}
									</form.Field>
								) : null
							}
						</form.Subscribe>

						<form.Field name="required">
							{(field) => (
								<Field>
									<div className="flex items-center gap-2">
										<Checkbox
											id={field.name}
											checked={field.state.value}
											onCheckedChange={(c) => field.handleChange(c === true)}
										/>
										<FieldLabel htmlFor={field.name} className="font-normal">
											Required
										</FieldLabel>
									</div>
								</Field>
							)}
						</form.Field>

						<form.Field name="includeInSubmission">
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
											<FieldLabel htmlFor={field.name} className="font-normal">
												Include in Submission Readiness
											</FieldLabel>
											<FieldDescription>
												Show this question to candidates on their submission
												readiness screen. You can manage the display order
												later.
											</FieldDescription>
										</div>
									</div>
								</Field>
							)}
						</form.Field>
					</FieldGroup>

					<FormDialogFooter
						form={form}
						submitLabel={isEditMode ? "Update Question" : "Add Question"}
						submitLoadingLabel={isEditMode ? "Updating..." : "Adding..."}
						onCancel={closeForm}
					/>
				</form>
			</DialogContent>
		</Dialog>
	);
}
