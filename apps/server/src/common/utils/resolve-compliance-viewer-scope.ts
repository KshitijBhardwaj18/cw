import { UserRole } from "@repo/db";

export type ComplianceViewerScope = "candidate" | "vendor" | "org";

export function resolveComplianceViewerScope(
	role: UserRole | string | string[] | null | undefined,
): ComplianceViewerScope {
	const normalized = Array.isArray(role) ? role[0] : role;
	if (normalized === UserRole.CANDIDATE_USER) return "candidate";
	if (normalized === UserRole.VENDOR_USER) return "vendor";
	return "org";
}
