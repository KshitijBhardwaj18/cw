"use client";

import { NOTE_TYPE_OPTIONS } from "@repo/shared";
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
import { formFieldShowInvalid } from "@repo/ui/lib/form-field-display";
import { useForm, useStore } from "@tanstack/react-form";
import { useEffect, useRef } from "react";
import { useDialogFormEntitySnapshot } from "@/hooks/use-dialog-form-entity-snapshot";
import { useUserTimezone } from "@/hooks/use-user-timezone";
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
}: Readonly<NoteEditDialogProps>) {
	const dialogOpen = !!note;
	const snapshotNote = useDialogFormEntitySnapshot(dialogOpen, note);
	const { fmtShortDate } = useUserTimezone();

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
		},
	});

	const submissionAttempts = useStore(
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);

	const wasOpenRef = useRef(false);
	useEffect(() => {
		if (dialogOpen && !wasOpenRef.current) {
			if (snapshotNote) {
				form.reset({
					type: snapshotNote.type,
					notes: snapshotNote.notes,
				});
			} else {
				form.reset({ type: "", notes: "" });
			}
		}
		wasOpenRef.current = dialogOpen;
	}, [dialogOpen, snapshotNote, form]);

	const handleOpenChange = (nextOpen: boolean) => {
		onOpenChange(nextOpen);
	};

	return (
		<Dialog open={!!note} onOpenChange={handleOpenChange}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto">
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
					{readOnly && snapshotNote ? (
						<>
							<Field>
								<FieldLabel>Date</FieldLabel>
								<p className="text-muted-foreground mt-1 text-sm">
									{fmtShortDate(snapshotNote.createdAt)}
								</p>
							</Field>
							<Field>
								<FieldLabel>Author</FieldLabel>
								<p className="text-muted-foreground mt-1 text-sm">
									{snapshotNote.user?.name ?? "—"}
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
										onBlur: ({ value }) =>
											!value || value.length === 0
												? "Notes type is required"
												: undefined,
									}
						}
					>
						{(field) => {
							const isInvalid =
								!readOnly &&
								formFieldShowInvalid(
									field.state.meta.isTouched,
									field.state.meta.isValid,
									submissionAttempts,
								);
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel>Notes Type</FieldLabel>
									<Select
										value={field.state.value}
										onValueChange={(value) => {
											field.handleChange(value);
											field.handleBlur();
										}}
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
										onBlur: ({ value }) =>
											!value || value.trim().length === 0
												? "Notes are required"
												: undefined,
									}
						}
					>
						{(field) => {
							const isInvalid =
								!readOnly &&
								formFieldShowInvalid(
									field.state.meta.isTouched,
									field.state.meta.isValid,
									submissionAttempts,
								);
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
