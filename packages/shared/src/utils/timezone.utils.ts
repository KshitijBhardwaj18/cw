import { TIMEZONE_IANA_MAP } from "../constants/timezone.constants.js";
import type { OrganizationTimezone } from "../enums/msp.enum.js";

export function zonedToUtc(
	date: string,
	time: string,
	orgTimezone: OrganizationTimezone,
): Date {
	const ianaZone = TIMEZONE_IANA_MAP[orgTimezone];

	const naive = new Date(`${date}T${time}:00.000Z`);

	const fmt = new Intl.DateTimeFormat("en-US", {
		timeZone: ianaZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hourCycle: "h23",
	});

	const parts = Object.fromEntries(
		fmt.formatToParts(naive).map((p) => [p.type, p.value]),
	);

	const localAtNaive = new Date(
		`${parts.year ?? "0000"}-${parts.month ?? "01"}-${parts.day ?? "01"}T${parts.hour ?? "00"}:${parts.minute ?? "00"}:${parts.second ?? "00"}.000Z`,
	);

	const offsetMs = naive.getTime() - localAtNaive.getTime();

	return new Date(naive.getTime() + offsetMs);
}

export function todayInOrgTimezone(orgTimezone: OrganizationTimezone): string {
	const ianaZone = TIMEZONE_IANA_MAP[orgTimezone];
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: ianaZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(new Date());
}

export function formatInOrgTimezone(
	utcDate: Date | string,
	orgTimezone: OrganizationTimezone,
	options?: Intl.DateTimeFormatOptions,
): string {
	const ianaZone = TIMEZONE_IANA_MAP[orgTimezone];
	return new Date(utcDate).toLocaleString("en-US", {
		timeZone: ianaZone,
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
		...options,
	});
}
