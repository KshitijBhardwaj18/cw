/** Standard 8-4-4-4-12 hex UUID (any version / variant). */
const UUID_REGEX =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Compact display for UUIDs only: first 8 hex chars (no hyphens), uppercased, prefixed with `#`.
 * Non-UUID strings are returned unchanged (human-readable or numeric IDs stay intact).
 * e.g. "550e8400-e29b-41d4-a716-446655440000" → "#550E8400"
 */
export function shortId(id: string): string {
	const t = id.trim();
	if (!t || !UUID_REGEX.test(t)) return id;
	return `#${t.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export const getInitials = (name: string, limit: number = 2) => {
	limit = Math.min(limit, 2);
	return name
		?.split(" ")
		?.map((word) => word.charAt(0).toUpperCase())
		?.join("")
		?.slice(0, limit)
		?.toUpperCase();
};

export const enumToText = (enumValue?: string): string => {
	if (!enumValue) return "";
	const values = enumValue.split("_");
	return values.join(" ");
};

export const enumToTitleText = (enumValue?: string): string => {
	if (!enumValue) return "";
	const values = enumValue.split("_");
	return values
		.map(
			(value) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
		)
		.join(" ");
};

/** Portal default: US dollars, US number formatting. */
export const USD_LOCALE = "en-US" as const;
export const USD_CURRENCY_CODE = "USD" as const;

export function formatCurrency(
	amount: number,
	currency: string = USD_CURRENCY_CODE,
	region: string = USD_LOCALE,
	minimumFractionDigits: number = 0,
	maximumFractionDigits: number = 1,
): string {
	return new Intl.NumberFormat(region, {
		style: "currency",
		currency: currency,
		minimumFractionDigits: minimumFractionDigits,
		maximumFractionDigits: maximumFractionDigits,
	}).format(amount);
}

/** Invoice / ledger-style amounts with cents. */
export function formatUsdLedger(amount: number): string {
	return formatCurrency(amount, USD_CURRENCY_CODE, USD_LOCALE, 2, 2);
}

/** Ledger-style USD; null/NaN shown as $0.00 (billing tables, disputes). */
export function formatUsdLedgerNullable(
	amount: number | null | undefined,
): string {
	if (amount == null || Number.isNaN(amount)) return formatUsdLedger(0);
	return formatUsdLedger(amount);
}

/** Whole-dollar USD (commas, no cents) — incentives, summaries. */
export function formatUsdWhole(amount: number): string {
	return formatCurrency(amount, USD_CURRENCY_CODE, USD_LOCALE, 0, 0);
}

/**
 * Parses typed currency/number text into a finite number.
 * Strips `$`, commas, and spaces; supports optional leading `-` and one decimal point.
 */
export function parseUsdNumberInput(raw: string): number | null {
	const t = raw.trim();
	if (t === "" || t === "-" || t === "$" || t === "-$") return null;
	const normalized = t.replace(/[$,\s]/g, "");
	if (normalized === "" || normalized === "-" || normalized === ".")
		return null;
	if (!/^-?\d*\.?\d*$/.test(normalized)) return null;
	const n = Number(normalized);
	return Number.isFinite(n) ? n : null;
}

/**
 * Hourly bill or pay rate, e.g. `$120.00/hr`.
 * Use `{ round: true, fractionDigits: 0 }` for whole-dollar rates.
 */
export function formatUsdPerHour(
	rate: number | null | undefined,
	options?: { fractionDigits?: number; round?: boolean },
): string {
	if (rate == null || Number.isNaN(rate)) return "—";
	let r = rate;
	if (options?.round) {
		r = Math.round(r);
	}
	const fd = options?.fractionDigits ?? 2;
	return `${formatCurrency(r, USD_CURRENCY_CODE, USD_LOCALE, fd, fd)}/hr`;
}

/** Chart Y-axis: `$1.2M`, `$250K`, or full USD for smaller values. */
export function formatUsdAxisTick(value: number): string {
	if (value >= 1_000_000) {
		return `$${(value / 1_000_000).toFixed(1)}M`;
	}
	if (value >= 1000) {
		return `$${Math.round(value / 1000)}K`;
	}
	return formatCurrency(value, USD_CURRENCY_CODE, USD_LOCALE, 0, 0);
}

export const deepTrim = (obj: unknown): unknown => {
	if (typeof obj === "string") {
		return obj.trim();
	} else if (Array.isArray(obj)) {
		return obj.map(deepTrim);
	} else if (typeof obj === "object" && obj !== null) {
		return Object.fromEntries(
			Object.entries(obj).map(([key, value]) => [key, deepTrim(value)]),
		);
	}
	return obj;
};

export const linkify = (input: string) => {
	const combinedRegex =
		/(\bhttps?:\/\/[^\s<\]]+|\bwww\.[^\s<\]]+|\b[\w.%+-]+@[a-z0-9.-]+\.[a-z]{2,}|\b[a-z0-9-]+\.(com|net|org|co\.in|in|io|dev|ai|app|me|xyz|info|edu|gov|us|uk)\b)/gi;

	return input.replace(combinedRegex, (match) => {
		if (/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(match)) {
			return `<a href="mailto:${match}" class="text-blue-500 underline">${match}</a>`;
		}

		if (/^https?:\/\//.test(match)) {
			return `<a href="${match}" class="text-blue-500 underline" target="_blank" rel="noopener noreferrer">${match}</a>`;
		}

		if (/^www\./.test(match)) {
			return `<a href="http://${match}" class="text-blue-500 underline" target="_blank" rel="noopener noreferrer">${match}</a>`;
		}

		return `<a href="http://${match}" class="text-blue-500 underline" target="_blank" rel="noopener noreferrer">${match}</a>`;
	});
};
