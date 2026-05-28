import {
	endOfMonth,
	endOfWeek,
	endOfYear,
	format,
	isAfter,
	isSameDay,
	isSameYear,
	isWithinInterval,
	parseISO,
	startOfDay,
	startOfMonth,
	startOfWeek,
	startOfYear,
	subMonths,
	subWeeks,
	subYears,
} from "date-fns";
import type { DateRange } from "react-day-picker";

export const isLastWeek = (date: Date | string): boolean => {
	const lastWeekStart = startOfWeek(subWeeks(new Date(), 1), {
		weekStartsOn: 1,
	});
	const lastWeekEnd = endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });

	return isWithinInterval(new Date(date), {
		start: lastWeekStart,
		end: lastWeekEnd,
	});
};

export const isLastMonth = (date: Date | string): boolean => {
	const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
	const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));

	return isWithinInterval(new Date(date), {
		start: lastMonthStart,
		end: lastMonthEnd,
	});
};

export const isLastYear = (date: Date | string): boolean => {
	const lastYearStart = startOfYear(subYears(new Date(), 1));
	const lastYearEnd = endOfYear(subYears(new Date(), 1));

	return isWithinInterval(new Date(date), {
		start: lastYearStart,
		end: lastYearEnd,
	});
};

export const monthRange: DateRange = {
	from: startOfMonth(new Date()),
	to: endOfMonth(new Date()),
};

export const weekRange: DateRange = {
	from: startOfWeek(new Date()),
	to: endOfWeek(new Date()),
};

export function formatDate(
	date: Date | string,
	pattern = "MMM d, yyyy",
): string {
	return format(new Date(date), pattern);
}

/** Formats a date range (e.g. "Jan 13 - Jan 19, 2025") */
export function formatDateRange(
	startStr: string | Date | null | undefined,
	endStr: string | Date | null | undefined,
): string {
	if (!startStr || !endStr) return "";

	const start = typeof startStr === "string" ? parseISO(startStr) : startStr;
	const end = typeof endStr === "string" ? parseISO(endStr) : endStr;

	if (isSameDay(start, end)) return formatDate(start);

	if (isSameYear(start, end)) {
		return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
	}

	return `${format(start, "MMM d, yyyy")} - ${format(end, "MMM d, yyyy")}`;
}

export function toIsoDateString(value: string): string | null {
	if (!value) return null;
	if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return null;
	const y = parsed.getFullYear();
	const m = String(parsed.getMonth() + 1).padStart(2, "0");
	const d = String(parsed.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

export const DATE_DISPLAY_PLACEHOLDER = "—";

export function formatDateOrPlaceholder(
	value: Date | string | null | undefined,
	options?: { pattern?: string; placeholder?: string },
): string {
	const placeholder = options?.placeholder ?? DATE_DISPLAY_PLACEHOLDER;
	const pattern = options?.pattern ?? "MMM d, yyyy";
	if (value == null) {
		return placeholder;
	}
	if (typeof value === "string" && value.trim() === "") {
		return placeholder;
	}
	try {
		const d = new Date(value);
		if (Number.isNaN(d.getTime())) {
			return placeholder;
		}
		return format(d, pattern);
	} catch {
		return placeholder;
	}
}
/** Check if a date is today or in the future */
export const isFutureDate = (date: Date | string): boolean => {
	const d = new Date(date);
	const today = startOfDay(new Date());
	return isAfter(d, today) || isSameDay(d, today);
};

/** Check if date1 is after or equal to date2 */
export const isAfterOrEqual = (
	date1: Date | string,
	date2: Date | string,
): boolean => {
	const d1 = new Date(date1);
	const d2 = new Date(date2);
	return isAfter(d1, d2) || isSameDay(d1, d2);
};
