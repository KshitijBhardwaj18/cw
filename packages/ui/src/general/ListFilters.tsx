"use client";

import { DatePicker } from "@repo/ui/components/date-picker";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";

export interface FilterOption {
	value: string;
	label: string;
}

export interface TypeFilterConfig {
	options: readonly FilterOption[] | FilterOption[];
	value: string;
	onChange: (value: string) => void;
	label?: string;
	allLabel?: string;
	placeholder?: string;
	className?: string;
}

export interface DateRangeFilterConfig {
	dateFrom: string;
	dateTo: string;
	onDateFromChange: (value: string) => void;
	onDateToChange: (value: string) => void;
	label?: string;
	fromPlaceholder?: string;
	toPlaceholder?: string;
	className?: string;
}

export interface ListFiltersProps {
	typeFilter?: TypeFilterConfig;
	dateRangeFilter?: DateRangeFilterConfig;
	className?: string;
}

export function ListFilters({
	typeFilter,
	dateRangeFilter,
	className,
}: ListFiltersProps) {
	const hasFilters = typeFilter ?? dateRangeFilter;
	if (!hasFilters) return null;

	return (
		<div className={`flex flex-wrap items-center gap-4 ${className ?? ""}`}>
			{typeFilter && (
				<div
					className={`flex items-center gap-2 ${typeFilter.className ?? ""}`}
				>
					<span className="text-muted-foreground text-sm">
						{typeFilter.label ?? "Type"}:
					</span>
					<Select
						value={typeFilter.value || "all"}
						onValueChange={(v) => typeFilter.onChange(v === "all" ? "" : v)}
					>
						<SelectTrigger className="w-[140px]">
							<SelectValue
								placeholder={
									typeFilter.placeholder ?? typeFilter.allLabel ?? "All Types"
								}
							/>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">
								{typeFilter.allLabel ?? "All Types"}
							</SelectItem>
							{typeFilter.options.map((opt) => (
								<SelectItem key={opt.value} value={opt.value}>
									{opt.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			)}
			{dateRangeFilter && (
				<div
					className={`flex items-center gap-2 shrink-0 ${dateRangeFilter.className ?? ""}`}
				>
					<span className="text-muted-foreground text-sm">
						{dateRangeFilter.label ?? "Date"}:
					</span>
					<DatePicker
						value={dateRangeFilter.dateFrom}
						onChange={(newFrom) => {
							dateRangeFilter.onDateFromChange(newFrom);
							if (
								newFrom &&
								dateRangeFilter.dateTo &&
								dateRangeFilter.dateTo < newFrom
							) {
								dateRangeFilter.onDateToChange("");
							}
						}}
						max={dateRangeFilter.dateTo || undefined}
						placeholder={dateRangeFilter.fromPlaceholder ?? "From"}
						className="w-fit min-w-[140px]"
						clearable
					/>
					<span className="text-muted-foreground text-sm">to</span>
					<DatePicker
						value={dateRangeFilter.dateTo}
						onChange={(v) => dateRangeFilter.onDateToChange(v)}
						min={dateRangeFilter.dateFrom || undefined}
						placeholder={dateRangeFilter.toPlaceholder ?? "To"}
						className="w-fit min-w-[140px]"
						clearable
					/>
				</div>
			)}
		</div>
	);
}
