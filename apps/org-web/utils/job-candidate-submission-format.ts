import {
	DEFAULT_TIMEZONE,
	formatTzDateTime,
	type OrganizationTimezone,
} from "@repo/shared";

/**
 * Formats `stageEnteredAt` for job details candidate rows in the user's timezone.
 */
export function formatJobSubmissionStageAt(
	iso: string,
	tz?: OrganizationTimezone,
): string {
	if (!iso) return "—";
	return formatTzDateTime(iso, tz ?? DEFAULT_TIMEZONE);
}

export function candidateInitialsFromName(name: string): string {
	return name
		.split(/\s+/)
		.map((p) => p[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}
