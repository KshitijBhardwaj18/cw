"use client";

import { Button } from "@repo/ui/components/button";
import { DatePicker } from "@repo/ui/components/date-picker";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { cn } from "@repo/ui/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export type FilterFieldConfig = {
	key: string;
	label: string;
	type: "select" | "date";
	options?: readonly { value: string; label: string }[];
	placeholder?: string;
	/** For `type: "date"`, YYYY-MM-DD bounds passed to `DatePicker` */
	min?: string;
	max?: string;
	primary: boolean;
};

export type FilterBarProps = {
	fields: FilterFieldConfig[];
	values: Record<string, string>;
	onChange: (key: string, value: string) => void;
	className?: string;
};

export function FilterBar({
	fields,
	values,
	onChange,
	className,
}: Readonly<FilterBarProps>) {
	const [expanded, setExpanded] = useState(false);

	const primaryFields = fields.filter((f) => f.primary);
	const secondaryFields = fields.filter((f) => !f.primary);
	const hasSecondary = secondaryFields.length > 0;

	const renderField = (field: Readonly<FilterFieldConfig>) => {
		if (field.type === "date") {
			return (
				<div key={field.key} className="flex flex-col gap-1.5">
					<label
						htmlFor={`filter-${field.key}`}
						className="text-muted-foreground text-sm font-medium"
					>
						{field.label}
					</label>
					<DatePicker
						id={`filter-${field.key}`}
						className="h-9"
						value={values[field.key] ?? ""}
						onChange={(v) => onChange(field.key, v)}
						placeholder={field.placeholder ?? "Pick a date"}
						min={field.min}
						max={field.max}
						clearable
					/>
				</div>
			);
		}

		return (
			<div key={field.key} className="flex flex-col gap-1.5">
				<label
					htmlFor={`filter-${field.key}`}
					className="text-muted-foreground text-sm font-medium"
				>
					{field.label}
				</label>
				<Select
					value={values[field.key] ?? ""}
					onValueChange={(val) => onChange(field.key, val)}
				>
					<SelectTrigger id={`filter-${field.key}`} className="h-9 w-full">
						<SelectValue
							placeholder={field.placeholder ?? `All ${field.label}s`}
						/>
					</SelectTrigger>
					<SelectContent>
						{field.options?.map((opt) => (
							<SelectItem key={opt.value} value={opt.value}>
								{opt.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		);
	};

	return (
		<div className={cn("space-y-3", className)}>
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
				{primaryFields.map(renderField)}
			</div>

			{hasSecondary && (
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="text-muted-foreground h-7 gap-1 px-2 text-xs"
					onClick={() => setExpanded((v) => !v)}
				>
					{expanded ? (
						<ChevronUp className="size-3.5" />
					) : (
						<ChevronDown className="size-3.5" />
					)}
					{expanded ? "Hide Filters" : "Show Filters"}
				</Button>
			)}

			{hasSecondary && expanded && (
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
					{secondaryFields.map(renderField)}
				</div>
			)}
		</div>
	);
}
