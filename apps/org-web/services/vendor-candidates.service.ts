import type { PagePaginatedResponse } from "@repo/shared";
import { ApiClient } from "@/lib/api-client";
import type { InviteCandidateInput } from "@/services/talent-community.service";
import type {
	VendorCandidateListRow,
	VendorCandidateMetrics,
} from "@/types/vendor-candidates";
import type {
	VendorCandidateJobBoardPatchBody,
	VendorCandidateJobBoardProfile,
} from "@/utils/vendor-job-board-profile";

const BASE = "/api/vendor/candidates";

export type VendorCandidatesListQuery = {
	page?: number;
	limit?: number;
	search?: string;
	status?: "all" | "ACTIVE" | "ONBOARDING" | "INACTIVE";
};

export class VendorCandidatesService {
	static async getMetrics(): Promise<VendorCandidateMetrics> {
		return ApiClient.get<VendorCandidateMetrics>(`${BASE}/metrics`);
	}

	static async list(
		query: VendorCandidatesListQuery,
	): Promise<PagePaginatedResponse<VendorCandidateListRow>> {
		return ApiClient.get<PagePaginatedResponse<VendorCandidateListRow>>(
			BASE,
			query as Record<string, unknown>,
		);
	}

	static async getJobBoardProfile(
		candidateId: string,
		params?: {
			previewOccupationId?: string;
			previewSpecialtyIds?: string[];
		},
	): Promise<VendorCandidateJobBoardProfile> {
		const query: Record<string, string> = {};
		if (params?.previewOccupationId) {
			query.previewOccupationId = params.previewOccupationId;
		}
		if (params?.previewSpecialtyIds?.length) {
			query.previewSpecialtyIds = params.previewSpecialtyIds.join(",");
		}
		return ApiClient.get<VendorCandidateJobBoardProfile>(
			`${BASE}/job-board-profile/${candidateId}`,
			Object.keys(query).length > 0 ? query : undefined,
		);
	}

	static async patchJobBoardProfile(
		candidateId: string,
		body: VendorCandidateJobBoardPatchBody,
	): Promise<VendorCandidateJobBoardProfile> {
		return ApiClient.patch<VendorCandidateJobBoardProfile>(
			`${BASE}/job-board-profile/${candidateId}`,
			body,
		);
	}

	static async invite(input: InviteCandidateInput) {
		return ApiClient.post<unknown>(`${BASE}/invite`, input);
	}
}
