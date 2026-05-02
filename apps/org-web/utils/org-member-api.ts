import { type MemberRole, splitFullNameToFirstLast } from "@repo/shared";
import { formatDistanceToNow } from "date-fns";
import type { OrgMemberApi } from "@/services/organizations.service";
import type { User, UserStatus } from "@/types/user";

export function mapOrgMemberToUser(row: OrgMemberApi): User {
	const { firstName, lastName } = splitFullNameToFirstLast(row.user.name);

	let status: UserStatus = "Active";
	if (row.status === "INACTIVE") status = "Inactive";
	else if (!row.user.emailVerified) status = "Invited";

	const links = row.user.departmentUsers ?? [];
	const departmentIds = links.map((l) => l.departmentId);
	const departments: string[] | "ALL" =
		departmentIds.length === 0 ? "ALL" : links.map((l) => l.department.name);

	const roleFormatted = row.role
		.toLowerCase()
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");

	return {
		id: row.id,
		userId: row.userId,
		firstName,
		lastName,
		email: row.user.email,
		title: row.user.title ?? null,
		role: roleFormatted as MemberRole,
		departments,
		departmentIds,
		status,
		lastActive:
			status === "Invited"
				? "Never"
				: formatDistanceToNow(new Date(row.user.createdAt), {
						addSuffix: true,
					}),
	};
}
