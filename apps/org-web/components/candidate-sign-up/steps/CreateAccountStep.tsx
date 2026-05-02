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
import RequiredStar from "@repo/ui/general/RequiredStar";
import { Loader2, User } from "lucide-react";
import { useCreateAccountStepForm } from "@/hooks/candidate/use-create-account-step-form";
import {
	type CreateAccountFormValues,
	createAccountBaseSchema,
} from "@/schemas/candidate-sign-up.schema";

interface CreateAccountStepProps {
	defaultValues: Partial<CreateAccountFormValues>;
	onContinue: (values: CreateAccountFormValues) => void;
	onValuesChange?: (values: CreateAccountFormValues) => void;
	disabledFields?: Partial<Record<keyof CreateAccountFormValues, boolean>>;
}

export function CreateAccountStep({
	defaultValues,
	onContinue,
	onValuesChange,
	disabledFields,
}: CreateAccountStepProps) {
	const { form } = useCreateAccountStepForm({
		defaultValues,
		onContinue,
		onValuesChange,
	});

	return (
		<>
			<div className="space-y-1">
				<h2 className="text-lg font-semibold">Create Your Account</h2>
				<p className="text-muted-foreground text-sm">
					{disabledFields?.email
						? "Your account has been created via your invite. Update your name if needed."
						: "Let's get started with your basic information."}
				</p>
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					void form.handleSubmit();
				}}
				className="space-y-4"
			>
				<FieldGroup>
					<form.Field
						name="firstName"
						validators={{ onChange: createAccountBaseSchema.shape.firstName }}
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
										First Name <RequiredStar />
									</FieldLabel>
									<InputGroup>
										<InputGroupAddon>
											<User />
										</InputGroupAddon>
										<InputGroupInput
											id={field.name}
											name={field.name}
											placeholder="First Name"
											value={field.state.value}
											onBlur={
												disabledFields?.firstName ? undefined : field.handleBlur
											}
											onChange={
												disabledFields?.firstName
													? undefined
													: (e) => field.handleChange(e.target.value)
											}
											disabled={disabledFields?.firstName}
											aria-invalid={isInvalid}
										/>
									</InputGroup>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<form.Field
						name="lastName"
						validators={{ onChange: createAccountBaseSchema.shape.lastName }}
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
										Last Name <RequiredStar />
									</FieldLabel>
									<InputGroup>
										<InputGroupAddon>
											<User />
										</InputGroupAddon>
										<InputGroupInput
											id={field.name}
											name={field.name}
											placeholder="Last Name"
											value={field.state.value}
											onBlur={
												disabledFields?.lastName ? undefined : field.handleBlur
											}
											onChange={
												disabledFields?.lastName
													? undefined
													: (e) => field.handleChange(e.target.value)
											}
											disabled={disabledFields?.lastName}
											aria-invalid={isInvalid}
										/>
									</InputGroup>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<form.Field
						name="email"
						validators={{ onChange: createAccountBaseSchema.shape.email }}
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
										Email <RequiredStar />
									</FieldLabel>
									<InputGroup>
										<InputGroupInput
											id={field.name}
											name={field.name}
											type="email"
											placeholder="you@example.com"
											value={field.state.value}
											onBlur={
												disabledFields?.email ? undefined : field.handleBlur
											}
											onChange={
												disabledFields?.email
													? undefined
													: (e) => field.handleChange(e.target.value)
											}
											disabled={disabledFields?.email}
											aria-invalid={isInvalid}
										/>
									</InputGroup>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>
				</FieldGroup>
				<div className="flex justify-end">
					<form.Subscribe
						selector={(state) => ({
							isSubmitting: state.isSubmitting,
							canSubmit: state.canSubmit,
						})}
					>
						{({ isSubmitting, canSubmit }) => (
							<Button type="submit" disabled={!canSubmit || isSubmitting}>
								{isSubmitting ? (
									<Loader2 className="size-4 animate-spin" />
								) : null}
								Continue
							</Button>
						)}
					</form.Subscribe>
				</div>
			</form>
		</>
	);
}
