import type { MemberRole } from "@repo/shared";

export type UserStatus = "Active" | "Invited" | "Inactive";

export interface User {
	id: string;
	userId: string;
	firstName: string;
	lastName: string;
	email: string;
	title?: string | null;
	role: MemberRole;
	departments: string[] | "ALL";
	departmentIds: string[];
	status: UserStatus;
	lastActive: string | null;
}
