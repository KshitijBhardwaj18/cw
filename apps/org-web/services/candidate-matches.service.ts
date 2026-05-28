import { ApiClient } from "@/lib/api-client";
import type {
	CandidateMatchDetail,
	CandidateMatchesListResponse,
	CandidateMatchesQueryParams,
} from "@/types/candidate-matches";

export class CandidateMatchesService {
	static async getMatches(
		params: CandidateMatchesQueryParams = {},
	): Promise<CandidateMatchesListResponse> {
		return ApiClient.get<CandidateMatchesListResponse>(
			"/api/candidates/me/matches",
			params as Record<string, unknown>,
		);
	}

	static async getDetail(requisitionId: string): Promise<CandidateMatchDetail> {
		return ApiClient.get<CandidateMatchDetail>(
			`/api/candidates/me/matches/${requisitionId}`,
		);
	}

	static async saveJob(requisitionId: string): Promise<{ isSaved: boolean }> {
		return ApiClient.request<{ isSaved: boolean }>({
			method: "POST",
			url: `/api/candidates/me/matches/${requisitionId}/save`,
		});
	}

	static async unsaveJob(requisitionId: string): Promise<{ isSaved: boolean }> {
		return ApiClient.request<{ isSaved: boolean }>({
			method: "DELETE",
			url: `/api/candidates/me/matches/${requisitionId}/save`,
		});
	}

	static async submitForVendorReview(
		requisitionId: string,
	): Promise<{ submitted: true }> {
		return ApiClient.request<{ submitted: true }>({
			method: "POST",
			url: `/api/candidates/me/matches/${requisitionId}/submit-for-vendor-review`,
		});
	}

	static async applyToJob(body: {
		requisitionId: string;
		summaryNote?: string;
		rtos?: Array<{ startDate: string; endDate?: string; label: string }>;
	}): Promise<{ id: string; stage: string; submittedAt: string }> {
		return ApiClient.post("/api/org/submissions/me", body);
	}
}
