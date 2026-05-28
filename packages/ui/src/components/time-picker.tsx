"use client";

import { buttonVariants } from "@repo/ui/components/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@repo/ui/components/popover";
import { cn } from "@repo/ui/lib/utils";
import { format, parse } from "date-fns";
import { ChevronDownIcon, Clock } from "lucide-react";
import * as React from "react";

const TIME_FORMAT = "HH:mm";
const INTERVAL_MINUTES = 15;

/** Generate time options in HH:mm format at 15-minute intervals */
function getTimeOptions(): string[] {
	const options: string[] = [];
	for (let h = 0; h < 24; h++) {
		for (let m = 0; m < 60; m += INTERVAL_MINUTES) {
			options.push(
				`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`,
			);
		}
	}
	return options;
}

export const TIME_OPTIONS = getTimeOptions();

function parseTime(value: string): Date | undefined {
	if (!value) return undefined;
	try {
		const d = parse(value, TIME_FORMAT, new Date());
		return Number.isNaN(d.getTime()) ? undefined : d;
	} catch {
		return undefined;
	}
}

function formatDisplay(value: string): string {
	const d = parseTime(value);
	if (!d) return "";
	return format(d, "h:mm a");
}

export interface TimePickerProps {
	value?: string;
	onChange?: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	id?: string;
	className?: string;
	"aria-invalid"?: boolean;
	onBlur?: () => void;
	disabledOptions?: string[];
	min?: string;
}

export function TimePicker({
	value = "",
	onChange,
	placeholder = "Select time",
	disabled = false,
	id,
	className,
	"aria-invalid": ariaInvalid,
	onBlur,
	disabledOptions,
	min,
}: Readonly<TimePickerProps>) {
	const [open, setOpen] = React.useState(false);
	const scrollRef = React.useRef<HTMLDivElement>(null);

	const displayValue = value ? formatDisplay(value) : null;

	// Scroll to selected time when popover opens
	React.useEffect(() => {
		if (!open || !value || !scrollRef.current) return;
		const index = TIME_OPTIONS.indexOf(value);
		if (index >= 0) {
			const option = scrollRef.current.querySelector(
				`[data-time-option="${value}"]`,
			);
			option?.scrollIntoView({ block: "nearest" });
		}
	}, [open, value]);

	const handleSelect = React.useCallback(
		(option: string) => {
			onChange?.(option);
			setOpen(false);
		},
		[onChange],
	);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<div
					id={id}
					role="combobox"
					tabIndex={disabled ? -1 : 0}
					aria-expanded={open}
					aria-invalid={ariaInvalid}
					aria-haspopup="listbox"
					onBlur={onBlur}
					className={cn(
						buttonVariants({ variant: "outline" }),
						"flex w-full cursor-pointer items-center justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
						disabled && "pointer-events-none opacity-50",
						className,
					)}
					data-empty={!value}
				>
					<Clock className="mr-2 size-4 shrink-0" />
					{displayValue ?? <span>{placeholder}</span>}
					<ChevronDownIcon className="ml-auto size-4 shrink-0 opacity-50" />
				</div>
			</PopoverTrigger>
			<PopoverContent
				className="z-100 w-auto p-0"
				align="start"
				// Wheel events must not bubble to e.g. DialogContent (overflow-auto) or the list won’t scroll.
				onWheel={(e) => e.stopPropagation()}
			>
				<div
					ref={scrollRef}
					className="h-[240px] w-[140px] overflow-y-auto overflow-x-hidden overscroll-contain p-1"
				>
					{TIME_OPTIONS.map((option) => {
						const isDisabled =
							disabledOptions?.includes(option) || Boolean(min && option < min);
						return (
							<button
								key={option}
								type="button"
								disabled={isDisabled}
								data-time-option={option}
								className={cn(
									"flex w-full cursor-pointer items-center rounded-md px-3 py-2 text-left text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
									value === option && "bg-accent text-accent-foreground",
									isDisabled && "pointer-events-none opacity-30",
								)}
								onClick={() => handleSelect(option)}
							>
								{formatDisplay(option)}
							</button>
						);
					})}
				</div>
			</PopoverContent>
		</Popover>
	);
}
