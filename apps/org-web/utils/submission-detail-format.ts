/** YYYY-MM-DD for employment-style fields (matches design spec). */
export function formatIsoDateOnly(iso: string | null | undefined): string {
	if (!iso || iso === "—") {
		return "—";
	}
	try {
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) {
			return "—";
		}
		const y = d.getUTCFullYear();
		const m = String(d.getUTCMonth() + 1).padStart(2, "0");
		const day = String(d.getUTCDate()).padStart(2, "0");
		return `${y}-${m}-${day}`;
	} catch {
		return "—";
	}
}

export function formatSubmissionDetailDate(
	iso: string | null | undefined,
): string {
	if (!iso || iso === "—") {
		return "—";
	}
	try {
		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		}).format(new Date(iso));
	} catch {
		return iso;
	}
}

export function formatBillRateDisplay(rate: number | null | undefined): string {
	if (rate == null) {
		return "—";
	}
	return `$${Math.round(rate)}/hr`;
}

export function formatShiftTypeLabel(raw: string | null | undefined): string {
	if (!raw) {
		return "—";
	}
	return raw.replaceAll("_", " ");
}

/** Title-style label e.g. `NIGHTS` → `Nights`, `ON_CALL` → `On call`. */
export function formatShiftTypeHuman(raw: string | null | undefined): string {
	if (!raw) {
		return "—";
	}
	return raw
		.toLowerCase()
		.split("_")
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");
}

export function formatHoursPerWeek(value: number | null | undefined): string {
	if (value == null) {
		return "—";
	}
	return `${value} hours`;
}

export function formatScheduleFromTimes(
	startTime: string | null | undefined,
	endTime: string | null | undefined,
	shiftsPerWeek: number | null | undefined,
): string {
	if (startTime && endTime) {
		const base = `${startTime} – ${endTime}`;
		if (shiftsPerWeek != null) {
			return `${base} · ${shiftsPerWeek} shifts/wk`;
		}
		return base;
	}
	if (shiftsPerWeek != null) {
		return `${shiftsPerWeek} shifts per week`;
	}
	return "—";
}
