import { MemberRole, UserRole } from "../enums/users.enum";

export function isAdminPortalRole(role: string | undefined | null): boolean {
	if (!role) return false;
	switch (role.toUpperCase()) {
		case UserRole.SUPER_ADMIN.toUpperCase():
		case UserRole.GENERAL_ADMIN.toUpperCase():
		case UserRole.OPERATIONS_MANAGER.toUpperCase():
		case UserRole.PROGRAM_MANAGER.toUpperCase():
		case UserRole.TECHNICAL_MANAGER.toUpperCase():
		case UserRole.PROGRAM_VENDOR_MANAGER.toUpperCase():
		case UserRole.COMPLIANCE_MANAGER.toUpperCase():
			return true;
		default:
			return false;
	}
}

import { getLabel } from "./option.utils";
import { enumToTitleText } from "./string.utils";

export const ORG_PORTAL_MEMBER_ROLE_OPTIONS = [
	{
		value: MemberRole.EXECUTIVE,
		label: enumToTitleText(MemberRole.EXECUTIVE),
	},
	{
		value: MemberRole.HIRING_MANAGER,
		label: enumToTitleText(MemberRole.HIRING_MANAGER),
	},
	{
		value: MemberRole.OPERATIONS,
		label: enumToTitleText(MemberRole.OPERATIONS),
	},
] as const satisfies ReadonlyArray<{ value: MemberRole; label: string }>;

export function getOrgPortalMemberRoleLabel(role: string): string {
	return getLabel(ORG_PORTAL_MEMBER_ROLE_OPTIONS, role);
}

export function splitFullNameToFirstLast(name: string): {
	firstName: string;
	lastName: string;
} {
	const trimmed = name.trim();
	const i = trimmed.indexOf(" ");
	if (i === -1) return { firstName: trimmed, lastName: "" };
	return {
		firstName: trimmed.slice(0, i),
		lastName: trimmed.slice(i + 1).trim(),
	};
}

/**
 * Maps User.role to display label for "User Type" (Organization vs Program vs Vendor).
 * Aligns with buildOrgMembersFilter in organizations.service.
 */
export function getUserTypeDisplay(role?: string): string {
	if (!role) return "";
	switch (role) {
		case UserRole.ORGANIZATION_USER:
			return "Organization";
		case UserRole.VENDOR_USER:
			return "Vendor";
		default:
			return "Program";
	}
}

export const PLATFORM_ADMIN_ROLES: readonly UserRole[] = [
	UserRole.SUPER_ADMIN,
	UserRole.GENERAL_ADMIN,
	UserRole.OPERATIONS_MANAGER,
	UserRole.PROGRAM_MANAGER,
	UserRole.TECHNICAL_MANAGER,
	UserRole.PROGRAM_VENDOR_MANAGER,
	UserRole.COMPLIANCE_MANAGER,
];

export function isPlatformAdmin(role?: UserRole | string | null): boolean {
	return PLATFORM_ADMIN_ROLES.includes(role as UserRole);
}

export function isVendor(role?: UserRole | string | null): boolean {
	return role === UserRole.VENDOR_USER;
}

export function isCandidate(role?: UserRole | string | null): boolean {
	return role === UserRole.CANDIDATE_USER;
}

export function isOrganizationUser(role?: UserRole | string | null): boolean {
	return role === UserRole.ORGANIZATION_USER;
}
