"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import { FormDialogFooter } from "@repo/ui/general/FormDialogFooter";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { formFieldShowInvalid } from "@repo/ui/lib/form-field-display";
import { useForm, useStore } from "@tanstack/react-form";
import { toast } from "sonner";
import {
	type CreateWorkforceListFormValues,
	createWorkforceListSchema,
} from "@/schemas/workforce-lists.schema";

type CreateWorkforceListDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreate: (values: CreateWorkforceListFormValues) => void;
};

export function CreateWorkforceListDialog({
	open,
	onOpenChange,
	onCreate,
}: Readonly<CreateWorkforceListDialogProps>) {
	const form = useForm({
		defaultValues: {
			name: "",
			description: "",
		},
		validators: { onSubmit: createWorkforceListSchema },
		onSubmitInvalid: () => {
			toast.error("Please provide a valid list name.");
		},
		onSubmit: async ({ value }) => {
			onCreate(value);
			toast.success("Workforce list created");
			handleOpenChange(false);
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
			<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Create Workforce List</DialogTitle>
				</DialogHeader>

				<form
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						void form.handleSubmit();
					}}
					className="space-y-4"
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
									List Name <RequiredStar />
								</FieldLabel>
								<Input
									id={field.name}
									value={field.state.value}
									onChange={(event) => field.handleChange(event.target.value)}
									onBlur={field.handleBlur}
									placeholder="e.g., ICU Specialists, Night Shift Team"
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
									value={field.state.value}
									onChange={(event) => field.handleChange(event.target.value)}
									onBlur={field.handleBlur}
									placeholder="What is this list used for?"
									rows={3}
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					</form.Field>

					<FormDialogFooter
						form={form}
						onCancel={() => handleOpenChange(false)}
						submitLabel="Create List"
						submitLoadingLabel="Creating..."
					/>
				</form>
			</DialogContent>
		</Dialog>
	);
}
