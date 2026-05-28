"use client";

import { buttonVariants } from "@repo/ui/components/button";
import { Calendar } from "@repo/ui/components/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@repo/ui/components/popover";
import { cn } from "@repo/ui/lib/utils";
import { format, parse } from "date-fns";
import { CalendarIcon, ChevronDownIcon, X } from "lucide-react";
import * as React from "react";

const DATE_FORMAT = "yyyy-MM-dd";

function parseDate(value: string): Date | undefined {
	if (!value) return undefined;
	const parsed = parse(value, DATE_FORMAT, new Date());
	return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function formatDate(date: Date | undefined): string {
	if (!date) return "";
	return format(date, DATE_FORMAT);
}

export interface DatePickerProps {
	value?: string;
	onChange?: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	min?: string;
	max?: string;
	id?: string;
	className?: string;
	"aria-invalid"?: boolean;
	onBlur?: () => void;
	/** When true, shows a clear button when a value is selected */
	clearable?: boolean;
}

export function DatePicker({
	value = "",
	onChange,
	placeholder = "Pick a date",
	disabled = false,
	min,
	max,
	id,
	className,
	"aria-invalid": ariaInvalid,
	onBlur,
	clearable = false,
}: Readonly<DatePickerProps>) {
	const [open, setOpen] = React.useState(false);
	const date = parseDate(value);
	const minDate = min ? parseDate(min) : undefined;
	const maxDate = max ? parseDate(max) : undefined;

	const handleSelect = React.useCallback(
		(selected: Date | undefined) => {
			if (selected) {
				onChange?.(formatDate(selected));
				setOpen(false);
			}
		},
		[onChange],
	);

	const displayValue = value
		? (() => {
				const d = parseDate(value);
				return d ? format(d, "PPP") : value;
			})()
		: null;

	const { startMonth, endMonth, defaultDisplayMonth } = React.useMemo(() => {
		const now = new Date();
		const defaultStart = new Date(now.getFullYear() - 100, 0, 1);
		const defaultEnd = new Date(now.getFullYear() + 100, 11, 1);
		const start = minDate
			? new Date(minDate.getFullYear(), minDate.getMonth(), 1)
			: defaultStart;
		const end = maxDate
			? new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)
			: defaultEnd;
		let initial = date ?? now;
		if (minDate && initial < minDate) {
			initial = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
		}
		if (maxDate && initial > maxDate) {
			initial = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
		}
		return { startMonth: start, endMonth: end, defaultDisplayMonth: initial };
	}, [date, minDate, maxDate]);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<div
					id={id}
					role="combobox"
					tabIndex={disabled ? -1 : 0}
					aria-expanded={open}
					aria-invalid={ariaInvalid}
					aria-haspopup="dialog"
					onBlur={onBlur}
					className={cn(
						buttonVariants({ variant: "outline" }),
						"flex w-full cursor-pointer items-center justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
						disabled && "pointer-events-none opacity-50",
						className,
					)}
					data-empty={!value}
				>
					<CalendarIcon className="mr-2 size-4 shrink-0" />
					{displayValue ?? <span>{placeholder}</span>}
					<div className="ml-auto flex items-center gap-1">
						{clearable && value && (
							<button
								type="button"
								className="rounded p-0.5 hover:bg-muted"
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									onChange?.("");
								}}
								aria-label="Clear date"
							>
								<X className="size-3.5" />
							</button>
						)}
						<ChevronDownIcon className="size-4 shrink-0 opacity-50" />
					</div>
				</div>
			</PopoverTrigger>
			<PopoverContent
				className="z-100 w-auto p-0"
				align="start"
				onWheel={(e) => e.stopPropagation()}
			>
				<Calendar
					key={value || "no-date"}
					mode="single"
					captionLayout="dropdown"
					startMonth={startMonth}
					endMonth={endMonth}
					selected={date}
					defaultMonth={defaultDisplayMonth}
					onSelect={handleSelect}
					disabled={(day) => {
						if (minDate && day < minDate) return true;
						if (maxDate && day > maxDate) return true;
						return false;
					}}
				/>
			</PopoverContent>
		</Popover>
	);
}
