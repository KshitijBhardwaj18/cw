const DATE_FMT = new Intl.DateTimeFormat("en-US", {
	month: "long",
	day: "numeric",
	year: "numeric",
	timeZone: "UTC",
});

const DAY_FMT = new Intl.DateTimeFormat("en-US", {
	weekday: "long",
	timeZone: "UTC",
});

export function fmtDate(iso: string | null | undefined): string {
	if (!iso) return "";
	try {
		return DATE_FMT.format(new Date(iso));
	} catch {
		return iso ?? "";
	}
}

export function fmtDayOfWeek(iso: string | null | undefined): string {
	if (!iso) return "";
	try {
		return DAY_FMT.format(new Date(iso));
	} catch {
		return "";
	}
}

const CURRENCY_FMT = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	minimumFractionDigits: 2,
});

export function fmtCurrency(amount: number | null | undefined): string {
	if (amount == null) return "$0.00";
	return CURRENCY_FMT.format(amount);
}

const SHORT_DATE_FMT = new Intl.DateTimeFormat("en-US", {
	month: "short",
	day: "numeric",
	year: "numeric",
	timeZone: "UTC",
});

export function fmtShortDate(iso: string | null | undefined): string {
	if (!iso) return "";
	try {
		return SHORT_DATE_FMT.format(new Date(iso));
	} catch {
		return iso;
	}
}

export function fmtPeriod(
	start: string | null | undefined,
	end: string | null | undefined,
): string {
	if (!start && !end) return "—";
	if (start && !end) return fmtShortDate(start);
	if (!start && end) return fmtShortDate(end);
	return `${fmtShortDate(start)} – ${fmtShortDate(end)}`;
}
