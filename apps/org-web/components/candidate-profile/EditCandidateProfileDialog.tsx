"use client";

import type { ProfileUser } from "@repo/shared";
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
import { Field, FieldGroup, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { PhoneInput } from "@repo/ui/general/PhoneInput";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { useForm } from "@tanstack/react-form";
import { Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useUpdateCandidateProfile } from "@/queries/candidate-profile.queries";
import {
	type EditCandidateProfileFormValues,
	editCandidateProfileSchema,
} from "@/schemas/candidate-profile.schema";
import type { CandidateMeOnboarding } from "@/services/onboarding.service";

type EditProfileDialogProps = {
	user: ProfileUser;
	profile: CandidateMeOnboarding | null;
	onSuccess: () => void;
	trigger: React.ReactNode;
};

function buildDefaultValues(
	user: ProfileUser,
	profile: CandidateMeOnboarding | null,
): EditCandidateProfileFormValues {
	return {
		fullName: user.name ?? "",
		phoneNumber: profile?.phoneNumber ?? user.phoneNumber ?? "",
		address: profile?.streetAddress ?? "",
		city: profile?.city ?? "",
		state: profile?.state ?? "",
		zipCode: profile?.zipCode ?? "",
	};
}

export function EditCandidateProfileDialog({
	user,
	profile,
	onSuccess,
	trigger,
}: EditProfileDialogProps) {
	const [open, setOpen] = useState(false);
	const updateMutation = useUpdateCandidateProfile();

	const form = useForm({
		defaultValues: buildDefaultValues(user, profile),
		validators: {
			onSubmit: editCandidateProfileSchema,
		},
		onSubmit: async ({ value }) => {
			await new Promise<void>((resolve, reject) => {
				updateMutation.mutate(
					{
						name: value.fullName.trim() || undefined,
						phoneNumber: value.phoneNumber || undefined,
						streetAddress: value.address || undefined,
						city: value.city || undefined,
						state: value.state || undefined,
						zipCode: value.zipCode || undefined,
					},
					{
						onSuccess: () => {
							toast.success("Profile updated successfully");
							setOpen(false);
							onSuccess();
							resolve();
						},
						onError: (err) => {
							toast.error(
								err instanceof Error ? err.message : "Failed to update profile",
							);
							reject(err);
						},
					},
				);
			});
		},
	});

	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) {
			form.reset(buildDefaultValues(user, profile));
		}
		setOpen(nextOpen);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent className="sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>Edit Profile</DialogTitle>
					<DialogDescription>
						Update your profile information.
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						void form.handleSubmit();
					}}
					className="space-y-4 mt-4"
				>
					<FieldGroup>
						<form.Field name="fullName">
							{(field) => (
								<Field>
									<FieldLabel htmlFor={field.name}>
										Full Name <RequiredStar />
									</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										placeholder="Jane Doe"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
								</Field>
							)}
						</form.Field>

						<div className="grid grid-cols-2 gap-4">
							<Field>
								<FieldLabel>Email (Read-Only)</FieldLabel>
								<div className="relative">
									<Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
									<Input value={user.email} readOnly className="pl-10" />
								</div>
								<p className="text-xs text-muted-foreground mt-1">
									Contact support to change your email
								</p>
							</Field>

							<form.Field name="phoneNumber">
								{(field) => (
									<Field>
										<FieldLabel htmlFor={field.name}>
											Phone Number <RequiredStar />
										</FieldLabel>
										<PhoneInput
											id={field.name}
											name={field.name}
											placeholder="+19876543210"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(value) => field.handleChange(value)}
										/>
									</Field>
								)}
							</form.Field>
						</div>

						<form.Field name="address">
							{(field) => (
								<Field>
									<FieldLabel htmlFor={field.name}>Address</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										placeholder="123 Main St"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
								</Field>
							)}
						</form.Field>

						<div className="grid grid-cols-3 gap-4">
							<form.Field name="city">
								{(field) => (
									<Field>
										<FieldLabel htmlFor={field.name}>City</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											placeholder="Boston"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
									</Field>
								)}
							</form.Field>
							<form.Field name="state">
								{(field) => (
									<Field>
										<FieldLabel htmlFor={field.name}>State</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											placeholder="MA"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
									</Field>
								)}
							</form.Field>
							<form.Field name="zipCode">
								{(field) => (
									<Field>
										<FieldLabel htmlFor={field.name}>ZIP Code</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											placeholder="02101"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
									</Field>
								)}
							</form.Field>
						</div>
					</FieldGroup>
					<form.Subscribe
						selector={(state) => ({
							isSubmitting: state.isSubmitting,
							canSubmit: state.canSubmit,
						})}
					>
						{({ isSubmitting, canSubmit }) => (
							<DialogFooter className="pt-4">
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
