import { parse } from "csv-parse/sync";

export type TimekeepingCsvRow = {
	rowIndex: number;
	workerEmail: string;
	workDate: string;
	clockIn: string;
	clockOut: string;
	breakMinutes: number;
	payCode: string;
	notes: string;
};

function normCol(s: string): string {
	return (s ?? "").trim().toLowerCase().replace(/\s+/g, "_");
}

function findCol(row: Record<string, string>, candidates: string[]): string {
	for (const [key, value] of Object.entries(row)) {
		if (candidates.includes(normCol(key))) return (value ?? "").trim();
	}
	return "";
}

export function parseTimekeepingCsv(buffer: Buffer): TimekeepingCsvRow[] {
	const records = parse(buffer.toString("utf-8"), {
		columns: true,
		skip_empty_lines: true,
		trim: true,
		bom: true,
		relax_column_count: true,
	}) as Record<string, string>[];

	const rows: TimekeepingCsvRow[] = [];

	for (let i = 0; i < records.length; i++) {
		const row = records[i] ?? {};

		const workerEmail = findCol(row, [
			"worker_email",
			"email",
			"candidate_email",
		]).toLowerCase();
		const workDate = findCol(row, ["work_date", "date", "shift_date"]);
		if (!workerEmail || !workDate) continue;

		rows.push({
			rowIndex: i + 2, // 1-indexed + 1 for header row
			workerEmail,
			workDate,
			clockIn: findCol(row, ["clock_in", "start_time", "time_in"]),
			clockOut: findCol(row, ["clock_out", "end_time", "time_out"]),
			breakMinutes:
				Number.parseInt(
					findCol(row, ["break_minutes", "break", "break_mins"]) || "0",
					10,
				) || 0,
			payCode: findCol(row, ["pay_code", "paycode", "code"]).toUpperCase(),
			notes: findCol(row, ["notes", "note", "comments"]),
		});
	}

	return rows;
}
