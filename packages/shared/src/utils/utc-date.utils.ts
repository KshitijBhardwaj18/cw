const UTC = "UTC";

function safeDate(value: Date | string | null | undefined): Date | null {
	if (value == null || value === "") return null;
	if (typeof value === "string" && value.trim() === "—") return null;
	const d = new Date(value);
	return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * For timezone-aware display: plain `YYYY-MM-DD` → UTC-midnight instant; ISO datetimes pass through.
 * Returns `null` if empty or unparsable.
 */
export function coerceYmdOrIsoToUtcInstant(
	raw: string | null | undefined,
): string | null {
	if (raw == null) return null;
	const t = raw.trim();
	if (!t || t === "—") return null;
	if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return `${t}T00:00:00.000Z`;
	const d = new Date(t);
	return Number.isNaN(d.getTime()) ? null : t;
}

/**
 * Long month in UTC (e.g. "May 11, 2026"). Empty string when input is missing — matches legacy portal fallbacks.
 */
export function formatUtcLongDate(
	iso: string | Date | null | undefined,
): string {
	const d = safeDate(iso);
	if (!d) return "";
	return d.toLocaleString("en-US", {
		timeZone: UTC,
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}

/** Short month in UTC (e.g. "May 11, 2026"). Empty string when input is missing. */
export function formatUtcShortDate(
	iso: string | Date | null | undefined,
): string {
	const d = safeDate(iso);
	if (!d) return "";
	return d.toLocaleString("en-US", {
		timeZone: UTC,
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export function formatUtcDayOfWeek(
	iso: string | Date | null | undefined,
): string {
	const d = safeDate(iso);
	if (!d) return "";
	return d.toLocaleString("en-US", {
		timeZone: UTC,
		weekday: "long",
	});
}

/** Range label in UTC short dates; `"—"` when both ends missing. */
export function formatUtcPeriod(
	start: string | Date | null | undefined,
	end: string | Date | null | undefined,
): string {
	if (!start && !end) return "—";
	if (start && !end) return formatUtcShortDate(start);
	if (!start && end) return formatUtcShortDate(end);
	return `${formatUtcShortDate(start)} – ${formatUtcShortDate(end)}`;
}

/**
 * UTC calendar `yyyy-MM-dd` from an ISO instant (e.g. for date pickers).
 * Returns `"—"` when missing or invalid.
 */
export function formatIsoDateUtc(iso: string | null | undefined): string {
	if (!iso || iso === "—") return "—";
	try {
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) return "—";
		const y = d.getUTCFullYear();
		const m = String(d.getUTCMonth() + 1).padStart(2, "0");
		const day = String(d.getUTCDate()).padStart(2, "0");
		return `${y}-${m}-${day}`;
	} catch {
		return "—";
	}
}

/** `YYYY-MM-DD` slice from UTC instant, or empty string when invalid. */
export function utcInstantToIsoDateString(
	value: string | null | undefined,
): string {
	if (!value) return "";
	try {
		const d = new Date(value);
		if (Number.isNaN(d.getTime())) return "";
		return d.toISOString().slice(0, 10);
	} catch {
		return "";
	}
}
