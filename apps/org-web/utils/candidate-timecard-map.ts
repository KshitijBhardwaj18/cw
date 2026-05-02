import type { CandidateTimecardDetailEntry } from "@/types/candidate-timecard";
import type { TimeEntryRow } from "@/types/time-entry";
import {
	createEmptyWeekRows,
	getWeekDayLabelsForWeekEnding,
} from "@/utils/time-entry";

export function mapDetailEntriesToTimeEntryRows(
	entries: CandidateTimecardDetailEntry[],
	weekEnding: string,
): TimeEntryRow[] {
	const weekLabels = getWeekDayLabelsForWeekEnding(weekEnding);
	const weekDates = weekLabels.map((l) => l.split(" ")[0] ?? "");

	const pool = [...entries].sort(
		(a, b) => a.workDate.localeCompare(b.workDate) || a.id.localeCompare(b.id),
	);

	const rows: TimeEntryRow[] = [];

	for (let i = 0; i < 7; i++) {
		const d = weekDates[i];
		if (!d) continue;
		const idx = pool.findIndex(
			(e) => e.workDate === d && !(e.overtimeHours > 0 && e.regularHours === 0),
		);
		if (idx >= 0) {
			const e = pool[idx];
			if (e) pool.splice(idx, 1);
			rows.push({
				id: `week-${i}`,
				isOvertime: false,
				weekLabel: weekLabels[i],
				start: e?.clockIn ?? "",
				end: e?.clockOut ?? "",
				breakMin: String(e?.breakMinutes ?? 0),
				payCodeId: e?.payCode?.id,
			});
		} else {
			const empty = createEmptyWeekRows([weekLabels[i] ?? ""]);
			const row = empty[0];
			if (row) rows.push({ ...row, id: `week-${i}` });
		}
	}

	for (const e of pool) {
		rows.push({
			id: `ot-${e.id}`,
			isOvertime: true,
			workDate: e.workDate,
			start: e.clockIn ?? "",
			end: e.clockOut ?? "",
			breakMin: String(e.breakMinutes ?? 0),
			payCodeId: e.payCode?.id,
		});
	}

	return rows;
}
