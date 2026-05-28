import { format, parse } from "date-fns";
import type { TimeEntryRow } from "@/types/time-entry";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/** Local calendar date as `yyyy-MM-dd` (no UTC shift). */
export function formatLocalDateToIso(d: Date): string {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Monday–Sunday labels for the pay week that ends on `weekEndingIso` (Sunday `yyyy-MM-dd`).
 */
export function getWeekDayLabelsForWeekEnding(weekEndingIso: string): string[] {
	const [y, m, d] = weekEndingIso.split("-").map(Number);
	if (!y || !m || !d) return [];
	const end = new Date(y, m - 1, d);
	const start = new Date(end);
	start.setDate(end.getDate() - 6);
	const days: string[] = [];
	for (let i = 0; i < 7; i++) {
		const dt = new Date(start);
		dt.setDate(start.getDate() + i);
		const iso = formatLocalDateToIso(dt);
		days.push(`${iso} (${DOW[dt.getDay()]})`);
	}
	return days;
}

/** Inclusive pay week bounds from week-ending Sunday `yyyy-MM-dd`. */
export function getPayWeekRangeIso(weekEndingIso: string): {
	start: string;
	end: string;
} {
	const [y, m, d] = weekEndingIso.split("-").map(Number);
	if (!y || !m || !d) return { start: "", end: "" };
	const end = new Date(y, m - 1, d);
	const start = new Date(end);
	start.setDate(end.getDate() - 6);
	return { start: formatLocalDateToIso(start), end: formatLocalDateToIso(end) };
}

/**
 */
export function normalizeTimeForInput(raw: string): string {
	const t = String(raw ?? "").trim();
	if (!t) return "";
	const m = /^(\d{1,2}):(\d{2})(?::\d{2}(?:\.\d+)?)?/.exec(t);
	if (!m) return t;
	const h = Number(m[1]);
	const min = Number(m[2]);
	if (Number.isNaN(h) || Number.isNaN(min)) return t;
	return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

/**
 * Normalize API/DB clock strings (12h `07:00 AM` or 24h) to `HH:mm` for {@link TimePicker}.
 */
export function clockStringToHHmmForPicker(raw: string): string {
	const t = String(raw ?? "").trim();
	if (!t || t === "—") return "";
	const m12 = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
	if (m12) {
		let h = Number(m12[1]);
		const min = Number(m12[2]);
		const ap = m12[3].toUpperCase();
		if (ap === "PM" && h !== 12) h += 12;
		if (ap === "AM" && h === 12) h = 0;
		return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
	}
	return normalizeTimeForInput(t);
}

/**
 * Shift clock-in/out strings from APIs: plain `HH:mm` / `HH:mm:ss`,
 * or legacy ISO datetimes whose wall-clock (`T`/` ` + time) should be shown
 * without calendar timezone shifting.
 */
export function formatVendorShiftBoundaryTime(raw: string): string {
	const s = String(raw ?? "").trim();
	if (!s || s === "—") return "—";
	if (s === "TBD") return "TBD";
	const m = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})/.exec(s);
	if (m) return formatHHmmForDisplay(`${m[2]}:${m[3]}`);
	return formatHHmmForDisplay(normalizeTimeForInput(s));
}

/** Format `HH:mm` for tables (matches TimePicker trigger: `h:mm a`). */
export function formatHHmmForDisplay(raw: string): string {
	const t = String(raw ?? "").trim();
	if (!t || t === "—") return "—";
	if (/\b(AM|PM)\b/i.test(t)) return t;
	const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(t);
	if (!m) return t;
	try {
		const d = parse(`${m[1]}:${m[2]}`, "HH:mm", new Date());
		return format(d, "h:mm a");
	} catch {
		return t;
	}
}

export function parseTimeStringToMinutes(t: string): number | null {
	if (!t?.trim()) return null;
	const m = /^(\d{1,2}):(\d{2})(?::\d{2}(?:\.\d+)?)?/.exec(t.trim());
	if (!m) return null;
	const h = Number(m[1]);
	const min = Number(m[2]);
	if (Number.isNaN(h) || Number.isNaN(min)) return null;
	return h * 60 + min;
}

/**
 * Hours between start/end (`HH:mm`), minus break minutes. Overnight shifts
 * (end before start) add 24h to the span.
 */
export function computeShiftHours(
	start: string,
	end: string,
	breakMin: number,
): number {
	const s = parseTimeStringToMinutes(start);
	const e = parseTimeStringToMinutes(end);
	if (s === null || e === null) return 0;
	let diffMin = e - s;
	if (diffMin < 0) diffMin += 24 * 60;
	const work = diffMin - breakMin;
	return Math.max(0, work / 60);
}

export function getTimeEntryRowAriaLabel(row: TimeEntryRow): string {
	if (row.isOvertime) {
		return row.workDate ? `Overtime on ${row.workDate}` : "Overtime date";
	}
	return row.weekLabel ?? "Day";
}

export function createEmptyWeekRows(labels: string[]): TimeEntryRow[] {
	return labels.map((weekLabel, i) => ({
		id: `week-${i}`,
		isOvertime: false,
		weekLabel,
		start: "",
		end: "",
		breakMin: "30",
	}));
}
