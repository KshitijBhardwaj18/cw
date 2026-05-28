"use client";

import { type TagResponseType, tagToFormValues } from "@repo/shared";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { Switch } from "@repo/ui/components/switch";
import { Textarea } from "@repo/ui/components/textarea";
import { FormDialogFooter } from "@repo/ui/general/FormDialogFooter";
import { formFieldShowInvalid } from "@repo/ui/lib/form-field-display";
import { useForm, useStore } from "@tanstack/react-form";
import { Info } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { TAG_TYPE_OPTIONS } from "@/constants/tags";
import { useDialogFormEntitySnapshot } from "@/hooks/use-dialog-form-entity-snapshot";
import { useCreateTag, useUpdateTag } from "@/queries/tags.query";
import {
	type TagFormValues,
	tagFormBaseSchema,
	tagFormSchema,
} from "@/schemas/tag.schema";

const defaultFormValues: TagFormValues = {
	name: "",
	type: TAG_TYPE_OPTIONS[0]?.value ?? "SKILL",
	description: "",
	showOnSubmission: true,
};

type TagFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialTag?: TagResponseType | null;
};

export function TagFormDialog({
	open,
	onOpenChange,
	initialTag,
}: Readonly<TagFormDialogProps>) {
	const snapshotTag =
		useDialogFormEntitySnapshot(open, initialTag ?? null) ?? undefined;
	const isEdit = !!snapshotTag;

	const createMutation = useCreateTag();
	const updateMutation = useUpdateTag();

	const form = useForm({
		defaultValues: snapshotTag
			? tagToFormValues(snapshotTag)
			: defaultFormValues,
		validators: { onSubmit: tagFormSchema },
		onSubmit: ({ value }) => {
			const payload = {
				name: value.name,
				type: value.type,
				description: value.description || undefined,
				showOnSubmission: value.showOnSubmission,
			};

			if (isEdit && snapshotTag) {
				updateMutation.mutate(
					{ id: snapshotTag.id, data: payload },
					{
						onSuccess: () => {
							toast.success("Tag updated successfully");
							onOpenChange(false);
						},
						onError: (err) => {
							toast.error(
								err instanceof Error ? err.message : "Something went wrong",
							);
						},
					},
				);
			} else {
				createMutation.mutate(payload, {
					onSuccess: () => {
						toast.success("Tag created successfully");
						onOpenChange(false);
					},
					onError: (err) => {
						toast.error(
							err instanceof Error ? err.message : "Something went wrong",
						);
					},
				});
			}
		},
	});

	const submissionAttempts = useStore(
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);

	const wasOpenRef = useRef(false);
	useEffect(() => {
		if (open && !wasOpenRef.current) {
			form.reset(
				snapshotTag ? tagToFormValues(snapshotTag) : defaultFormValues,
			);
		}
		wasOpenRef.current = open;
	}, [open, snapshotTag, form]);

	const isPending = createMutation.isPending || updateMutation.isPending;

	const handleOpenChange = (nextOpen: boolean) => {
		if (isPending) return;
		onOpenChange(nextOpen);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto">
				<DialogHeader className="flex flex-col gap-3 pr-12 sm:flex-row sm:items-center sm:justify-between">
					<DialogTitle>{isEdit ? "Edit Tag" : "Create Tag"}</DialogTitle>
					<form.Field name="showOnSubmission">
						{(field) => (
							<div className="flex shrink-0 items-center gap-2 sm:ml-auto">
								<Label htmlFor="active-toggle" className="font-normal">
									Active
								</Label>
								<Switch
									id="active-toggle"
									checked={field.state.value}
									onCheckedChange={field.handleChange}
								/>
							</div>
						)}
					</form.Field>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						void form.handleSubmit();
					}}
					className="space-y-4"
				>
					<div className="space-y-4">
						<FieldGroup>
							<form.Field
								name="name"
								validators={{ onChange: tagFormBaseSchema.shape.name }}
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
												Tag Name <span className="text-destructive">*</span>
											</FieldLabel>
											<Input
												id={field.name}
												placeholder="Enter tag name"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
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
								name="type"
								validators={{ onChange: tagFormBaseSchema.shape.type }}
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
												Tag Type <span className="text-destructive">*</span>
											</FieldLabel>
											<Select
												value={field.state.value}
												onValueChange={(v) =>
													field.handleChange(v as TagFormValues["type"])
												}
											>
												<SelectTrigger
													id={field.name}
													className="w-full"
													aria-invalid={isInvalid}
												>
													<SelectValue placeholder="Select tag type..." />
												</SelectTrigger>
												<SelectContent>
													{TAG_TYPE_OPTIONS.map((opt) => (
														<SelectItem key={opt.value} value={opt.value}>
															{opt.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							</form.Field>

							<form.Field name="description">
								{(field) => (
									<Field>
										<FieldLabel htmlFor={field.name}>Description</FieldLabel>
										<Textarea
											id={field.name}
											placeholder="Enter tag description"
											value={field.state.value ?? ""}
											onChange={(e) => field.handleChange(e.target.value)}
											rows={3}
										/>
									</Field>
								)}
							</form.Field>

							<div className="bg-muted flex items-start gap-2 p-3">
								<Info className="text-primary mt-0.5 size-4 shrink-0" />
								<p className="text-muted-foreground text-sm">
									When active, this tag will be visible to Organization Managers
									during the candidate review process. Tags are always hidden
									from the Candidate Portal to maintain privacy.
								</p>
							</div>
						</FieldGroup>
					</div>

					<FormDialogFooter
						form={form}
						submitLabel={isEdit ? "Save Changes" : "Create Tag"}
						submitLoadingLabel={isEdit ? "Saving..." : "Creating..."}
						onCancel={() => handleOpenChange(false)}
						isPending={isPending}
					/>
				</form>
			</DialogContent>
		</Dialog>
	);
}
