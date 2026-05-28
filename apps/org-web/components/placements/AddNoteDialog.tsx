"use client";

import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import { Textarea } from "@repo/ui/components/textarea";
import { formFieldShowInvalid } from "@repo/ui/lib/form-field-display";
import { useForm, useStore } from "@tanstack/react-form";

export interface AddNoteDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (payload: { text: string }) => void | Promise<void>;
	isPending?: boolean;
}

export function AddNoteDialog({
	open,
	onOpenChange,
	onSubmit,
	isPending = false,
}: Readonly<AddNoteDialogProps>) {
	const form = useForm({
		defaultValues: {
			text: "",
		},
		onSubmit: async ({ value }) => {
			try {
				await onSubmit({ text: value.text.trim() });
				form.reset();
				onOpenChange(false);
			} catch {
				// Parent shows error toast; keep dialog open.
			}
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
			<DialogContent className="max-h-[90dvh] max-w-md overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Add Note</DialogTitle>
					<DialogDescription>
						Add a note to this placement. Notes are visible to your team.
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						void form.handleSubmit();
					}}
					className="space-y-4"
				>
					<form.Field
						name="text"
						validators={{
							onBlur: ({ value }) =>
								!value || value.trim().length === 0
									? "Note text is required"
									: undefined,
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
									<FieldLabel htmlFor={field.name}>Note Text</FieldLabel>
									<Textarea
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Enter your note here..."
										rows={4}
										className="resize-none"
									/>
									{isInvalid && <FieldError>Note text is required</FieldError>}
								</Field>
							);
						}}
					</form.Field>

					<DialogFooter className="flex-row justify-end gap-2 sm:justify-end">
						<Button
							type="button"
							variant="outline"
							onClick={() => handleOpenChange(false)}
							disabled={isPending}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending ? "Saving..." : "Save Note"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
