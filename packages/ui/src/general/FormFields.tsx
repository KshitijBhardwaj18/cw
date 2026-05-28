import {
	formatCurrency,
	parseUsdNumberInput,
	USD_CURRENCY_CODE,
	USD_LOCALE,
} from "@repo/shared";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { type ReactNode, useState } from "react";

export interface FormFieldApi<TValue = string> {
	name: string;
	state: {
		value: TValue;
		meta: {
			isTouched: boolean;
			isValid: boolean;
			errors: unknown[];
		};
	};
	handleBlur: () => void;
	handleChange: (updater: TValue) => void;
}

// --- Shared wrapper ---

interface FormFieldWrapperProps {
	meta: FormFieldApi["state"]["meta"];
	name?: string;
	label: string;
	required?: boolean;
	children: (invalid: boolean) => ReactNode;
}

function FormFieldWrapper({
	meta,
	label,
	name,
	required = false,
	children,
}: Readonly<FormFieldWrapperProps>) {
	const invalid = meta.isTouched && !meta.isValid;
	return (
		<Field data-invalid={invalid}>
			<FieldLabel htmlFor={name}>
				{label} {required && <RequiredStar />}
			</FieldLabel>
			{children(invalid)}
			{invalid && (
				<FieldError errors={meta.errors.map((e) => ({ message: String(e) }))} />
			)}
		</Field>
	);
}

// --- Text Input ---

interface FormInputProps {
	field: FormFieldApi<string>;
	label: string;
	placeholder?: string;
	required?: boolean;
	type?: string;
	inputMode?: "text" | "numeric" | "tel" | "email";
	maxLength?: number;
	readOnly?: boolean;
	onChange?: (value: string) => void;
}

export function FormInput({
	field,
	label,
	placeholder,
	required,
	type = "text",
	inputMode,
	maxLength,
	readOnly,
	onChange,
}: Readonly<FormInputProps>) {
	return (
		<FormFieldWrapper
			meta={field.state.meta}
			name={field.name}
			label={label}
			required={required}
		>
			{(invalid) => (
				<Input
					id={field.name}
					name={field.name}
					type={type}
					inputMode={inputMode}
					value={field.state.value}
					onBlur={field.handleBlur}
					onChange={(e) =>
						onChange
							? onChange(e.target.value)
							: field.handleChange(e.target.value)
					}
					aria-invalid={invalid}
					placeholder={placeholder}
					maxLength={maxLength}
					disabled={readOnly}
				/>
			)}
		</FormFieldWrapper>
	);
}

// --- Number Input ---

interface FormNumberInputProps {
	field: FormFieldApi<number | null>;
	label: string;
	required?: boolean;
	placeholder?: string;
}

export function FormNumberInput({
	field,
	label,
	required,
	placeholder,
}: Readonly<FormNumberInputProps>) {
	return (
		<FormFieldWrapper
			meta={field.state.meta}
			name={field.name}
			label={label}
			required={required}
		>
			{(invalid) => (
				<Input
					id={field.name}
					name={field.name}
					type="number"
					value={field.state.value ?? ""}
					onBlur={field.handleBlur}
					onChange={(e) =>
						field.handleChange(e.target.value ? Number(e.target.value) : null)
					}
					aria-invalid={invalid}
					placeholder={placeholder}
				/>
			)}
		</FormFieldWrapper>
	);
}

// --- Currency (USD) ---

interface FormCurrencyInputProps {
	field: FormFieldApi<number | null>;
	label: string;
	required?: boolean;
	placeholder?: string;
	minimumFractionDigits?: number;
	maximumFractionDigits?: number;
}

/**
 * Money input: stores a number; keeps US currency formatting (symbol + grouping) while typing.
 */
