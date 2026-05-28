import { TIMEZONE_IANA_MAP } from "../constants/timezone.constants.js";
import type { OrganizationTimezone } from "../enums/msp.enum.js";
import { coerceYmdOrIsoToUtcInstant } from "./utc-date.utils.js";

const PLACEHOLDER = "—";

function safeDate(value: Date | string | null | undefined): Date | null {
	if (!value) return null;
	const d = new Date(value);
	return Number.isNaN(d.getTime()) ? null : d;
}

/** Calendar Y/M/D for `d` in `ianaZone` (for same-day / same-year checks). */
function calendarYmdInZone(
	d: Date,
	ianaZone: string,
): { y: number; m: number; day: number } {
	const fmt = new Intl.DateTimeFormat("en-US", {
		timeZone: ianaZone,
		year: "numeric",
		month: "numeric",
		day: "numeric",
	});
	const parts = Object.fromEntries(
		fmt.formatToParts(d).map((p) => [p.type, p.value]),
	);
	return {
		y: Number(parts.year),
		m: Number(parts.month),
		day: Number(parts.day),
	};
}

/**
 * Like shared `formatDateRange` but uses the user's timezone for calendar
 * comparison and labels (e.g. "Jan 13 - Jan 19, 2026").
 */
export function formatTzDateRange(
	startStr: string | Date | null | undefined,
	endStr: string | Date | null | undefined,
	tz: OrganizationTimezone,
): string {
	const s = safeDate(startStr);
	const e = safeDate(endStr);
	if (!s || !e) return "";

	const iana = TIMEZONE_IANA_MAP[tz];
	const ymdS = calendarYmdInZone(s, iana);
	const ymdE = calendarYmdInZone(e, iana);
	const sameDay =
		ymdS.y === ymdE.y && ymdS.m === ymdE.m && ymdS.day === ymdE.day;
	if (sameDay) {
		return formatTzShortDate(s, tz);
	}

	const sameYear = ymdS.y === ymdE.y;
	if (sameYear) {
		const startLabel = s.toLocaleString("en-US", {
			timeZone: iana,
			month: "short",
			day: "numeric",
		});
		const endLabel = e.toLocaleString("en-US", {
			timeZone: iana,
			month: "short",
			day: "numeric",
			year: "numeric",
		});
		return `${startLabel} - ${endLabel}`;
	}

	return `${formatTzShortDate(s, tz)} - ${formatTzShortDate(e, tz)}`;
}

export function zonedToUtc(
	date: string,
	time: string,
	orgTimezone: OrganizationTimezone,
): Date {
	const ianaZone = TIMEZONE_IANA_MAP[orgTimezone];

	const naive = new Date(`${date}T${time}:00.000Z`);

	const fmt = new Intl.DateTimeFormat("en-US", {
		timeZone: ianaZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hourCycle: "h23",
	});

	const parts = Object.fromEntries(
		fmt.formatToParts(naive).map((p) => [p.type, p.value]),
	);

	const localAtNaive = new Date(
		`${parts.year ?? "0000"}-${parts.month ?? "01"}-${parts.day ?? "01"}T${parts.hour ?? "00"}:${parts.minute ?? "00"}:${parts.second ?? "00"}.000Z`,
	);

	const offsetMs = naive.getTime() - localAtNaive.getTime();

	return new Date(naive.getTime() + offsetMs);
}

export function todayInOrgTimezone(orgTimezone: OrganizationTimezone): string {
	const ianaZone = TIMEZONE_IANA_MAP[orgTimezone];
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: ianaZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(new Date());
}

export function formatInOrgTimezone(
	utcDate: Date | string,
	orgTimezone: OrganizationTimezone,
	options?: Intl.DateTimeFormatOptions,
): string {
	const ianaZone = TIMEZONE_IANA_MAP[orgTimezone];
	return new Date(utcDate).toLocaleString("en-US", {
		timeZone: ianaZone,
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
		...options,
	});
}

/**
 * Format a UTC timestamp as a long date in the user's timezone.
 * e.g. "May 11, 2026"
 */
