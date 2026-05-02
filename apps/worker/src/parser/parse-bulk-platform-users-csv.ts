import { parse } from "csv-parse/sync";
import type { BulkPlatformUserRow } from "../processors/types.js";

function norm(s: string): string {
	return (s ?? "").trim().toLowerCase();
}

function get(row: Record<string, string>, header: string): string {
	const normalized = norm(header);
	for (const [key, value] of Object.entries(row)) {
		if (norm(key) === normalized) return (value ?? "").trim();
	}
	return "";
}

export function parseBulkPlatformUsersCsv(
	buffer: Buffer,
): BulkPlatformUserRow[] {
	const text = buffer.toString("utf-8");
	const records = parse(text, {
		columns: true,
		skip_empty_lines: true,
		trim: true,
		bom: true,
		relax_column_count: true,
	}) as Record<string, string>[];

	const rows: BulkPlatformUserRow[] = [];

	for (const row of records) {
		const email = get(row, "Email");
		if (!email) continue;

		rows.push({
			firstName: get(row, "First Name"),
			lastName: get(row, "Last Name"),
			title: get(row, "Job Title"),
			email,
			officePhone: get(row, "Office Phone") || undefined,
			phoneNumber: get(row, "Mobile Phone") || undefined,
			role: get(row, "Role"),
			status: get(row, "Status"),
		});
	}

	return rows;
}
