"use client";

import { enumToTitleText, MemberRole } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { PhoneInput } from "@repo/ui/general/PhoneInput";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { formFieldShowInvalid } from "@repo/ui/lib/form-field-display";
import { useForm, useStore } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useEnrollOrgUser } from "@/queries/organizations.query";
import {
	type EnrollOrgUserFormValues,
	enrollOrgUserSchema,
} from "@/schemas/organization.schema";
import { userFormSchema } from "@/schemas/user.schema";

const ROLE_OPTIONS = [
	MemberRole.EXECUTIVE,
	MemberRole.HIRING_MANAGER,
	MemberRole.OPERATIONS,
];

type EnrollOrganizationUserDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	organizationId: string;
};

export function EnrollOrganizationUserDialog({
	open,
	onOpenChange,
	organizationId,
}: EnrollOrganizationUserDialogProps) {
	const enrollMutation = useEnrollOrgUser(organizationId);

	const defaultValues: EnrollOrgUserFormValues = {
		firstName: "",
		lastName: "",
		title: "",
		email: "",
		officePhone: "",
		phoneNumber: "",
		role: "" as MemberRole,
	};

	const form = useForm({
		defaultValues,
		validators: { onSubmit: enrollOrgUserSchema },
		onSubmitInvalid: () => {
			toast.error("Please fill in all required fields");
		},
		onSubmit: ({ value }) => {
			enrollMutation.mutate(
				{
					firstName: value.firstName.trim(),
					lastName: value.lastName.trim(),
					title: value.title.trim(),
					email: value.email.trim(),
					officePhone: value.officePhone?.trim() || undefined,
					phoneNumber: value.phoneNumber?.trim() || undefined,
					role: value.role,
				},
				{
					onSuccess: () => {
						toast.success("User enrolled successfully");
						onOpenChange(false);
						form.reset();
					},
					onError: (error) => {
						toast.error(
							error instanceof Error ? error.message : "Something went wrong",
						);
					},
				},
			);
		},
	});

	const submissionAttempts = useStore(
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);

	const handleOpenChange = (next: boolean) => {
		if (!next) form.reset();
		onOpenChange(next);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Enroll User</DialogTitle>
					<DialogDescription>
						Add a new user and enroll them into this organization.
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						void form.handleSubmit();
					}}
					className="space-y-5"
				>
					<FieldGroup>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<form.Field
								name="firstName"
								validators={{ onChange: userFormSchema.shape.firstName }}
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
												First Name <RequiredStar />
											</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												placeholder="First name"
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
								name="lastName"
								validators={{ onChange: userFormSchema.shape.lastName }}
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
												Last Name <RequiredStar />
											</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												placeholder="Last name"
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
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<form.Field
								name="title"
								validators={{ onChange: userFormSchema.shape.title }}
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
												Job Title <RequiredStar />
											</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												placeholder="Job title"
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
								name="email"
								validators={{ onChange: userFormSchema.shape.email }}
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
												Email <RequiredStar />
											</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												type="email"
												placeholder="Email address"
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
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<form.Field
								name="officePhone"
								validators={{ onChange: enrollOrgUserSchema.shape.officePhone }}
							>
								{(field) => {
									const isInvalid = formFieldShowInvalid(
										field.state.meta.isTouched,
										field.state.meta.isValid,
										submissionAttempts,
									);
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Office Phone</FieldLabel>
											<PhoneInput
												id={field.name}
												name={field.name}
												placeholder="+19876543210"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(value) => field.handleChange(value)}
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
								name="phoneNumber"
								validators={{ onChange: enrollOrgUserSchema.shape.phoneNumber }}
							>
								{(field) => {
									const isInvalid = formFieldShowInvalid(
										field.state.meta.isTouched,
										field.state.meta.isValid,
										submissionAttempts,
									);
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Mobile Phone</FieldLabel>
											<PhoneInput
												id={field.name}
												name={field.name}
												placeholder="+19876543210"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(value) => field.handleChange(value)}
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

						<form.Field
							name="role"
							validators={{ onChange: enrollOrgUserSchema.shape.role }}
						>
							{(field) => {
								const isInvalid =
									formFieldShowInvalid(
										field.state.meta.isTouched,
										field.state.meta.isValid,
										submissionAttempts,
									) || field.state.meta.errors?.length > 0;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>
											Role <RequiredStar />
										</FieldLabel>
										<Select
											value={field.state.value || undefined}
											onValueChange={(val) =>
												field.handleChange(
													val as EnrollOrgUserFormValues["role"],
												)
											}
											onOpenChange={(open) => {
												if (!open) field.handleBlur();
											}}
										>
											<SelectTrigger
												id={field.name}
												className="w-full"
												aria-invalid={isInvalid}
											>
												<SelectValue placeholder="Select role" />
											</SelectTrigger>
											<SelectContent>
												{ROLE_OPTIONS.map((role) => (
													<SelectItem key={role} value={role}>
														{enumToTitleText(role)}
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
					</FieldGroup>

					<DialogFooter className="sm:justify-start">
						<form.Subscribe
							selector={(s) => ({
								canSubmit: s.canSubmit,
								isSubmitting: s.isSubmitting,
							})}
						>
							{({ canSubmit, isSubmitting }) => (
								<Button type="submit" disabled={!canSubmit || isSubmitting}>
									{isSubmitting ? (
										<>
											<Loader2 className="size-4 animate-spin" />
											Enrolling...
										</>
									) : (
										"Enroll User"
									)}
								</Button>
							)}
						</form.Subscribe>
						<Button
							type="button"
							variant="outline"
							onClick={() => handleOpenChange(false)}
						>
							Cancel
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