export function formatTzDate(
	utcDate: Date | string | null | undefined,
	tz: OrganizationTimezone,
): string {
	const d = safeDate(utcDate);
	if (!d) return PLACEHOLDER;
	return d.toLocaleString("en-US", {
		timeZone: TIMEZONE_IANA_MAP[tz],
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}

/**
 * Format a UTC timestamp as a short date in the user's timezone.
 * e.g. "May 11, 2026"
 */
export function formatTzShortDate(
	utcDate: Date | string | null | undefined,
	tz: OrganizationTimezone,
): string {
	const d = safeDate(utcDate);
	if (!d) return PLACEHOLDER;
	return d.toLocaleString("en-US", {
		timeZone: TIMEZONE_IANA_MAP[tz],
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

/**
 * Format a UTC timestamp as a full datetime in the user's timezone.
 * e.g. "May 11, 2026, 6:31 PM"
 */
export function formatTzDateTime(
	utcDate: Date | string | null | undefined,
	tz: OrganizationTimezone,
): string {
	const d = safeDate(utcDate);
	if (!d) return PLACEHOLDER;
	return d.toLocaleString("en-US", {
		timeZone: TIMEZONE_IANA_MAP[tz],
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}

/**
 * Like {@link formatTzDateTime} but appends a short timezone name (e.g. PDT).
 * e.g. "May 14, 2026, 2:30 PM PDT"
 */
export function formatTzDateTimeWithZone(
	utcDate: Date | string | null | undefined,
	tz: OrganizationTimezone,
): string {
	const d = safeDate(utcDate);
	if (!d) return PLACEHOLDER;
	return d.toLocaleString("en-US", {
		timeZone: TIMEZONE_IANA_MAP[tz],
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
		timeZoneName: "short",
	});
}

/**
 * Format a UTC timestamp as time-only in the user's timezone.
 * e.g. "6:31 PM"
 */
export function formatTzTime(
	utcDate: Date | string | null | undefined,
	tz: OrganizationTimezone,
): string {
	const d = safeDate(utcDate);
	if (!d) return PLACEHOLDER;
	return d.toLocaleString("en-US", {
		timeZone: TIMEZONE_IANA_MAP[tz],
		hour: "numeric",
		minute: "2-digit",
	});
}

/**
 * Format a UTC timestamp as day-of-week in the user's timezone.
 * e.g. "Monday"
 */
export function formatTzDayOfWeek(
	utcDate: Date | string | null | undefined,
	tz: OrganizationTimezone,
): string {
	const d = safeDate(utcDate);
	if (!d) return PLACEHOLDER;
	return d.toLocaleString("en-US", {
		timeZone: TIMEZONE_IANA_MAP[tz],
		weekday: "long",
	});
}

/**
 * Format a date range using the user's timezone.
 * e.g. "May 11 – May 18, 2026"
 */
export function formatTzPeriod(
	start: Date | string | null | undefined,
	end: Date | string | null | undefined,
	tz: OrganizationTimezone,
): string {
	const s = safeDate(start);
	const e = safeDate(end);
	if (!s && !e) return PLACEHOLDER;

	const ianaZone = TIMEZONE_IANA_MAP[tz];
	const shortOpts: Intl.DateTimeFormatOptions = {
		timeZone: ianaZone,
		month: "short",
		day: "numeric",
		year: "numeric",
	};

	if (s && !e) return s.toLocaleString("en-US", shortOpts);
	if (!s && e) return e.toLocaleString("en-US", shortOpts);

	const startStr = (s as Date).toLocaleString("en-US", {
		timeZone: ianaZone,
		month: "short",
		day: "numeric",
	});
	const endStr = (e as Date).toLocaleString("en-US", shortOpts);
	return `${startStr} – ${endStr}`;
}

/**
 * Format a calendar-date-only string (YYYY-MM-DD) for display.
 * No timezone conversion — the value is already a local calendar date.
 * e.g. "2026-05-11" → "May 11, 2026"
 */
export function formatCalendarDate(
	yyyymmdd: string | null | undefined,
	pattern: "long" | "short" = "short",
): string {
	if (!yyyymmdd) return PLACEHOLDER;
	const [year, month, day] = yyyymmdd.split("-").map(Number);
	if (!year || !month || !day) return PLACEHOLDER;
	const d = new Date(Date.UTC(year, month - 1, day));
	return d.toLocaleString("en-US", {
		timeZone: "UTC",
		month: pattern,
		day: "numeric",
		year: "numeric",
	});
}

/**
 * Formats API date strings (ISO instant or YYYY-MM-DD) in the user's timezone.
 * Calendar-only values use {@link formatCalendarDate}; instants use {@link formatTzShortDate}.
 */
export function formatTzApiDate(
	raw: string | null | undefined,
	tz: OrganizationTimezone,
): string {
	if (!raw || raw === PLACEHOLDER) return PLACEHOLDER;
	const trimmed = raw.trim();
	if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
		const label = formatCalendarDate(trimmed);
		return label === PLACEHOLDER ? trimmed : label;
	}
	const instant = coerceYmdOrIsoToUtcInstant(raw);
	return instant ? formatTzShortDate(instant, tz) : raw;
}

/**
 * Formats API datetime strings (ISO instant) in the user's timezone.
 */
export function formatTzApiDateTime(
	raw: string | null | undefined,
	tz: OrganizationTimezone,
): string {
	if (!raw || raw === PLACEHOLDER) return PLACEHOLDER;
	const instant = coerceYmdOrIsoToUtcInstant(raw);
	return instant ? formatTzDateTime(instant, tz) : raw;
}
