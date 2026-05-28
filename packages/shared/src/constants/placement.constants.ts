/**
 * How many days before a placement's endDate it counts as "ending soon".
 */
export const ENDING_SOON_WINDOW_DAYS = 14;

export const ENDING_SOON_WINDOW_MS =
	ENDING_SOON_WINDOW_DAYS * 24 * 60 * 60 * 1000;

/**
 * True iff `endDate` is in the future and within the ending-soon window.
 */
export function isWithinEndingSoonWindow(
	endDate: Date | string | null,
	now: Date = new Date(),
): boolean {
	if (!endDate) return false;
	const end = typeof endDate === "string" ? new Date(endDate) : endDate;
	const remaining = end.getTime() - now.getTime();
	return remaining > 0 && remaining <= ENDING_SOON_WINDOW_MS;
}
