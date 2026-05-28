/**
 * Prefer `fmtCalendarDate` when `raw` is a DATE stored as UTC‑midnight ISO
 * (`YYYY-MM-DD…` prefix). Otherwise delegate to `fmtShortDate`.
 */
export function formatVendorPlacementCalendarDay(
	raw: string | null | undefined,
	fmtCalendarDate: (
		yyyymmdd: string | null | undefined,
		pattern?: "long" | "short",
	) => string,
	fmtShortDate: (iso: string | Date | null | undefined) => string,
): string {
	const s = String(raw ?? "").trim();
	if (!s) return "—";
	const ymd = /^(\d{4}-\d{2}-\d{2})(?:T|$)/.exec(s)?.[1];
	if (ymd) return fmtCalendarDate(ymd);
	return fmtShortDate(s);
}
