import { parse } from "csv-parse/sync";
import type { BulkEnrollUserPayload } from "../processors/types.js";

function norm(s: string): string {
	return (s ?? "").trim().toLowerCase();
}

export function parseBulkEnrollmentCsv(
	buffer: Buffer,
): BulkEnrollUserPayload[] {
	const text = buffer.toString("utf-8");
	const records = parse(text, {
		columns: true,
		skip_empty_lines: true,
		trim: true,
		bom: true,
		relax_column_count: true,
	}) as Record<string, string>[];

	const users: BulkEnrollUserPayload[] = [];

	for (const row of records) {
		const get = (header: string): string => {
			const normalized = norm(header);
			for (const [key, value] of Object.entries(row)) {
				if (norm(key) === normalized) return (value ?? "").trim();
			}
			return "";
		};

		const email = get("Email");
		if (!email) continue;

		users.push({
			firstName: get("First Name"),
			lastName: get("Last Name"),
			title: get("Job Title"),
			email,
			officePhone: get("Office Phone") || undefined,
			phoneNumber: get("Mobile Phone") || undefined,
			role: get("Organization Role") || "OPERATIONS",
		});
	}

	return users;
}
