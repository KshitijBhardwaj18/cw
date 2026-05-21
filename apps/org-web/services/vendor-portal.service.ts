import type { VendorUserRole } from "@repo/shared";
import { ApiClient } from "@/lib/api-client";
import type {
	VendorPortalTeamMetrics,
	VendorPortalUserRow,
	VendorPortalUsersListResponse,
} from "@/types/vendor-users";

export type VendorPortalUsersQueryParams = {
	page?: number;
	limit?: number;
	search?: string;
	role?: string;
	status?: string;
};

export type VendorPortalCreateUserInput = {
	fullName: string;
	email: string;
	phone?: string;
	role: VendorUserRole;
	departmentId: string;
};

export type VendorPortalUpdateUserInput = {
	fullName: string;
	phone?: string;
	role: VendorUserRole;
	departmentId: string;
};

export type VendorContextResponse = {
	vendorId: string;
	vendorUserId: string;
	vendorUserRole: VendorUserRole;
	organizationId: string | null;
	/** Resolved from Vendor row (session only has vendorId). */
	vendorName: string | null;
	organizationName: string | null;
	organizationSlug: string | null;
};

export class VendorPortalService {
	static async getVendorContext(): Promise<VendorContextResponse> {
		return ApiClient.get<VendorContextResponse>("/api/vendor/me");
	}

	static async listUsers(
		params: VendorPortalUsersQueryParams,
	): Promise<VendorPortalUsersListResponse> {
		const res = await ApiClient.get<{
			data: VendorPortalUserRow[];
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
		}>("/api/vendor/users", params);
		const mapped: VendorPortalUsersListResponse = {
			items: res.data,
			total: res.total,
			page: res.page,
			limit: res.limit,
			totalPages: res.totalPages,
			viewer: res.viewer,
		};
		return mapped;
	}

	static async getUsersMetrics(): Promise<VendorPortalTeamMetrics> {
		return ApiClient.get<VendorPortalTeamMetrics>("/api/vendor/users/metrics");
	}

	static async createUser(
		body: VendorPortalCreateUserInput,
	): Promise<{ vendorId: string; userId: string; role: string }> {
		return ApiClient.post("/api/vendor/users", body);
	}

	static async updateUser(
		vendorUserId: string,
		body: VendorPortalUpdateUserInput,
	): Promise<{ vendorId: string; vendorUserId: string }> {
		return ApiClient.patch(`/api/vendor/users/${vendorUserId}`, body);
	}

	static async removeUser(
		vendorUserId: string,
	): Promise<{ vendorId: string; vendorUserId: string }> {
		return ApiClient.delete(`/api/vendor/users/${vendorUserId}`);
	}
}