export function FormCurrencyInput({
	field,
	label,
	required,
	placeholder,
	minimumFractionDigits = 0,
	maximumFractionDigits = 2,
}: Readonly<FormCurrencyInputProps>) {
	const [isFocused, setIsFocused] = useState(false);
	const [editBuffer, setEditBuffer] = useState<string | null>(null);

	const formatAmount = (n: number | null) => {
		if (n == null) return "";
		return formatCurrency(
			n,
			USD_CURRENCY_CODE,
			USD_LOCALE,
			minimumFractionDigits,
			maximumFractionDigits,
		);
	};

	const displayValue =
		isFocused && editBuffer !== null
			? editBuffer
			: formatAmount(field.state.value ?? null);

	const moveCaretToEnd = () => {
		queueMicrotask(() => {
			const el = document.getElementById(field.name) as HTMLInputElement | null;
			if (el && document.activeElement === el) {
				const len = el.value.length;
				el.setSelectionRange(len, len);
			}
		});
	};

	return (
		<FormFieldWrapper
			meta={field.state.meta}
			name={field.name}
			label={label}
			required={required}
		>
			{(invalid) => (
				<Input
					id={field.name}
					name={field.name}
					type="text"
					inputMode="decimal"
					autoComplete="off"
					value={displayValue}
					onFocus={() => {
						setIsFocused(true);
						setEditBuffer(formatAmount(field.state.value ?? null));
					}}
					onChange={(e) => {
						const raw = e.target.value;
						if (raw.trim() === "") {
							setEditBuffer("");
							field.handleChange(null);
							return;
						}
						const parsed = parseUsdNumberInput(raw);
						field.handleChange(parsed);
						if (parsed !== null) {
							setEditBuffer(formatAmount(parsed));
							moveCaretToEnd();
						} else {
							setEditBuffer(raw);
						}
					}}
					onBlur={() => {
						setIsFocused(false);
						setEditBuffer(null);
						field.handleBlur();
					}}
					aria-invalid={invalid}
					placeholder={placeholder}
				/>
			)}
		</FormFieldWrapper>
	);
}

// --- Textarea ---

interface FormTextareaProps {
	field: FormFieldApi<string>;
	label: string;
	required?: boolean;
	placeholder?: string;
	rows?: number;
	maxLength?: number;
}

export function FormTextarea({
	field,
	label,
	required,
	placeholder,
	rows = 4,
	maxLength,
}: Readonly<FormTextareaProps>) {
	return (
		<FormFieldWrapper
			meta={field.state.meta}
			name={field.name}
			label={label}
			required={required}
		>
			{(invalid) => (
				<>
					<Textarea
						id={field.name}
						name={field.name}
						value={field.state.value}
						onBlur={field.handleBlur}
						onChange={(e) => field.handleChange(e.target.value)}
						aria-invalid={invalid}
						placeholder={placeholder}
						rows={rows}
						maxLength={maxLength}
						className="max-h-40 overflow-y-auto"
					/>
				</>
			)}
		</FormFieldWrapper>
	);
}

// --- Checkbox Group ---

interface CheckboxOption {
	value: string;
	label: string;
}

interface FormCheckboxGroupProps {
	field: FormFieldApi<string[]>;
	label: string;
	required?: boolean;
	options: readonly CheckboxOption[];
	idPrefix: string;
}

export function FormCheckboxGroup({
	field,
	label,
	required,
	options,
	idPrefix,
}: Readonly<FormCheckboxGroupProps>) {
	const toggle = (val: string, checked: boolean | "indeterminate") => {
		field.handleChange(
			checked
				? [...field.state.value, val]
				: field.state.value.filter((v) => v !== val),
		);
	};

	return (
		<FormFieldWrapper meta={field.state.meta} label={label} required={required}>
			{() => (
				<div className="space-y-2">
					{options.map((opt) => (
						<div
							key={opt.value}
							className="flex items-center gap-2 cursor-pointer"
						>
							<Checkbox
								id={`${idPrefix}-${opt.value}`}
								checked={field.state.value.includes(opt.value)}
								onCheckedChange={(checked) => toggle(opt.value, checked)}
							/>
							<label
								htmlFor={`${idPrefix}-${opt.value}`}
								className="text-sm cursor-pointer"
							>
								{opt.label}
							</label>
						</div>
					))}
				</div>
			)}
		</FormFieldWrapper>
	);
}
