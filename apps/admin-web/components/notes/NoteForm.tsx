"use client";

import { NOTE_TYPE_OPTIONS } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
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
import type { AddNotePayload } from "@/types/vendor";

export interface NoteFormProps {
	onSubmit: (payload: AddNotePayload) => void | Promise<void>;
	isPending: boolean;
}

export function NoteForm({ onSubmit, isPending }: Readonly<NoteFormProps>) {
	const form = useForm({
		defaultValues: {
			type: "",
			notes: "",
		},
		onSubmit: async ({ value }) => {
			await onSubmit({
				type: value.type,
				notes: value.notes,
			});
			form.reset();
		},
	});

	const submissionAttempts = useStore(
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);

	return (
		<Card>
			<CardContent className="px-6">
				<h3 className="mb-4 text-lg font-semibold">Add Note</h3>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<form.Field
							name="type"
							validators={{
								onChange: ({ value }) =>
									!value || value.length === 0
										? "Notes type is required"
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
										<FieldLabel>
											Notes Type <RequiredStar />
										</FieldLabel>
										<Select
											value={field.state.value}
											onValueChange={(value) => field.handleChange(value)}
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
										{isInvalid && (
											<FieldError>Notes type is required</FieldError>
										)}
									</Field>
								);
							}}
						</form.Field>

						<form.Field
							name="notes"
							validators={{
								onChange: ({ value }) =>
									!value || value.trim().length === 0
										? "Notes are required"
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
										<FieldLabel htmlFor={field.name}>
											Notes <RequiredStar />
										</FieldLabel>
										<Textarea
											id={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="Add your notes here..."
											rows={3}
										/>
										{isInvalid && <FieldError>Notes are required</FieldError>}
									</Field>
								);
							}}
						</form.Field>
					</div>

					<div className="mt-4 flex justify-end">
						<Button type="submit" disabled={isPending}>
							{isPending ? "Saving..." : "Save Note"}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
