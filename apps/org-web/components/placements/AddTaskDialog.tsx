"use client";

import { Button } from "@repo/ui/components/button";
import { DatePicker } from "@repo/ui/components/date-picker";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
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
export type CreatePlacementTaskFormPayload = {
	title: string;
	description?: string;
	/** ISO date string (yyyy-mm-dd) from the date picker, if any */
	dueDate?: string;
	assignedToId: string;
};

export interface AddTaskDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (payload: CreatePlacementTaskFormPayload) => void | Promise<void>;
	isPending?: boolean;
	/** Org members: `value` = user id (assignee) */
	assigneeOptions: { value: string; label: string }[];
}

export function AddTaskDialog({
	open,
	onOpenChange,
	onSubmit,
	isPending = false,
	assigneeOptions,
}: AddTaskDialogProps) {
	const form = useForm({
		defaultValues: {
			title: "",
			dueDate: "",
			assigneeId: "",
			description: "",
		},
		onSubmit: async ({ value }) => {
			try {
				const due = value.dueDate.trim();
				await onSubmit({
					title: value.title.trim(),
					description: value.description.trim() || undefined,
					...(due ? { dueDate: due } : {}),
					assignedToId: value.assigneeId,
				});
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
					<DialogTitle>Create Task</DialogTitle>
					<DialogDescription>
						Add a task to track follow-ups for this placement.
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
						name="title"
						validators={{
							onBlur: ({ value }) =>
								!value || value.trim().length === 0
									? "Task title is required"
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
									<FieldLabel htmlFor={field.name}>Task Title</FieldLabel>
									<Input
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Enter task title"
									/>
									{isInvalid && <FieldError>Task title is required</FieldError>}
								</Field>
							);
						}}
					</form.Field>

					<form.Field name="dueDate">
						{(field) => (
							<Field>
								<FieldLabel htmlFor={field.name}>Due Date</FieldLabel>
								<DatePicker
									id={field.name}
									value={field.state.value}
									onChange={(v) => field.handleChange(v)}
									onBlur={field.handleBlur}
									placeholder="Pick a date"
								/>
							</Field>
						)}
					</form.Field>

					<form.Field
						name="assigneeId"
						validators={{
							onBlur: ({ value }) =>
								!value || value.length === 0
									? "Assignee is required"
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
										Assign To <RequiredStar />
									</FieldLabel>
									<Select
										value={field.state.value}
										onValueChange={(value) => {
											field.handleChange(value);
											field.handleBlur();
										}}
									>
										<SelectTrigger id={field.name}>
											<SelectValue placeholder="Select assignee" />
										</SelectTrigger>
										<SelectContent>
											{assigneeOptions.map((opt) => (
												<SelectItem key={opt.value} value={opt.value}>
													{opt.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{isInvalid && <FieldError>Assignee is required</FieldError>}
								</Field>
							);
						}}
					</form.Field>

					<form.Field name="description">
						{(field) => (
							<Field>
								<FieldLabel htmlFor={field.name}>Task Description</FieldLabel>
								<Textarea
									id={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Enter task description (optional)"
									rows={3}
									className="resize-none"
								/>
							</Field>
						)}
					</form.Field>

					{assigneeOptions.length === 0 && (
						<p className="text-muted-foreground text-sm">
							No organization members available to assign. Try again after the
							member list loads.
						</p>
					)}
					<DialogFooter className="flex-row justify-end gap-2 sm:justify-end">
						<Button
							type="button"
							variant="outline"
							onClick={() => handleOpenChange(false)}
							disabled={isPending}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isPending || assigneeOptions.length === 0}
						>
							{isPending ? "Creating..." : "Create Task"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
