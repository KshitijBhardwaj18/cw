import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { PhoneInput } from "@repo/ui/general/PhoneInput";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { cn } from "@repo/ui/lib/utils";
import { useId } from "react";

interface DetailInputFieldProps {
	label: string;
	value: string;
	editMode?: boolean;
	readOnly?: boolean;
	className?: string;
	type?: "text" | "phone";
	onChange?: (value: string) => void;
	onBlur?: () => void;
	name?: string;
	required?: boolean;
	errors?: (string | { message?: string } | undefined)[];
}

export function DetailInputField({
	label,
	value,
	editMode = false,
	readOnly = false,
	className,
	type = "text",
	onChange,
	onBlur,
	name,
	required = false,
	errors = [],
}: Readonly<DetailInputFieldProps>) {
	const id = useId();
	const isInvalid = errors.length > 0;

	return (
		<Field className={className} data-invalid={isInvalid}>
			<FieldLabel htmlFor={id} className="text-muted-foreground font-normal">
				{label} {required && <RequiredStar />}
			</FieldLabel>
			{type === "phone" ? (
				<PhoneInput
					id={id}
					name={name}
					value={value}
					onBlur={onBlur}
					disabled={!editMode || readOnly}
					onChange={(val: string) => onChange?.(val)}
					className={cn(
						"[&_input]:disabled:opacity-100 [&_button]:disabled:opacity-100",
						readOnly &&
							"[&_button]:bg-muted bg-muted [&_button]:border-transparent [&_input]:border-transparent",
						!readOnly &&
							editMode &&
							"[&_input]:border-primary/50 [&_button]:border-primary/50",
					)}
				/>
			) : (
				<Input
					id={id || name}
					name={name}
					value={value}
					disabled={!editMode || readOnly}
					onBlur={onBlur}
					onChange={(e) => onChange?.(e.target.value)}
					aria-invalid={isInvalid}
					className={cn(
						"disabled:opacity-100",
						readOnly && "bg-muted border-transparent",
						!readOnly && editMode && "border-primary/50",
					)}
				/>
			)}
			{isInvalid && <FieldError errors={errors} />}
		</Field>
	);
}
