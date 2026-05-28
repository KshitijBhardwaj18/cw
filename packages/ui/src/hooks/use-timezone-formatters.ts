"use client";

import {
	DEFAULT_TIMEZONE,
	formatCalendarDate,
	formatTzDate,
	formatTzDateRange,
	formatTzDateTime,
	formatTzDateTimeWithZone,
	formatTzDayOfWeek,
	formatTzPeriod,
	formatTzShortDate,
	formatTzTime,
	type OrganizationTimezone,
	TIMEZONE_IANA_MAP,
} from "@repo/shared";
import { useMemo } from "react";

/**
 * Returns timezone-aware formatting helpers bound to the given timezone value.
 * All returned functions convert UTC timestamps to the supplied timezone.
 *
 * Prefer the app-specific `useUserTimezone()` wrapper (which reads `tz` from
 * the auth context) over calling this hook directly at component level.
 */
export function useTimezoneFormatters(
	tz: OrganizationTimezone = DEFAULT_TIMEZONE,
) {
	return useMemo(
		() => ({
			/** The OrganizationTimezone enum value */
			tz,
			/** IANA timezone string, e.g. "America/New_York" */
			ianaZone: TIMEZONE_IANA_MAP[tz],
			/** "May 11, 2026" */
			fmtDate: (iso: string | Date | null | undefined) => formatTzDate(iso, tz),
			/** "May 11, 2026" (abbreviated month) */
			fmtShortDate: (iso: string | Date | null | undefined) =>
				formatTzShortDate(iso, tz),
			/** "May 11, 2026, 6:31 PM" */
			fmtDateTime: (iso: string | Date | null | undefined) =>
				formatTzDateTime(iso, tz),
			/** "May 11, 2026, 6:31 PM PDT" */
			fmtDateTimeZone: (iso: string | Date | null | undefined) =>
				formatTzDateTimeWithZone(iso, tz),
			/** "6:31 PM" */
			fmtTime: (iso: string | Date | null | undefined) => formatTzTime(iso, tz),
			/** "Monday" */
			fmtDayOfWeek: (iso: string | Date | null | undefined) =>
				formatTzDayOfWeek(iso, tz),
			/** "Jan 13 - Jan 19, 2026" (calendar-aware in user TZ) */
			fmtDateRange: (
				start: string | Date | null | undefined,
				end: string | Date | null | undefined,
			) => formatTzDateRange(start, end, tz),
			/** "May 11 – May 18, 2026" */
			fmtPeriod: (
				start: string | Date | null | undefined,
				end: string | Date | null | undefined,
			) => formatTzPeriod(start, end, tz),
			/** "May 11, 2026" (No TZ shift, assumes YYYY-MM-DD) */
			fmtCalendarDate: (
				yyyymmdd: string | null | undefined,
				pattern: "long" | "short" = "short",
			) => formatCalendarDate(yyyymmdd, pattern),
		}),
		[tz],
	);
}
