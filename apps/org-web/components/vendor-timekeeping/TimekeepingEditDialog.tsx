"use client";

import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { DetailItem } from "@repo/ui/components/detail-item";
import {
	Dialog,
	DialogContent,
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { Textarea } from "@repo/ui/components/textarea";
import { TimePicker } from "@repo/ui/components/time-picker";
import { formFieldShowInvalid } from "@repo/ui/lib/form-field-display";
import { useForm, useStore } from "@tanstack/react-form";
import { useEffect } from "react";
import {
	type VendorTimekeepingFormValues,
	vendorTimekeepingSchema,
} from "@/schemas/vendor-timekeeping.schema";
import type { VendorTimekeepingEntry } from "@/types/vendor-timekeeping";
import { clockStringToHHmmForPicker } from "@/utils/time-entry";

interface TimekeepingEditDialogProps {
	isOpen: boolean;
	onClose: () => void;
	entry: VendorTimekeepingEntry | null;
	onSave: (values: VendorTimekeepingFormValues) => void;
	payCodeOptions: Array<{
		id: string;
		code: string;
		description: string;
	}>;
}

export function TimekeepingEditDialog({
	isOpen,
	onClose,
	entry,
	onSave,
	payCodeOptions,
}: TimekeepingEditDialogProps) {
	const form = useForm({
		defaultValues: {
			startTime: entry ? clockStringToHHmmForPicker(entry.startTime) : "",
			endTime: entry ? clockStringToHHmmForPicker(entry.endTime) : "",
			payCodeId: entry?.payCode?.id ?? null,
			note: entry?.note ?? "",
		} as VendorTimekeepingFormValues,
		validators: { onSubmit: vendorTimekeepingSchema },
		onSubmit: async ({ value }) => {
			onSave(value);
			onClose();
		},
	});

	const submissionAttempts = useStore(
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);

	useEffect(() => {
		if (entry && isOpen) {
			form.reset({
				startTime: clockStringToHHmmForPicker(entry.startTime),
				endTime: clockStringToHHmmForPicker(entry.endTime),
				payCodeId: entry.payCode?.id ?? null,
				note: entry.note ?? "",
			});
		}
	}, [entry, isOpen, form]);

	if (!entry) return null;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Edit Timecard</DialogTitle>
				</DialogHeader>

				<Card className="bg-muted">
					<CardContent className="space-y-2">
						<DetailItem
							flow="row"
							label="Candidate"
							value={entry.candidateName}
						/>
						<DetailItem flow="row" label="Job Title" value={entry.jobTitle} />
						<DetailItem
							flow="row"
							label="Organization"
							value={entry.organization}
						/>
						<DetailItem flow="row" label="Date" value={entry.date} />
					</CardContent>
				</Card>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						void form.handleSubmit();
					}}
				>
					<FieldGroup className="py-2 mt-4">
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<form.Field
								name="startTime"
								validators={{
									onChange: vendorTimekeepingSchema.shape.startTime,
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
											<FieldLabel htmlFor={field.name}>Start Time</FieldLabel>
											<TimePicker
												id={field.name}
												value={field.state.value}
												onChange={(v) => field.handleChange(v)}
												onBlur={field.handleBlur}
												placeholder="Select time"
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
								name="endTime"
								validators={{
									onChange: vendorTimekeepingSchema.shape.endTime,
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
											<FieldLabel htmlFor={field.name}>End Time</FieldLabel>
											<TimePicker
												id={field.name}
												value={field.state.value}
												onChange={(v) => field.handleChange(v)}
												onBlur={field.handleBlur}
												placeholder="Select time"
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

						<form.Field name="note">
							{(field) => (
								<Field>
									<FieldLabel htmlFor={field.name}>Note</FieldLabel>
									<Textarea
										id={field.name}
										placeholder="Add a note..."
										value={field.state.value ?? ""}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										className="min-h-[100px] resize-none"
									/>
									<FieldDescription>
										Optional note for this timecard entry.
									</FieldDescription>
								</Field>
							)}
						</form.Field>
						<form.Field name="payCodeId">
							{(field) => (
								<Field>
									<FieldLabel htmlFor={field.name}>Pay Code</FieldLabel>
									<Select
										value={field.state.value ?? "__none__"}
										onValueChange={(value) =>
											field.handleChange(value === "__none__" ? null : value)
										}
									>
										<SelectTrigger id={field.name}>
											<SelectValue placeholder="Select pay code" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="__none__">Select pay code</SelectItem>
											{payCodeOptions.map((opt) => (
												<SelectItem key={opt.id} value={opt.id}>
													{opt.code}
													{opt.description ? ` - ${opt.description}` : ""}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</Field>
							)}
						</form.Field>
					</FieldGroup>

					<form.Subscribe
						selector={(state) => ({
							canSubmit: state.canSubmit,
							isSubmitting: state.isSubmitting,
						})}
					>
						{({ canSubmit, isSubmitting }) => (
							<DialogFooter className="mt-6 gap-3">
								<Button variant="outline" onClick={onClose} type="button">
									Cancel
								</Button>
								<Button type="submit" disabled={!canSubmit || isSubmitting}>
									{isSubmitting ? "Saving..." : "Save Changes"}
								</Button>
							</DialogFooter>
						)}
					</form.Subscribe>
				</form>
			</DialogContent>
		</Dialog>
	);
}
