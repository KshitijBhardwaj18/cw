import { ApiClient } from "@/lib/api-client";
import type {
	CandidateSubmission,
	CandidateSubmissionTabStats,
} from "@/types/candidate-submission";
import type { CandidateSubmissionDetailResponse } from "@/types/submission-detail";

export type CandidateSubmissionsListParams = {
	page?: number;
	limit?: number;
	tab?: string;
};

export type CandidateSubmissionsListResponse = {
	data: CandidateSubmission[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
};

const BASE = "/api/org/submissions";

export class CandidateSubmissionsService {
	static async getTabStats(): Promise<CandidateSubmissionTabStats> {
		return ApiClient.get<CandidateSubmissionTabStats>(`${BASE}/me/stats`);
	}

	static async list(
		params: CandidateSubmissionsListParams,
	): Promise<CandidateSubmissionsListResponse> {
		return ApiClient.get<CandidateSubmissionsListResponse>(`${BASE}/me`, {
			page: params.page,
			limit: params.limit,
			tab: params.tab,
		});
	}

	static async getDetail(
		submissionId: string,
	): Promise<CandidateSubmissionDetailResponse> {
		return ApiClient.get<CandidateSubmissionDetailResponse>(
			`${BASE}/me/${submissionId}`,
		);
	}

	static async withdraw(
		submissionId: string,
		body?: { withdrawalReason?: string },
	): Promise<CandidateSubmissionDetailResponse> {
		return ApiClient.post<CandidateSubmissionDetailResponse>(
			`${BASE}/me/${submissionId}/withdraw`,
			body ?? {},
		);
	}

	static async acceptOffer(
		submissionId: string,
	): Promise<CandidateSubmissionDetailResponse> {
		return ApiClient.post<CandidateSubmissionDetailResponse>(
			`${BASE}/me/${submissionId}/accept-offer`,
			{},
		);
	}
}
