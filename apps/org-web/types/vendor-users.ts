import type { VendorUserRole } from "@repo/shared";

export type VendorUserUiStatus = "active" | "inactive";

export interface VendorPortalUserRow {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	department: string;
	role: VendorUserRole;
	status: VendorUserUiStatus;
	lastActiveAt: string;
}

export interface VendorUserMetricStats {
	totalUsers: number;
	activeUsers: number;
	adminCount: number;
	recruiterCount: number;
}

export type VendorPortalTeamMetrics = {
	totalUsers: number;
	activeUsers: number;
	managerCount: number;
	standardUserCount: number;
	viewOnlyCount: number;
};

export type VendorPortalUsersListResponse = {
	items: VendorPortalUserRow[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	viewer: {
		vendorId: string;
		vendorUserId: string;
		vendorUserRole: VendorUserRole;
		organizationId: string | null;
	};
};
