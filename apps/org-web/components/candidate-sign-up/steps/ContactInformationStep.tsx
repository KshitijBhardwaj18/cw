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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { PhoneInput } from "@repo/ui/general/PhoneInput";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { Loader2, MapPin } from "lucide-react";
import { useContactInformationStepForm } from "@/hooks/candidate/use-contact-information-step-form";
import {
	type ContactInformationFormValues,
	contactInformationSchema,
	US_STATES,
} from "@/schemas/candidate-sign-up.schema";

interface ContactInformationStepProps {
	defaultValues: Partial<ContactInformationFormValues>;
	onBack: () => void;
	onContinue: (values: ContactInformationFormValues) => void;
	onValuesChange?: (values: ContactInformationFormValues) => void;
}

export function ContactInformationStep({
	defaultValues,
	onBack,
	onContinue,
	onValuesChange,
}: ContactInformationStepProps) {
	const { form } = useContactInformationStepForm({
		defaultValues,
		onContinue,
		onValuesChange,
	});

	return (
		<>
			<div className="space-y-1">
				<h2 className="text-lg font-semibold">Contact Information</h2>
				<p className="text-muted-foreground text-sm">Where can we reach you?</p>
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
						name="phone"
						validators={{ onChange: contactInformationSchema.shape.phone }}
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
										Phone Number <RequiredStar />
									</FieldLabel>
									<PhoneInput
										id={field.name}
										name={field.name}
										placeholder="+19876543210"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(value) => field.handleChange(value)}
										aria-invalid={isInvalid}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<form.Field
						name="streetAddress"
						validators={{
							onChange: contactInformationSchema.shape.streetAddress,
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
										Street Address <RequiredStar />
									</FieldLabel>
									<InputGroup>
										<InputGroupAddon>
											<MapPin />
										</InputGroupAddon>
										<InputGroupInput
											id={field.name}
											name={field.name}
											placeholder="Street Address"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
										/>
									</InputGroup>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<form.Field
						name="city"
						validators={{ onChange: contactInformationSchema.shape.city }}
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
										City <RequiredStar />
									</FieldLabel>
									<InputGroup>
										<InputGroupInput
											id={field.name}
											name={field.name}
											placeholder="City"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
										/>
									</InputGroup>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<form.Field
						name="state"
						validators={{ onChange: contactInformationSchema.shape.state }}
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
										State <RequiredStar />
									</FieldLabel>
									<Select
										value={field.state.value}
										onValueChange={(v) => field.handleChange(v)}
									>
										<SelectTrigger
											id={field.name}
											className="w-full"
											aria-invalid={isInvalid}
										>
											<SelectValue placeholder="State" />
										</SelectTrigger>
										<SelectContent>
											{US_STATES.map((state) => (
												<SelectItem key={state} value={state}>
													{state}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<form.Field
						name="zipCode"
						validators={{ onChange: contactInformationSchema.shape.zipCode }}
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
										ZIP Code <RequiredStar />
									</FieldLabel>
									<InputGroup>
										<InputGroupInput
											id={field.name}
											name={field.name}
											placeholder="12345"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
										/>
									</InputGroup>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>
				</FieldGroup>

				<div className="flex items-center justify-between pt-6">
					<Button type="button" variant="outline" onClick={onBack}>
						Back
					</Button>
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
