"use client";

import { getLabel } from "@repo/shared";
import {
	Dialog,
	DialogContent,
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
import { FormDialogFooter } from "@repo/ui/general/FormDialogFooter";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { formFieldShowInvalid } from "@repo/ui/lib/form-field-display";
import { useForm, useStore } from "@tanstack/react-form";
import { toast } from "sonner";
import { GRIEVANCE_TASK_CATEGORY_OPTIONS } from "@/constants/grievances";
import { useCreateGrievanceTask } from "@/queries/grievances.queries";
import {
	type CreateGrievanceTaskFormValues,
	createGrievanceTaskCategorySchema,
	createGrievanceTaskFieldSchemas,
	createGrievanceTaskSchema,
} from "@/schemas/create-grievance-task.schema";

const INITIAL_VALUES: CreateGrievanceTaskFormValues = {
	category: "",
	assignTo: "",
	description: "",
};

export type CreateGrievanceTaskDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	orgId: string;
	grievanceId: string;
	memberOptions: { value: string; label: string }[];
};

export function CreateGrievanceTaskDialog({
	open,
	onOpenChange,
	orgId,
	grievanceId,
	memberOptions,
}: CreateGrievanceTaskDialogProps) {
	const createTask = useCreateGrievanceTask(orgId, grievanceId);

	const form = useForm({
		defaultValues: INITIAL_VALUES,
		validators: { onSubmit: createGrievanceTaskSchema },
		onSubmitInvalid: () => {
			toast.error("Please complete all required fields.");
		},
		onSubmit: async ({ value }) => {
			return new Promise<void>((resolve, reject) => {
				createTask.mutate(
					{
						category: value.category,
						assignedToUserId: value.assignTo,
						description: value.description,
					},
					{
						onSuccess: () => {
							toast.success("Task created", {
								description: getLabel(
									GRIEVANCE_TASK_CATEGORY_OPTIONS,
									value.category,
								),
							});
							handleOpenChange(false);
							resolve();
						},
						onError: (err) => {
							toast.error(
								err instanceof Error ? err.message : "Failed to create task",
							);
							reject(err instanceof Error ? err : new Error("Request failed"));
						},
					},
				);
			});
		},
	});

	const submissionAttempts = useStore(
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);

	function handleOpenChange(next: boolean) {
		if (!next) {
			form.reset();
		}
		onOpenChange(next);
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Create task</DialogTitle>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						void form.handleSubmit();
					}}
					className="space-y-4"
				>
					<form.Field
						name="category"
						validators={{
							onBlur: createGrievanceTaskCategorySchema,
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
										Category <RequiredStar />
									</FieldLabel>
									<Select
										value={field.state.value || undefined}
										onValueChange={(v) => {
											field.handleChange(v);
											field.handleBlur();
										}}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select category" />
										</SelectTrigger>
										<SelectContent>
											{GRIEVANCE_TASK_CATEGORY_OPTIONS.map((o) => (
												<SelectItem key={o.value} value={o.value}>
													{o.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<form.Field
						name="assignTo"
						validators={{
							onBlur: createGrievanceTaskFieldSchemas.assignTo,
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
										Assign to <RequiredStar />
									</FieldLabel>
									<Select
										value={field.state.value || undefined}
										onValueChange={(v) => {
											field.handleChange(v);
											field.handleBlur();
										}}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select user" />
										</SelectTrigger>
										<SelectContent>
											{memberOptions.map((m) => (
												<SelectItem key={m.value} value={m.value}>
													{m.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<form.Field
						name="description"
						validators={{
							onBlur: createGrievanceTaskFieldSchemas.description,
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
									<FieldLabel>Description</FieldLabel>
									<Textarea
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
										rows={4}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<FormDialogFooter
						form={form}
						onCancel={() => handleOpenChange(false)}
						cancelLabel="Cancel"
						submitLabel="Create task"
						submitLoadingLabel="Creating..."
						isPending={createTask.isPending}
					/>
				</form>
			</DialogContent>
		</Dialog>
	);
}
