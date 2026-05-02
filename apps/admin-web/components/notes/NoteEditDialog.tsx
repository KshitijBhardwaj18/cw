"use client";

import { formatDate, NOTE_TYPE_OPTIONS } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { Textarea } from "@repo/ui/components/textarea";
import { useForm } from "@tanstack/react-form";
import { useEffect } from "react";
import type { NoteWithUser } from "@/types/vendor";

interface NoteEditDialogProps {
	note: NoteWithUser | null;
	isPending?: boolean;
	readOnly?: boolean;
	onSubmit?: (payload: { type: string; notes: string }) => void | Promise<void>;
	onOpenChange: (open: boolean) => void;
}

export function NoteEditDialog({
	note,
	isPending = false,
	readOnly = false,
	onSubmit,
	onOpenChange,
}: NoteEditDialogProps) {
	const form = useForm({
		defaultValues: {
			type: "",
			notes: "",
		},
		onSubmit: async ({ value }) => {
			if (readOnly || !onSubmit) return;
			await onSubmit({
				type: value.type,
				notes: value.notes,
			});
			onOpenChange(false);
			form.reset();
		},
	});

	useEffect(() => {
		if (note) {
			form.reset({
				type: note.type,
				notes: note.notes,
			});
		}
	}, [note, form]);

	const handleOpenChange = (open: boolean) => {
		if (!open) form.reset();
		onOpenChange(open);
	};

	return (
		<Dialog open={!!note} onOpenChange={handleOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{readOnly ? "Note Details" : "Edit Note"}</DialogTitle>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						if (!readOnly) void form.handleSubmit();
					}}
					className="space-y-4"
				>
					{readOnly && note ? (
						<>
							<Field>
								<FieldLabel>Date</FieldLabel>
								<p className="text-muted-foreground mt-1 text-sm">
									{note.createdAt
										? formatDate(note.createdAt, "M/d/yyyy")
										: "—"}
								</p>
							</Field>
							<Field>
								<FieldLabel>Author</FieldLabel>
								<p className="text-muted-foreground mt-1 text-sm">
									{note.user?.name ?? "—"}
								</p>
							</Field>
						</>
					) : null}
					<form.Field
						name="type"
						validators={
							readOnly
								? undefined
								: {
										onChange: ({ value }) =>
											!value || value.length === 0
												? "Notes type is required"
												: undefined,
									}
						}
					>
						{(field) => {
							const isInvalid =
								!readOnly &&
								field.state.meta.isTouched &&
								(!field.state.value || field.state.value.length === 0);
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel>Notes Type</FieldLabel>
									<Select
										value={field.state.value}
										onValueChange={(value) => field.handleChange(value)}
										disabled={readOnly}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select a type" />
										</SelectTrigger>
										<SelectContent>
											{NOTE_TYPE_OPTIONS.map((nt) => (
												<SelectItem key={nt.value} value={nt.value}>
													{nt.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{isInvalid && <FieldError>Notes type is required</FieldError>}
								</Field>
							);
						}}
					</form.Field>

					<form.Field
						name="notes"
						validators={
							readOnly
								? undefined
								: {
										onChange: ({ value }) =>
											!value || value.trim().length === 0
												? "Notes are required"
												: undefined,
									}
						}
					>
						{(field) => {
							const isInvalid =
								!readOnly &&
								field.state.meta.isTouched &&
								(!field.state.value || field.state.value.trim().length === 0);
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Notes</FieldLabel>
									<Textarea
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Add your notes here..."
										rows={4}
										disabled={readOnly}
										readOnly={readOnly}
										className={readOnly ? "resize-none" : undefined}
									/>
									{isInvalid && <FieldError>Notes are required</FieldError>}
								</Field>
							);
						}}
					</form.Field>

					<DialogFooter>
						{readOnly ? (
							<Button type="button" onClick={() => handleOpenChange(false)}>
								Close
							</Button>
						) : (
							<>
								<Button
									type="button"
									variant="outline"
									onClick={() => handleOpenChange(false)}
									disabled={isPending}
								>
									Cancel
								</Button>
								<Button type="submit" disabled={isPending}>
									{isPending ? "Saving..." : "Save Changes"}
								</Button>
							</>
						)}
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
