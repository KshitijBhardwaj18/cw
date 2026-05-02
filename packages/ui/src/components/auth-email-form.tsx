"use client";

import { Button } from "@repo/ui/components/button";
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
import {
	type EmailFormValues,
	emailSchema,
} from "@repo/ui/lib/auth-email-otp-schema";
import { useForm } from "@tanstack/react-form";
import { Loader2, Mail } from "lucide-react";
import { useState } from "react";

interface EmailFormProps {
	onSendOTP: (email: string) => Promise<boolean>;
}

export function EmailForm({ onSendOTP }: EmailFormProps) {
	const [error, setError] = useState<string | null>(null);

	const defaultValues: EmailFormValues = {
		email: "",
	};

	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: emailSchema,
		},
		onSubmit: async ({ value }) => {
			setError(null);
			try {
				await onSendOTP(value.email);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to send OTP");
			}
		},
	});

	return (
		<div className="space-y-4">
			<div className="space-y-2 text-center">
				<h2 className="text-lg font-semibold">Sign in with email</h2>
				<p className="text-muted-foreground text-sm">
					Enter your email to receive a verification code
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
									name="email"
									validators={{
										onChange: emailSchema.shape.email,
									}}
								>
									{(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel
													htmlFor={field.name}
													className="text-sm font-medium"
												>
													Email address
												</FieldLabel>
												<InputGroup>
													<InputGroupAddon>
														<Mail />
													</InputGroupAddon>
													<InputGroupInput
														id={field.name}
														name={field.name}
														type="email"
														placeholder="name@example.com"
														disabled={isSubmitting}
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(event) =>
															field.handleChange(event.target.value)
														}
														aria-invalid={isInvalid}
													/>
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

							<Button
								type="submit"
								className="w-full"
								disabled={!canSubmit || isSubmitting}
							>
								{isSubmitting ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin" />
										Sending code...
									</>
								) : (
									<>
										<Mail className="h-4 w-4" />
										Send verification code
									</>
								)}
							</Button>
						</>
					)}
				</form.Subscribe>
			</form>
		</div>
	);
}
