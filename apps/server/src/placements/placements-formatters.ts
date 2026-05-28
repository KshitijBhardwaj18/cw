import { EmploymentType, OrganizationTimezone } from "@repo/db";
import { TIMEZONE_IANA_MAP } from "@repo/shared";

export function formatUsdPerHour(
	value: number | null | undefined,
): string | null {
	if (value == null || Number.isNaN(value)) return null;
	return `$${value.toFixed(2)}/hr`;
}

export function formatLongDate(d: Date | null | undefined): string {
	if (!d) return "—";
	return d.toISOString();
}

export function formatShortDate(d: Date | null | undefined): string {
	if (!d) return "—";
	return d.toISOString();
}

/**
 * Short calendar-style label in the organization's timezone (for API-built prose).
 */
export function formatShortDateInOrgTz(
	d: Date | null | undefined,
	orgTimezone: OrganizationTimezone,
): string {
	if (!d) return "—";
	const iana = TIMEZONE_IANA_MAP[orgTimezone];
	return d.toLocaleString("en-US", {
		timeZone: iana,
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export function formatTimeEt(d: Date): string {
	return d.toISOString();
}

export function employmentTypeLabel(
	t: EmploymentType | null | undefined,
): string {
	if (!t) return "—";
	const map: Record<EmploymentType, string> = {
		[EmploymentType.CONTRACT]: "Contract",
		[EmploymentType.PERMANENT]: "Permanent",
		[EmploymentType.PER_DIEM]: "Per Diem",
	};
	return map[t] ?? t;
}

export function sourceTypeFromSubmission(
	vendorId: string | null | undefined,
): string {
	return vendorId ? "Agency" : "Candidate";
}
