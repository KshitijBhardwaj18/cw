import type { MemberRole } from "@repo/shared";

/** Row shape for client-side CSV preview tables (bulk upload). */
export interface ParsedUser {
	row: number;
	firstName: string;
	lastName: string;
	email: string;
	role: MemberRole;
	departments: string;
	status: "Valid" | "Error";
}
