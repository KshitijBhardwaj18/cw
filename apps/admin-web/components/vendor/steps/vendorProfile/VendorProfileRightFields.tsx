import { formatTaxId, validatePhone } from "@repo/shared";
import { Field, FieldGroup, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { FormInput, FormNumberInput } from "@repo/ui/general/FormFields";
import { PhoneInput } from "@repo/ui/general/PhoneInput";
import type { VendorProfileApi } from "@/hooks/use-vendor-profile";

interface VendorProfileRightFieldsProps {
	form: VendorProfileApi;
}

export function VendorProfileRightFields({
	form,
}: VendorProfileRightFieldsProps) {
	return (
		<FieldGroup>
			<form.Field
				name="taxId"
				validators={{
					onBlur: ({ value }) => {
						if (!value) return undefined;
						const digits = value.replace(/\D/g, "");
						return digits.length > 0 && digits.length !== 9
							? "Tax ID must be 9 digits (XX-XXXXXXX)"
							: undefined;
					},
				}}
			>
				{(field) => (
					<FormInput
						field={field}
						label="Tax ID Number"
						placeholder="83-7388930"
						inputMode="numeric"
						maxLength={10}
						onChange={(v) => field.handleChange(formatTaxId(v))}
					/>
				)}
			</form.Field>

			<form.Field
				name="phoneNumber"
				validators={{
					onBlur: ({ value }) => validatePhone(value),
				}}
			>
				{(field) => {
					const isInvalid =
						field.state.meta.isTouched && !field.state.meta.isValid;
					return (
						<Field>
							<FieldLabel htmlFor={field.name}>Main Phone Number</FieldLabel>
							<PhoneInput
								id={field.name}
								name={field.name}
								placeholder="Main Phone Number"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(value) => field.handleChange(value)}
								aria-invalid={isInvalid}
							/>
						</Field>
					);
				}}
			</form.Field>

			<form.Field name="website">
				{(field) => (
					<FormInput
						field={field}
						label="Website"
						placeholder="www.novahealth.com"
					/>
				)}
			</form.Field>

			<form.Field name="addressStreet">
				{(field) => (
					<FormInput
						field={field}
						label="Address"
						placeholder="Main Campus - 994 Tustin Avenue, Seattle, WA"
					/>
				)}
			</form.Field>

			<form.Field name="annualRevenue">
				{(field) => (
					<FormNumberInput
						field={field}
						label="Annual Revenue"
						placeholder="$25,000,000"
					/>
				)}
			</form.Field>

			<form.Field name="employeeCount">
				{(field) => (
					<FormNumberInput
						field={field}
						label="Employee Count"
						placeholder="300"
					/>
				)}
			</form.Field>

			<form.Field name="internalId">
				{(field) => (
					<FormInput field={field} label="Internal Vendor ID Number" readOnly />
				)}
			</form.Field>
			<p className="-mt-6 text-xs text-muted-foreground">
				System-generated, read-only
			</p>

			<form.Field name="createdDate">
				{(field) => (
					<Field>
						<FieldLabel>Created Date</FieldLabel>
						<Input
							value={new Date(field.state.value).toLocaleDateString("en-US")}
							readOnly
						/>
					</Field>
				)}
			</form.Field>
		</FieldGroup>
	);
}
