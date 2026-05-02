"use client";

import { enumToTitleText, VendorUserRole } from "@repo/shared";
import { Field, FieldLabel } from "@repo/ui/components/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { FormInput } from "@repo/ui/general/FormFields";
import { PhoneInput } from "@repo/ui/general/PhoneInput";
import type { VendorUserFormApi } from "@/hooks/use-vendor-user-form";

interface VendorUserFormFieldsProps {
	form: VendorUserFormApi;
	validators: {
		email: (value: string) => string | undefined;
		officePhone: (value: string) => string | undefined;
		mobilePhone: (value: string) => string | undefined;
	};
}

export function VendorUserFormFields({
	form,
	validators,
}: VendorUserFormFieldsProps) {
	return (
		<>
			<form.Field
				name="firstName"
				validators={{
					onBlur: ({ value }) =>
						!value ? "First name is required" : undefined,
				}}
			>
				{(field) => (
					<FormInput
						field={field}
						label="First Name"
						placeholder="First Name"
						required
					/>
				)}
			</form.Field>

			<form.Field
				name="lastName"
				validators={{
					onBlur: ({ value }) => (!value ? "Last name is required" : undefined),
				}}
			>
				{(field) => (
					<FormInput
						field={field}
						label="Last Name"
						placeholder="Last Name"
						required
					/>
				)}
			</form.Field>

			<form.Field
				name="title"
				validators={{
					onBlur: ({ value }) => (!value ? "Title is required" : undefined),
				}}
			>
				{(field) => (
					<FormInput field={field} label="Title" placeholder="Title" required />
				)}
			</form.Field>

			<form.Field
				name="email"
				validators={{
					onBlur: ({ value }) => validators.email(value),
				}}
			>
				{(field) => (
					<FormInput
						field={field}
						label="Email"
						placeholder="email@example.com"
						type="email"
						required
					/>
				)}
			</form.Field>

			<form.Field
				name="officePhone"
				validators={{
					onBlur: ({ value }) => validators.officePhone(value),
				}}
			>
				{(field) => {
					const isInvalid =
						field.state.meta.isTouched && !field.state.meta.isValid;
					return (
						<Field>
							<FieldLabel htmlFor={field.name}>Office Phone</FieldLabel>
							<PhoneInput
								id={field.name}
								name={field.name}
								placeholder="555-123-4567"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(value) => field.handleChange(value)}
								aria-invalid={isInvalid}
							/>
						</Field>
					);
				}}
			</form.Field>

			<form.Field
				name="mobilePhone"
				validators={{
					onBlur: ({ value }) => validators.mobilePhone(value),
				}}
			>
				{(field) => {
					const isInvalid =
						field.state.meta.isTouched && !field.state.meta.isValid;
					return (
						<Field>
							<FieldLabel htmlFor={field.name}>Mobile Phone</FieldLabel>
							<PhoneInput
								id={field.name}
								name={field.name}
								placeholder="555-987-6543"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(value) => field.handleChange(value)}
								aria-invalid={isInvalid}
							/>
						</Field>
					);
				}}
			</form.Field>

			<form.Field name="status">
				{(field) => (
					<Field>
						<FieldLabel>Status</FieldLabel>
						<Select
							value={field.state.value}
							onValueChange={(value) => field.handleChange(value)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Active">Active</SelectItem>
								<SelectItem value="Inactive">Inactive</SelectItem>
							</SelectContent>
						</Select>
					</Field>
				)}
			</form.Field>
			<form.Field name="role">
				{(field) => (
					<Field>
						<FieldLabel>Role</FieldLabel>
						<Select
							value={field.state.value}
							onValueChange={(value) =>
								field.handleChange(value as VendorUserRole)
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select role" />
							</SelectTrigger>
							<SelectContent>
								{Object.keys(VendorUserRole).map((role) => (
									<SelectItem key={role} value={role}>
										{enumToTitleText(role as VendorUserRole)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</Field>
				)}
			</form.Field>
		</>
	);
}
