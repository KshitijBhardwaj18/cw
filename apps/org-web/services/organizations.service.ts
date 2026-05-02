import type { BulkEnrollmentJobResult, MemberRole } from "@repo/shared";
import { ApiClient } from "@/lib/api-client";

export type BulkEnrollmentJobResponse = {
	id: string;
	type: string;
	status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
	payload?: object;
	result?: Partial<BulkEnrollmentJobResult>;
	createdAt: string;
	updatedAt: string;
	completedAt?: string | null;
};

export type OrganizationMembershipResponse = {
	memberId: string;
	status: string;
};

export type OrgMemberApi = {
	id: string;
	userId: string;
	organizationId: string;
	role: MemberRole;
	status: string;
	user: {
		id: string;
		name: string;
		email: string;
		emailVerified: boolean;
		createdAt: string;
		updatedAt: string;
		sessions?: {
			updatedAt: string;
		}[];
		title?: string | null;
		departmentUsers?: {
			departmentId: string;
			department: { id: string; name: string };
		}[];
	};
};

export type OrgMembersListResponse = {
	data: OrgMemberApi[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
};

export type EnrollOrgUserPayload = {
	firstName: string;
	lastName: string;
	title: string;
	email: string;
	role: MemberRole;
	officePhone?: string;
	phoneNumber?: string;
};

export type BulkEnrollmentSubmitResponse = { jobId: string };

export type UpdateOrgMemberPayload = {
	firstName?: string;
	lastName?: string;
	email?: string;
	title?: string;
	role?: MemberRole;
	status?: "ACTIVE" | "INACTIVE";
	departmentIds?: string[];
};

const ORG_BASE = "/api/org";

export class OrganizationsService {
	static async getMyMembership() {
		return ApiClient.get<OrganizationMembershipResponse>(
			"/api/organizations/me/membership",
		);
	}

	static async listMembers(
		params: {
			limit?: number;
			page?: number;
			search?: string;
			type?: string;
			role?: MemberRole;
		} = {},
	) {
		const limit = params.limit ?? 100;
		const page = params.page ?? 1;
		return ApiClient.get<OrgMembersListResponse>(`${ORG_BASE}/members`, {
			limit,
			page,
			...(params.search ? { search: params.search } : {}),
			...(params.type ? { type: params.type } : {}),
			...(params.role ? { role: params.role } : {}),
		});
	}

	static async enrollOrgUser(payload: EnrollOrgUserPayload) {
		return ApiClient.post<OrgMemberApi>(
			`${ORG_BASE}/members/org-user`,
			payload,
		);
	}

	static async removeMember(memberId: string) {
		await ApiClient.delete<unknown>(`${ORG_BASE}/members/${memberId}`);
	}

	static async updateMember(memberId: string, payload: UpdateOrgMemberPayload) {
		return ApiClient.patch<OrgMemberApi>(
			`${ORG_BASE}/members/${memberId}`,
			payload,
		);
	}

	static async submitBulkEnrollment(file: File) {
		const formData = new FormData();
		formData.append("file", file);
		return ApiClient.request<BulkEnrollmentSubmitResponse>({
			method: "POST",
			url: `${ORG_BASE}/members/bulk`,
			data: formData,
		});
	}

	static async getBulkEnrollmentJob(jobId: string) {
		return ApiClient.get<BulkEnrollmentJobResponse>(
			`${ORG_BASE}/members/bulk/jobs/${jobId}`,
		);
	}

	static createBulkEnrollmentStream(jobId: string): EventSource {
		return ApiClient.sse(`${ORG_BASE}/members/bulk/jobs/${jobId}/stream`);
	}
}
