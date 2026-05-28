"use client";
import {
	enumToTitleText,
	splitFullNameToFirstLast as splitFullName,
	UserRole,
	UserStatus,
} from "@repo/shared";
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
import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts";
import { useDialogFormEntitySnapshot } from "@/hooks/use-dialog-form-entity-snapshot";
import {
	useCreateProgramUser,
	useUpdateProgramUser,
} from "@/queries/users.query";
import { type UserFormValues, userFormSchema } from "@/schemas/user.schema";
import type { MspOptionDto, UserDto } from "@/types";

export interface UserFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user?: UserDto;
	mspOptions?: MspOptionDto[];
}

const ROLE_OPTIONS = Object.values(UserRole).filter(
	(role) =>
		!["CANDIDATE_USER", "ORGANIZATION_USER", "VENDOR_USER"].includes(role),
);
const STATUS_OPTIONS = Object.values(UserStatus);

function getUserFormDefaultValues(
	user: UserDto | undefined,
	fallbackRole: UserRole,
): UserFormValues {
	const isEdit = !!user;
	const { firstName, lastName } = splitFullName(user?.name ?? "");
	return {
		firstName: isEdit ? firstName : "",
		lastName: isEdit ? lastName : "",
		title: user?.title ?? "",
		email: user?.email ?? "",
		officePhone: user?.officePhone ?? "",
		phoneNumber: user?.phoneNumber ?? "",
		mspId: user?.mspId ?? null,
		role: (user?.role ?? fallbackRole) as UserFormValues["role"],
		status: (user?.status ?? UserStatus.ACTIVE) as UserFormValues["status"],
	};
}

