"use client";

import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@repo/ui/components/field";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@repo/ui/components/input-group";
import LoadingButton from "@repo/ui/general/LoadingButton";
import { formFieldShowInvalid } from "@repo/ui/lib/form-field-display";
import { useForm, useStore } from "@tanstack/react-form";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

type ResetPasswordFormProps = {
	onResetPassword: (password: string) => Promise<void>;
};

const resetPasswordSchema = z.object({
	password: z.string().min(8, "Password must be at least 8 characters"),
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPasswordForm = ({ onResetPassword }: ResetPasswordFormProps) => {
	const [error, setError] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);
	const router = useRouter();
	const defaultValues: ResetPasswordFormValues = {
		password: "",
	};

	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: resetPasswordSchema,
		},
		onSubmit: async ({ value }) => {
			setError(null);
			try {
				await onResetPassword(value.password);
				toast.success("Password reset successfully");
				router.replace("/sign-in");
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to reset password",
				);
			}
		},
	});

	const submissionAttempts = useStore(
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);
	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<h2 className="text-lg font-semibold">Reset Password</h2>
				<p className="text-muted-foreground text-sm">
					Enter your new password to reset your account.
				</p>
			</div>

			<form
				onSubmit={(event) => {
					event.preventDefault();
					void form.handleSubmit();
				}}
				className="space-y-4"
			>
				<form.Subscribe
					selector={(state) => ({
						isSubmitting: state.isSubmitting,
						canSubmit: state.canSubmit,
					})}
				>
					{({ isSubmitting, canSubmit }) => (
						<>
							<FieldGroup>
								<form.Field
									name="password"
									validators={{
										onBlur: resetPasswordSchema.shape.password,
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
												<FieldLabel
													htmlFor={field.name}
													className="text-sm font-medium"
												>
													Password
												</FieldLabel>
												<InputGroup>
													<InputGroupAddon>
														<Lock />
													</InputGroupAddon>
													<InputGroupInput
														id={field.name}
														name={field.name}
														type={showPassword ? "text" : "password"}
														placeholder="••••••••"
														disabled={isSubmitting}
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(event) =>
															field.handleChange(event.target.value)
														}
														aria-invalid={isInvalid}
													/>
													<InputGroupAddon
														align="inline-end"
														className="cursor-pointer"
													>
														{showPassword ? (
															<EyeOff
																onClick={() => setShowPassword(!showPassword)}
															/>
														) : (
															<Eye
																onClick={() => setShowPassword(!showPassword)}
															/>
														)}
													</InputGroupAddon>
												</InputGroup>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								</form.Field>
							</FieldGroup>

							{error && <p className="text-destructive text-sm">{error}</p>}

							<LoadingButton
								type="submit"
								className="w-full"
								disabled={!canSubmit || isSubmitting}
								isLoading={isSubmitting}
							>
								Reset Password
							</LoadingButton>
						</>
					)}
				</form.Subscribe>
			</form>
		</div>
	);
};

export default ResetPasswordForm;
