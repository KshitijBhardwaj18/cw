import { getLabel, VendorUserRole } from "@repo/shared";
import type {
	VendorPortalTeamMetrics,
	VendorUserMetricStats,
	VendorUserUiStatus,
} from "@/types/vendor-users";

const VENDOR_USER_ROLE_LABELS = [
	{ value: VendorUserRole.VENDOR_MANAGER, label: "Vendor manager" },
	{ value: VendorUserRole.VENDOR_USER, label: "Vendor user" },
	{ value: VendorUserRole.VENDOR_VIEW_ONLY, label: "View only" },
] as const;

export const VENDOR_USER_ROLE_FILTER_OPTIONS = [
	{ value: "all", label: "All Roles" },
	...VENDOR_USER_ROLE_LABELS,
] as const;

export const VENDOR_USER_STATUS_FILTER_OPTIONS = [
	{ value: "all", label: "All Status" },
	{ value: "active", label: "Active" },
	{ value: "inactive", label: "Inactive" },
] as const;

export function mapVendorPortalMetricsToStats(
	metrics: VendorPortalTeamMetrics,
): VendorUserMetricStats {
	return {
		totalUsers: metrics.totalUsers,
		activeUsers: metrics.activeUsers,
		adminCount: metrics.managerCount,
		recruiterCount: metrics.standardUserCount,
	};
}

export function vendorUserRoleLabel(role: VendorUserRole): string {
	return getLabel(VENDOR_USER_ROLE_LABELS, role);
}

export function vendorUserStatusLabel(status: VendorUserUiStatus): string {
	return status === "active" ? "Active" : "Inactive";
}
