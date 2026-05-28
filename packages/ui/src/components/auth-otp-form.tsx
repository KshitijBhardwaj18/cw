"use client";

import { Button } from "@repo/ui/components/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@repo/ui/components/field";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@repo/ui/components/input-otp";
import {
	type OTPFormValues,
	otpSchema,
} from "@repo/ui/lib/auth-email-otp-schema";
import { useForm } from "@tanstack/react-form";
import { ArrowLeft, Loader2, Shield } from "lucide-react";
import { useEffect, useState } from "react";

interface OTPFormProps {
	email: string;
	onVerifyOTP: (email: string, otp: string) => Promise<boolean>;
	onBackToEmail: () => void;
	onResendOTP: (email: string) => Promise<boolean>;
}

export function OTPForm({
	email,
	onVerifyOTP,
	onBackToEmail,
	onResendOTP,
}: Readonly<OTPFormProps>) {
	const [isResending, setIsResending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [resendCooldown, setResendCooldown] = useState(0);

	const defaultValues: OTPFormValues = {
		otp: "",
	};

	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: otpSchema,
		},
		onSubmit: async ({ value }) => {
			setError(null);
			try {
				await onVerifyOTP(email, value.otp);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Invalid verification code",
				);
			}
		},
	});

	useEffect(() => {
		if (resendCooldown > 0) {
			const timer = setTimeout(() => {
				setResendCooldown(resendCooldown - 1);
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, [resendCooldown]);

	const handleResendClick = async () => {
		setIsResending(true);
		setError(null);

		try {
			await onResendOTP(email);
			setResendCooldown(60);
			form.reset();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to resend OTP");
		} finally {
			setIsResending(false);
		}
	};

	const handleBackClick = () => {
		form.reset();
		setError(null);
		setResendCooldown(0);
		onBackToEmail();
	};

	return (
		<div className="space-y-6">
			<div className="space-y-3 text-center">
				<div className="bg-primary/10 inline-flex h-12 w-12 items-center justify-center rounded-full">
					<Shield className="text-primary h-6 w-6" />
				</div>
				<div className="space-y-1">
					<h2 className="text-lg font-semibold">Enter verification code</h2>
					<p className="text-muted-foreground text-sm">
						We&apos;ve sent a 6-digit code to{" "}
						<span className="font-medium">{email}</span>
					</p>
				</div>
			</div>

			<form
				onSubmit={(event) => {
					event.preventDefault();
					void form.handleSubmit();
				}}
				className="space-y-6"
			>
				<form.Subscribe
					selector={(state) => ({
						isSubmitting: state.isSubmitting,
						canSubmit: state.canSubmit,
						otpValue: state.values.otp,
					})}
				>
					{({ isSubmitting, canSubmit, otpValue }) => (
						<>
							<div className="space-y-4">
								<FieldGroup>
									<form.Field
										name="otp"
										validators={{
											onChange: otpSchema.shape.otp,
										}}
									>
										{(field) => {
											const isInvalid =
												field.state.meta.isTouched && !field.state.meta.isValid;
											return (
												<Field data-invalid={isInvalid}>
													<FieldLabel htmlFor={field.name} className="sr-only">
														Verification code
													</FieldLabel>
													<div className="flex justify-center">
														<InputOTP
															id={field.name}
															maxLength={6}
															disabled={isSubmitting}
															value={field.state.value}
															onBlur={field.handleBlur}
															onChange={(value) => {
																setError(null);
																value = value.replace(/[^0-9]/g, "");
																field.handleChange(value);
															}}
															aria-invalid={isInvalid}
														>
															<InputOTPGroup>
																<InputOTPSlot index={0} />
																<InputOTPSlot index={1} />
																<InputOTPSlot index={2} />
																<InputOTPSlot index={3} />
																<InputOTPSlot index={4} />
																<InputOTPSlot index={5} />
															</InputOTPGroup>
														</InputOTP>
													</div>
													{isInvalid && (
														<FieldError
															className="text-center"
															errors={field.state.meta.errors}
														/>
													)}
												</Field>
											);
										}}
									</form.Field>
								</FieldGroup>

								{error && (
									<FieldError className="text-center" errors={[error]} />
								)}

								<div className="text-center">
									<p className="text-muted-foreground text-xs">
										Didn&apos;t receive the code?{" "}
										{resendCooldown > 0 ? (
											<span className="text-foreground/70">
												Try again in {resendCooldown}s
											</span>
										) : (
											<button
												type="button"
												className="text-primary hover:underline disabled:opacity-50"
												onClick={handleResendClick}
												disabled={isResending || isSubmitting}
											>
												{isResending ? "Sending..." : "Resend"}
											</button>
										)}
									</p>
								</div>
							</div>

							<div className="space-y-3">
								<Button
									type="submit"
									className="w-full"
									disabled={!canSubmit || isSubmitting || otpValue.length !== 6}
								>
									{isSubmitting ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin" />
											Verifying...
										</>
									) : (
										<>
											<Shield className="h-4 w-4" />
											Verify code
										</>
									)}
								</Button>

								<Button
									type="button"
									variant="ghost"
									className="w-full"
									onClick={handleBackClick}
									disabled={isSubmitting}
								>
									<ArrowLeft className="h-4 w-4" />
									Back to email
								</Button>
							</div>
						</>
					)}
				</form.Subscribe>
			</form>
		</div>
	);
}
