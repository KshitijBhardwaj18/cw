"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/radio-group";
import { Textarea } from "@repo/ui/components/textarea";
import { FormDialogFooter } from "@repo/ui/general/FormDialogFooter";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { formFieldShowInvalid } from "@repo/ui/lib/form-field-display";
import { useForm, useStore } from "@tanstack/react-form";
import { toast } from "sonner";
import { type ProjectFormValues, projectFormSchema } from "@/schemas";

type ProjectFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	submitLabel: string;
	submitLoadingLabel: string;
	defaultValues?: ProjectFormValues;
	onSubmit: (values: ProjectFormValues) => void;
	isPending?: boolean;
};

const INITIAL_VALUES: ProjectFormValues = {
	name: "",
	description: "",
	status: "Active",
};

export function ProjectFormDialog({
	open,
	onOpenChange,
	title,
	submitLabel,
	submitLoadingLabel,
	defaultValues,
	onSubmit,
	isPending = false,
}: ProjectFormDialogProps) {
	const form = useForm({
		defaultValues: defaultValues ?? INITIAL_VALUES,
		validators: { onSubmit: projectFormSchema },
		onSubmitInvalid: () => {
			toast.error("Please complete required project fields.");
		},
		onSubmit: ({ value }) => {
			onSubmit(value);
		},
	});

	const submissionAttempts = useStore(
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);

	const handleOpenChange = (next: boolean) => {
		if (!next) {
			form.reset();
		}
		onOpenChange(next);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="flex max-h-[90dvh] min-h-0 flex-col overflow-hidden p-0 sm:max-w-xl">
				<DialogHeader className="shrink-0 px-5 py-4 border-b">
					<DialogTitle className="text-xl font-bold">{title}</DialogTitle>
				</DialogHeader>
				<form
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						void form.handleSubmit();
					}}
					className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 pb-5"
				>
					<form.Field name="name">
						{(field) => (
							<Field
								data-invalid={formFieldShowInvalid(
									field.state.meta.isTouched,
									field.state.meta.isValid,
									submissionAttempts,
								)}
							>
								<FieldLabel htmlFor={field.name}>
									Project Name <RequiredStar />
								</FieldLabel>
								<Input
									id={field.name}
									value={field.state.value}
									onChange={(event) => field.handleChange(event.target.value)}
									onBlur={field.handleBlur}
									placeholder="e.g., Q1 2026 Nursing Expansion"
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					</form.Field>

					<form.Field name="description">
						{(field) => (
							<Field
								data-invalid={formFieldShowInvalid(
									field.state.meta.isTouched,
									field.state.meta.isValid,
									submissionAttempts,
								)}
							>
								<FieldLabel htmlFor={field.name}>Description</FieldLabel>
								<Textarea
									id={field.name}
									rows={4}
									value={field.state.value}
									onChange={(event) => field.handleChange(event.target.value)}
									onBlur={field.handleBlur}
									placeholder="Provide a brief description of this project..."
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					</form.Field>

					<form.Field name="status">
						{(field) => (
							<Field>
								<FieldLabel htmlFor={field.name}>
									Status <RequiredStar />
								</FieldLabel>
								<RadioGroup
									value={field.state.value}
									onValueChange={(value) =>
										field.handleChange(value as ProjectFormValues["status"])
									}
									className="flex items-center gap-6"
								>
									<div className="flex items-center gap-2">
										<RadioGroupItem id="project-status-active" value="Active" />
										<label htmlFor="project-status-active" className="text-sm">
											Active
										</label>
									</div>
									<div className="flex items-center gap-2">
										<RadioGroupItem
											id="project-status-inactive"
											value="Inactive"
										/>
										<label
											htmlFor="project-status-inactive"
											className="text-sm"
										>
											Inactive
										</label>
									</div>
								</RadioGroup>
							</Field>
						)}
					</form.Field>

					<FormDialogFooter
						form={form}
						onCancel={() => handleOpenChange(false)}
						submitLabel={submitLabel}
						submitLoadingLabel={submitLoadingLabel}
						isPending={isPending}
					/>
				</form>
			</DialogContent>
		</Dialog>
	);
}
