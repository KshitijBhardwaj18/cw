export const MAX_PER_DIEM_SHIFT_TOTAL_HOURS = 24;

/** Same rules as placement weekly timecard: HH:mm span minus break, overnight adds 24h. */
export function parseTimeToMinutes(t: string): number | null {
	if (!t?.trim()) return null;
	const parts = t.trim().split(":");
	if (parts.length < 2) return null;
	const h = Number(parts[0]);
	const min = Number(parts[1]);
	if (Number.isNaN(h) || Number.isNaN(min)) return null;
	return h * 60 + min;
}

export function computeShiftHours(
	start: string,
	end: string,
	breakMin: number,
): number {
	const s = parseTimeToMinutes(start);
	const e = parseTimeToMinutes(end);
	if (s === null || e === null) return 0;
	let diffMin = e - s;
	if (diffMin < 0) diffMin += 24 * 60;
	const work = diffMin - breakMin;
	return Math.max(0, work / 60);
}
