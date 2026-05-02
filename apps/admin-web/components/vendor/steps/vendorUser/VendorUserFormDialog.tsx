"use client";

import { enumToTitleText, UserStatus, VendorUserRole } from "@repo/shared";
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
import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useUpdateVendorUserMutation } from "@/queries/vendor.queries";
import {
	type VendorUserEditFormValues,
	vendorUserEditFormSchema,
} from "@/schemas/vendor-user.schema";
import type { VendorUserTableRow } from "@/types/users";

const ROLE_OPTIONS = Object.values(VendorUserRole);
const STATUS_OPTIONS = Object.values(UserStatus);

export interface VendorUserFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	vendorUser: VendorUserTableRow | null;
}

export function VendorUserFormDialog({
	open,
	onOpenChange,
	vendorUser,
}: VendorUserFormDialogProps) {
	const updateMutation = useUpdateVendorUserMutation();
	const isPending = updateMutation.isPending;

	const defaultValues: VendorUserEditFormValues = {
		firstName: vendorUser?.firstName ?? "",
		lastName: vendorUser?.lastName ?? "",
		title: vendorUser?.title ?? "",
		officePhone: vendorUser?.officePhone ?? "",
		phoneNumber: vendorUser?.phoneNumber ?? "",
		role: (vendorUser?.role ??
			VendorUserRole.VENDOR_USER) as VendorUserEditFormValues["role"],
		status: (vendorUser?.status ??
			UserStatus.ACTIVE) as VendorUserEditFormValues["status"],
	};

	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: vendorUserEditFormSchema,
		},
		onSubmit: ({ value }) => {
			if (!vendorUser?.vendorId) return;
			updateMutation.mutate(
				{
					vendorId: vendorUser.vendorId,
					vendorUserId: vendorUser.id,
					payload: {
						firstName: value.firstName.trim(),
						lastName: value.lastName.trim(),
						title: value.title.trim(),
						officePhone: value.officePhone?.trim() || null,
						phoneNumber: value.phoneNumber?.trim() || null,
						role: value.role,
						status: value.status,
					},
				},
				{
					onSuccess: () => {
						toast.success("Vendor user updated successfully");
						onOpenChange(false);
						form.reset();
					},
					onError: (err) =>
						toast.error(
							err instanceof Error
								? err.message
								: "Failed to update vendor user",
						),
				},
			);
		},
	});

	useEffect(() => {
		if (open && vendorUser) {
			form.reset({
				firstName: vendorUser.firstName,
				lastName: vendorUser.lastName,
				title: vendorUser.title ?? "",
				officePhone: vendorUser.officePhone ?? "",
				phoneNumber: vendorUser.phoneNumber ?? "",
				role: vendorUser.role as VendorUserEditFormValues["role"],
				status: vendorUser.status as VendorUserEditFormValues["status"],
			});
		}
	}, [open, vendorUser, form]);

	const handleOpenChange = (nextOpen: boolean) => {
		if (isPending) return;
		if (!nextOpen) form.reset();
		onOpenChange(nextOpen);
	};

	if (!vendorUser) return null;

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Vendor User</DialogTitle>
					<DialogDescription>
						Update the vendor user details below.
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
						<div className="grid grid-cols-2 gap-4">
							<form.Field
								name="firstName"
								validators={{
									onChange: vendorUserEditFormSchema.shape.firstName,
								}}
							>
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
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
								validators={{
									onChange: vendorUserEditFormSchema.shape.lastName,
								}}
							>
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
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

						<form.Field
							name="title"
							validators={{
								onChange: vendorUserEditFormSchema.shape.title,
							}}
						>
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
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

						<Field>
							<FieldLabel>Email</FieldLabel>
							<Input value={vendorUser.email} disabled className="bg-muted" />
						</Field>

						<div className="grid grid-cols-2 gap-4">
							<form.Field name="officePhone">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field>
											<FieldLabel htmlFor={field.name}>Office Phone</FieldLabel>
											<PhoneInput
												id={field.name}
												name={field.name}
												placeholder="Office phone"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(value) => field.handleChange(value)}
												aria-invalid={isInvalid}
											/>
										</Field>
									);
								}}
							</form.Field>

							<form.Field name="phoneNumber">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field>
											<FieldLabel htmlFor={field.name}>Mobile Phone</FieldLabel>
											<PhoneInput
												id={field.name}
												name={field.name}
												placeholder="Mobile phone"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(value) => field.handleChange(value)}
												aria-invalid={isInvalid}
											/>
										</Field>
									);
								}}
							</form.Field>
						</div>

						<form.Field name="role">
							{(field) => (
								<Field>
									<FieldLabel htmlFor={field.name}>
										Role <RequiredStar />
									</FieldLabel>
									<Select
										value={field.state.value}
										onValueChange={(val) =>
											field.handleChange(
												val as VendorUserEditFormValues["role"],
											)
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
											{ROLE_OPTIONS.map((role) => (
												<SelectItem key={role} value={role}>
													{enumToTitleText(role)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</Field>
							)}
						</form.Field>

						<form.Field name="status">
							{(field) => (
								<Field>
									<FieldLabel htmlFor={field.name}>Status</FieldLabel>
									<Select
										value={field.state.value}
										onValueChange={(val) =>
											field.handleChange(
												val as VendorUserEditFormValues["status"],
											)
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
									disabled={!canSubmit || isSubmitting || isPending || !isDirty}
								>
									{isSubmitting || isPending ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin" />
											Saving...
										</>
									) : (
										"Update User"
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
