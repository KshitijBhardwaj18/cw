import { TimesheetEntryStatus } from "@repo/db";
import type { VendorTimekeepingListRow } from "../dto/vendor-timekeeping.dto";

export function mapVendorEntryStatusForPortal(
	status: TimesheetEntryStatus,
): VendorTimekeepingListRow["vendorStatus"] {
	switch (status) {
		case TimesheetEntryStatus.DRAFT:
			return "draft";
		case TimesheetEntryStatus.PENDING:
			return "submitted";
		case TimesheetEntryStatus.APPROVED:
			return "approved";
		case TimesheetEntryStatus.REJECTED:
			return "rejected";
		case TimesheetEntryStatus.DISPUTED:
			return "disputed";
		default:
			return "submitted";
	}
}

/** Parses strings like `07:00 AM` / `7:00 PM` to minutes from midnight. */
function parseTwelveHourClockToMinutes(s: string): number | null {
	const m = s.trim().match(/^(0?[1-9]|1[0-2]):([0-5][0-9])\s*(AM|PM)$/i);
	if (!m) return null;
	let h = Number.parseInt(m[1] ?? "0", 10);
	const min = Number.parseInt(m[2] ?? "0", 10);
	const ap = (m[3] ?? "").toUpperCase();
	if (ap === "PM" && h !== 12) h += 12;
	if (ap === "AM" && h === 12) h = 0;
	return h * 60 + min;
}

/** `HH:mm` 24h (matches shift timecard / TimePicker storage). */
function parseTwentyFourHourClockToMinutes(s: string): number | null {
	const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(s.trim());
	if (!m) return null;
	const h = Number.parseInt(m[1] ?? "0", 10);
	const min = Number.parseInt(m[2] ?? "0", 10);
	if (h > 23) return null;
	return h * 60 + min;
}

/**
 * Minutes from midnight for clock strings from the DB or UI:
 * - `07:00 AM` / `7:00 PM` (legacy)
 * - `07:00` / `19:00` (HH:mm, same as shift timecards)
 */
export function parseClockStringToMinutes(s: string): number | null {
	const t = s.trim();
	if (!t) return null;
	return (
		parseTwelveHourClockToMinutes(t) ?? parseTwentyFourHourClockToMinutes(t)
	);
}

/** Hours between two clock strings (overnight supported). */
export function computeHoursFromClockPair(
	clockIn: string | null | undefined,
	clockOut: string | null | undefined,
): number | undefined {
	if (!clockIn?.trim() || !clockOut?.trim()) return undefined;
	const a = parseClockStringToMinutes(clockIn);
	const b = parseClockStringToMinutes(clockOut);
	if (a === null || b === null) return undefined;
	let diff = b - a;
	if (diff < 0) diff += 24 * 60;
	return Math.round((diff / 60) * 100) / 100;
}
