"use client";

import {
	DEFAULT_TIMEZONE,
	type ProfileUser,
	TIMEZONE_OPTIONS,
} from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
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
import { formFieldShowInvalid } from "@repo/ui/lib/form-field-display";
import { useForm, useStore } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	type EditProfileFormValues,
	editProfileSchema,
} from "@/schemas/profile.schema";
import { AuthService } from "@/services/auth.service";

type EditProfileDialogProps = {
	user: ProfileUser;
	onSuccess: () => void;
	trigger: React.ReactNode;
};

export function EditProfileDialog({
	user,
	onSuccess,
	trigger,
}: EditProfileDialogProps) {
	const [open, setOpen] = useState(false);

	const form = useForm({
		defaultValues: {
			name: user.name,
			phoneNumber: user.phoneNumber ?? "",
			officePhone: user.officePhone ?? "",
			timeZone: user.timeZone ?? DEFAULT_TIMEZONE,
		} satisfies EditProfileFormValues,
		validators: { onSubmit: editProfileSchema },
		onSubmit: async () => {
			const { data, error } = await AuthService.updateProfile({
				name: form.state.values.name,
				phoneNumber: form.state.values.phoneNumber,
				officePhone: form.state.values.officePhone,
				timeZone: form.state.values.timeZone,
			});
			if (error) {
				toast.error(error.message);
				return;
			}
			if (data?.status) {
				toast.success("Profile updated successfully");
				form.reset();
				setOpen(false);
				onSuccess();
			}
		},
	});

	const submissionAttempts = useStore(
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);

	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) {
			form.reset({
				name: user.name,
				phoneNumber: user.phoneNumber ?? "",
				officePhone: user.officePhone ?? "",
				timeZone: user.timeZone ?? DEFAULT_TIMEZONE,
			});
		}
		setOpen(nextOpen);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent className="max-h-[90dvh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Edit Profile</DialogTitle>
					<DialogDescription>
						Update your profile information. Email and role cannot be changed
						here.
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						void form.handleSubmit();
					}}
					className="space-y-4"
				>
					<FieldGroup>
						<form.Field
							name="name"
							validators={{
								onChange: editProfileSchema.shape.name,
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
										<FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											placeholder="Enter your full name"
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
							name="phoneNumber"
							validators={{
								onChange: editProfileSchema.shape.phoneNumber,
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
										<FieldLabel htmlFor={field.name}>Phone Number</FieldLabel>
										<PhoneInput
											id={field.name}
											name={field.name}
											placeholder="Enter your phone number"
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
							name="officePhone"
							validators={{
								onChange: editProfileSchema.shape.officePhone,
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
										<FieldLabel htmlFor={field.name}>Office Phone</FieldLabel>
										<PhoneInput
											id={field.name}
											name={field.name}
											placeholder="Enter office phone number"
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
							name="timeZone"
							validators={{
								onChange: editProfileSchema.shape.timeZone,
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
										<FieldLabel htmlFor={field.name}>Time Zone</FieldLabel>
										<Select
											value={field.state.value || "__none__"}
											onValueChange={(v) =>
												field.handleChange(v === "__none__" ? "" : v)
											}
										>
											<SelectTrigger
												id={field.name}
												className="w-full"
												aria-invalid={isInvalid}
											>
												<SelectValue placeholder="Select time zone" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="__none__">
													Select time zone
												</SelectItem>
												{TIMEZONE_OPTIONS.map((opt) => (
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
					</FieldGroup>
					<form.Subscribe
						selector={(state) => ({
							isSubmitting: state.isSubmitting,
							canSubmit: state.canSubmit,
						})}
					>
						{({ isSubmitting, canSubmit }) => (
							<DialogFooter>
								<Button
									type="button"
									variant="ghost"
									onClick={() => handleOpenChange(false)}
								>
									Cancel
								</Button>
								<Button type="submit" disabled={!canSubmit || isSubmitting}>
									{isSubmitting ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin" />
											Saving...
										</>
									) : (
										"Save Changes"
									)}
								</Button>
							</DialogFooter>
						)}
					</form.Subscribe>
				</form>
			</DialogContent>
		</Dialog>
	);
}
