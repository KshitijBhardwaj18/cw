import { ApiClient } from "@/lib/api-client";
import type {
	CreateProgramUserInput,
	CreateProgramUsersInput,
	EditProgramUserInput,
	MspOptionDto,
	UserDto,
} from "@/types";
import type { BulkPlatformUsersJobResponse } from "@/types/users";

export class UsersService {
	static async getMspOptions() {
		return ApiClient.get<MspOptionDto[]>("/api/users/msp-options");
	}

	static async getProgramUsers() {
		return ApiClient.get<UserDto[]>("/api/users/program");
	}

	static async getVendorUsers() {
		return ApiClient.get<UserDto[]>("/api/users/vendor");
	}

	static async getOrganizationUsers() {
		return ApiClient.get<UserDto[]>("/api/users/organization");
	}

	static async setMyActiveOrganization(organizationId: string) {
		return ApiClient.post<void, { organizationId: string }>(
			"/api/users/me/active-organization",
			{ organizationId },
		);
	}

	static async createOrgPortalDelegation(organizationId: string) {
		return ApiClient.post<{ url: string }, { organizationId: string }>(
			"/api/users/me/org-portal-delegate",
			{ organizationId },
		);
	}

	static async createProgramUser(data: CreateProgramUserInput) {
		return ApiClient.post<UserDto, CreateProgramUserInput>(
			"/api/users/program",
			data,
		);
	}

	static async createBulkProgramUsers(data: CreateProgramUsersInput) {
		return ApiClient.post<UserDto[], CreateProgramUsersInput>(
			"/api/users/program/bulk",
			data,
		);
	}

	static async submitBulkPlatformUsers(file: File) {
		const form = new FormData();
		form.append("file", file);
		return ApiClient.request<{ jobId: string }>({
			method: "POST",
			url: "/api/users/program/bulk/upload",
			data: form,
		});
	}

	static async getBulkPlatformUsersJob(jobId: string) {
		return ApiClient.get<BulkPlatformUsersJobResponse>(
			`/api/users/program/bulk/jobs/${jobId}`,
		);
	}

	static createBulkPlatformUsersStream(jobId: string): EventSource {
		return ApiClient.sse(`/api/users/program/bulk/jobs/${jobId}/stream`);
	}

	static async updateProgramUser(id: string, data: EditProgramUserInput) {
		return ApiClient.put<UserDto, EditProgramUserInput>(
			`/api/users/program/${id}`,
			data,
		);
	}

	static async deleteProgramUser(id: string) {
		return ApiClient.delete<boolean>(`/api/users/program/${id}`);
	}
}
