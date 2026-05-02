import { EmploymentType } from "@repo/db";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";

export function formatUsdPerHour(
	value: number | null | undefined,
): string | null {
	if (value == null || Number.isNaN(value)) return null;
	return `$${value.toFixed(2)}/hr`;
}

export function formatLongDate(d: Date | null | undefined): string {
	if (!d) return "—";
	return format(d, "MMMM d, yyyy", { locale: enUS });
}

export function formatShortDate(d: Date | null | undefined): string {
	if (!d) return "—";
	return format(d, "MMM d, yyyy", { locale: enUS });
}

export function formatTimeEt(d: Date): string {
	return format(d, "h:mm a zzz", { locale: enUS });
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
