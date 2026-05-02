export const BILLING_FREQUENCIES = ["weekly", "bi_weekly", "monthly"] as const;

export const BILLING_CYCLE_START_DAYS = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
] as const;

export const INVOICE_GROUPING_METHODS = [
	"By Candidate",
	"By Requisition",
	"By Department",
	"By Location",
] as const;

export const BILLING_CURRENCIES = ["USD", "CAD", "EUR"] as const;

export const PAYMENT_TERMS = ["net_15", "net_30", "net_45", "custom"] as const;

type BillingFrequency = (typeof BILLING_FREQUENCIES)[number];

function startOfUtcDay(value: Date): Date {
	return new Date(
		Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
	);
}

function addUtcDays(value: Date, days: number): Date {
	const next = new Date(value);
	next.setUTCDate(next.getUTCDate() + days);
	return next;
}

function weekdayFromCycleStartDay(
	cycleStartDay: string | null | undefined,
): number {
	switch (cycleStartDay) {
		case "Monday":
			return 1;
		case "Tuesday":
			return 2;
		case "Wednesday":
			return 3;
		case "Thursday":
			return 4;
		case "Friday":
			return 5;
		case "Saturday":
			return 6;
		case "Sunday":
			return 0;
		default:
			return 1;
	}
}

function normalizeBillingFrequency(
	billingFrequency: string | null | undefined,
): BillingFrequency {
	return BILLING_FREQUENCIES.includes(billingFrequency as BillingFrequency)
		? (billingFrequency as BillingFrequency)
		: "monthly";
}

function alignToCurrentCycleStart(date: Date, weekday: number): Date {
	const day = startOfUtcDay(date);
	const diff = (day.getUTCDay() - weekday + 7) % 7;
	return addUtcDays(day, -diff);
}

function monthlyLatestClosedPeriod(referenceDate: Date) {
	const day = startOfUtcDay(referenceDate);
	const periodEnd = addUtcDays(
		new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), 1)),
		-1,
	);
	const periodFrom = new Date(
		Date.UTC(periodEnd.getUTCFullYear(), periodEnd.getUTCMonth(), 1),
	);
	return { periodFrom, periodTo: periodEnd };
}

export function computeLatestClosedBillingPeriod(input: {
	billingFrequency: string | null | undefined;
	cycleStartDay: string | null | undefined;
	referenceDate: Date;
}): { periodFrom: Date; periodTo: Date } {
	const frequency = normalizeBillingFrequency(input.billingFrequency);
	if (frequency === "monthly") {
		return monthlyLatestClosedPeriod(input.referenceDate);
	}

	const weekday = weekdayFromCycleStartDay(input.cycleStartDay);
	const currentCycleStart = alignToCurrentCycleStart(
		input.referenceDate,
		weekday,
	);
	const cycleDays = frequency === "bi_weekly" ? 14 : 7;
	const periodTo = addUtcDays(currentCycleStart, -1);
	const periodFrom = addUtcDays(periodTo, -(cycleDays - 1));
	return { periodFrom, periodTo };
}

export function computeNextBillingRunAt(input: {
	billingFrequency: string | null | undefined;
	cycleStartDay: string | null | undefined;
	fromDate?: Date;
}): Date {
	const frequency = normalizeBillingFrequency(input.billingFrequency);
	const now = input.fromDate ?? new Date();
	const day = startOfUtcDay(now);

	if (frequency === "monthly") {
		const firstOfNextMonth = new Date(
			Date.UTC(day.getUTCFullYear(), day.getUTCMonth() + 1, 1, 0, 5, 0),
		);
		return firstOfNextMonth;
	}

	const weekday = weekdayFromCycleStartDay(input.cycleStartDay);
	const currentCycleStart = alignToCurrentCycleStart(now, weekday);
	const cycleDays = frequency === "bi_weekly" ? 14 : 7;
	let nextRun = addUtcDays(currentCycleStart, cycleDays);
	nextRun = new Date(
		Date.UTC(
			nextRun.getUTCFullYear(),
			nextRun.getUTCMonth(),
			nextRun.getUTCDate(),
			0,
			5,
			0,
		),
	);
	if (nextRun.getTime() <= now.getTime()) {
		nextRun = addUtcDays(nextRun, cycleDays);
	}
	return nextRun;
}

export function toIsoDateOnlyUtc(value: Date): string {
	return value.toISOString().slice(0, 10);
}

export function monthlyCronPatternFromUtcDate(date: Date): string {
	const minute = date.getUTCMinutes();
	const hour = date.getUTCHours();
	const dayOfMonth = date.getUTCDate();
	return `${minute} ${hour} ${dayOfMonth} * *`;
}

export function parseIsoDateOnly(value: string): Date | null {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}