export function UserFormDialog({
	open,
	onOpenChange,
	user,
	mspOptions = [],
}: Readonly<UserFormDialogProps>) {
	const { session } = useAuth();
	const currentUser = session.user;
	const createMutation = useCreateProgramUser();
	const updateMutation = useUpdateProgramUser();
	const isPending = createMutation.isPending || updateMutation.isPending;

	const actorRole =
		(currentUser.role as UserRole | undefined) ?? UserRole.PROGRAM_MANAGER;

	const snapshotUser =
		useDialogFormEntitySnapshot(open, user ?? null) ?? undefined;
	const isEditMode = !!snapshotUser;

	const form = useForm({
		defaultValues: getUserFormDefaultValues(snapshotUser, actorRole),
		validators: {
			onSubmit: userFormSchema,
		},
		onSubmit: ({ value }) => {
			const mutationOptions = {
				onSuccess: () => {
					toast.success(
						isEditMode
							? "User updated successfully"
							: "User created successfully",
					);
					onOpenChange(false);
				},
				onError: (err: unknown) =>
					toast.error(
						err instanceof Error ? err.message : "Something went wrong",
					),
			};
			if (isEditMode && snapshotUser) {
				updateMutation.mutate(
					{
						id: snapshotUser.id,
						data: {
							firstName: value.firstName.trim(),
							lastName: value.lastName.trim(),
							title: value.title.trim(),
							officePhone: value.officePhone?.trim() || null,
							phoneNumber: value.phoneNumber?.trim() || null,
							role: value.role,
							status: value.status,
							mspId: value.mspId ?? null,
						},
					},
					mutationOptions,
				);
			} else {
				createMutation.mutate(
					{
						firstName: value.firstName.trim(),
						lastName: value.lastName.trim(),
						title: value.title.trim(),
						email: value.email.trim(),
						officePhone: value.officePhone?.trim() ?? "",
						phoneNumber: value.phoneNumber?.trim() ?? "",
						role: value.role,
						status: value.status,
						mspId: value.mspId ?? null,
					},
					mutationOptions,
				);
			}
		},
	});

	const submissionAttempts = useStore(
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);

	const baseRoles = useMemo(() => {
		if (currentUser?.role !== UserRole.SUPER_ADMIN) {
			return ROLE_OPTIONS.filter((role) => role !== UserRole.SUPER_ADMIN);
		}
		return ROLE_OPTIONS;
	}, [currentUser?.role]);

	const wasOpenRef = useRef(false);
	useEffect(() => {
		if (open && !wasOpenRef.current) {
			form.reset(getUserFormDefaultValues(snapshotUser, actorRole));
		}
		wasOpenRef.current = open;
	}, [open, snapshotUser, actorRole, form]);

	const handleOpenChange = (nextOpen: boolean) => {
		if (isPending) return;
		onOpenChange(nextOpen);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{isEditMode ? "Edit User" : "Create User"}</DialogTitle>
					<DialogDescription>
						{isEditMode
							? "Update the user details below."
							: "Add a new user to the platform."}
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(event) => {
						event.preventDefault();
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
												disabled={isPending}
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
												disabled={isPending}
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
												disabled={isPending}
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
												disabled={isPending || isEditMode}
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
								validators={{ onChange: userFormSchema.shape.officePhone }}
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
												disabled={isPending}
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
								validators={{ onChange: userFormSchema.shape.phoneNumber }}
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
												disabled={isPending}
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							</form.Field>
						</div>

						<form.Field name="mspId">
							{(field) => (
								<Field>
									<FieldLabel htmlFor={field.name}>
										Select MSP Partner
									</FieldLabel>
									<Select
										value={field.state.value ?? undefined}
										onValueChange={(val) => {
											const nextValue = val === "" ? null : val;
											field.handleChange(!nextValue ? null : nextValue);
											if (nextValue) {
												const currentRole = form.state.values.role;
												if (
													currentRole !== UserRole.PROGRAM_MANAGER &&
													currentRole !== UserRole.COMPLIANCE_MANAGER
												) {
													form.setFieldValue("role", UserRole.PROGRAM_MANAGER);
												}
											}
										}}
									>
										<SelectTrigger
											id={field.name}
											className="w-full"
											disabled={isPending}
										>
											<SelectValue placeholder="Select MSP partner" />
										</SelectTrigger>
										<SelectContent>
											{mspOptions.length === 0 && (
												<div className="text-muted-foreground text-sm">
													No MSP partners available
												</div>
											)}
											{mspOptions.map((option) => (
												<SelectItem key={option.id} value={option.id}>
													{option.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</Field>
							)}
						</form.Field>

						<form.Subscribe selector={(state) => state.values.mspId}>
							{(mspId) => (
								<form.Field name="role">
									{(field) => {
										const roleOptions = mspId
											? [UserRole.PROGRAM_MANAGER, UserRole.COMPLIANCE_MANAGER]
											: baseRoles;
										return (
											<Field>
												<FieldLabel htmlFor={field.name}>
													Role <RequiredStar />
												</FieldLabel>
												<Select
													value={field.state.value}
													onValueChange={(val) =>
														field.handleChange(val as UserFormValues["role"])
													}
												>
													<SelectTrigger
														id={field.name}
														className="w-full"
														disabled={isPending}
													>
														<SelectValue placeholder="Select role" />
													</SelectTrigger>
													<SelectContent>
														{roleOptions.map((role) => (
															<SelectItem key={role} value={role}>
																{enumToTitleText(role)}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</Field>
										);
									}}
								</form.Field>
							)}
						</form.Subscribe>

						<form.Field name="status">
							{(field) => (
								<Field>
									<FieldLabel htmlFor={field.name}>Status</FieldLabel>
									<Select
										value={field.state.value}
										onValueChange={(val) =>
											field.handleChange(val as UserFormValues["status"])
										}
									>
										<SelectTrigger
											id={field.name}
											className="w-full"
											disabled={isPending}
										>
											<SelectValue placeholder="Select status" />
										</SelectTrigger>
										<SelectContent>
											{STATUS_OPTIONS.map((status) => (
												<SelectItem key={status} value={status}>
													{enumToTitleText(status)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</Field>
							)}
						</form.Field>
					</FieldGroup>

					<DialogFooter className="sm:justify-start">
						<form.Subscribe
							selector={(state) => ({
								canSubmit: state.canSubmit,
								isSubmitting: state.isSubmitting,
								isDirty: state.isDirty,
							})}
						>
							{({ canSubmit, isSubmitting, isDirty }) => (
								<Button
									type="submit"
									disabled={
										!canSubmit ||
										isSubmitting ||
										isPending ||
										(isEditMode && !isDirty)
									}
								>
									{isSubmitting || isPending ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin" />
											{isEditMode ? "Saving..." : "Creating..."}
										</>
									) : isEditMode ? (
										"Update User"
									) : (
										"Create User"
									)}
								</Button>
							)}
						</form.Subscribe>
						<Button
							type="button"
							variant="outline"
							onClick={() => handleOpenChange(false)}
							disabled={isPending}
						>
							Cancel
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
