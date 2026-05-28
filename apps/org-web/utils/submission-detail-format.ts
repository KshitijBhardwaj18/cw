import { formatUsdPerHour } from "@repo/shared";

export function formatBillRateDisplay(rate: number | null | undefined): string {
	return formatUsdPerHour(rate, { round: true, fractionDigits: 0 });
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
