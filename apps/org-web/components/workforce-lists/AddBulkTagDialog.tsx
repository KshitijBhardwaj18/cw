"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { FormDialogFooter } from "@repo/ui/general/FormDialogFooter";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { formFieldShowInvalid } from "@repo/ui/lib/form-field-display";
import { useForm, useStore } from "@tanstack/react-form";
import { toast } from "sonner";
import { bulkTagSchema } from "@/schemas/workforce-lists.schema";

type AddBulkTagDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	listName: string;
	onConfirm: (tagName: string) => void;
};

export function AddBulkTagDialog({
	open,
	onOpenChange,
	listName,
	onConfirm,
}: AddBulkTagDialogProps) {
	const form = useForm({
		defaultValues: {
			tagName: "",
		},
		validators: { onSubmit: bulkTagSchema },
		onSubmitInvalid: () => {
			toast.error("Please enter a valid tag name.");
		},
		onSubmit: async ({ value }) => {
			onConfirm(value.tagName);
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
					<DialogTitle>Add Bulk Tag to {listName}</DialogTitle>
				</DialogHeader>

				<form
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						void form.handleSubmit();
					}}
					className="space-y-4"
				>
					<form.Field name="tagName">
						{(field) => (
							<Field
								data-invalid={formFieldShowInvalid(
									field.state.meta.isTouched,
									field.state.meta.isValid,
									submissionAttempts,
								)}
							>
								<FieldLabel htmlFor={field.name}>
									Tag Name <RequiredStar />
								</FieldLabel>
								<Input
									id={field.name}
									value={field.state.value}
									onChange={(event) => field.handleChange(event.target.value)}
									onBlur={field.handleBlur}
									placeholder="e.g., ICU, Night Shift"
								/>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					</form.Field>

					<FormDialogFooter
						form={form}
						onCancel={() => handleOpenChange(false)}
						submitLabel="Add Tag"
						submitLoadingLabel="Adding..."
					/>
				</form>
			</DialogContent>
		</Dialog>
	);
}
