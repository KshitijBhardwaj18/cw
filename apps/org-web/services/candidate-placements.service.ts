import type { PlacementOfferHistoryResponse } from "@/constants/placement-offer-history";
import { ApiClient } from "@/lib/api-client";
import type { CandidatePlacementListGrouped } from "@/types/candidate-placement";
import type { CandidatePlacementDetail } from "@/types/candidate-placement-detail";
import type {
	CandidateTimecardDetail,
	CandidateTimecardPageData,
	UpsertCandidateTimecardPayload,
	UpsertCandidateTimecardResult,
} from "@/types/candidate-timecard";
import type { PlacementComplianceResponse } from "@/types/placement-compliance";

export type CandidatePlacementCounts = {
	active: number;
	upcoming: number;
	past: number;
};

export class CandidatePlacementsService {
	static async list(): Promise<CandidatePlacementListGrouped> {
		return ApiClient.get<CandidatePlacementListGrouped>(
			"/api/candidates/me/placements",
		);
	}

	static async getCounts(): Promise<CandidatePlacementCounts> {
		return ApiClient.get<CandidatePlacementCounts>(
			"/api/candidates/me/placement-counts",
		);
	}

	static async getDetail(
		placementId: string,
	): Promise<CandidatePlacementDetail> {
		return ApiClient.get<CandidatePlacementDetail>(
			`/api/candidates/me/placements/${placementId}`,
		);
	}

	static async getOfferHistory(
		placementId: string,
	): Promise<PlacementOfferHistoryResponse> {
		return ApiClient.get<PlacementOfferHistoryResponse>(
			`/api/candidates/me/placements/${placementId}/offer-history`,
		);
	}

	static async getCompliance(
		placementId: string,
	): Promise<PlacementComplianceResponse> {
		return ApiClient.get<PlacementComplianceResponse>(
			`/api/candidates/me/placements/${placementId}/compliance`,
		);
	}

	static async getTimecards(
		placementId: string,
	): Promise<CandidateTimecardPageData> {
		return ApiClient.get<CandidateTimecardPageData>(
			`/api/candidates/me/placements/${placementId}/timecards`,
		);
	}

	static async getTimecardDetail(
		placementId: string,
		timecardId: string,
	): Promise<CandidateTimecardDetail> {
		return ApiClient.get<CandidateTimecardDetail>(
			`/api/candidates/me/placements/${placementId}/timecards/${timecardId}`,
		);
	}

	static async upsertTimecard(
		placementId: string,
		payload: UpsertCandidateTimecardPayload,
	): Promise<UpsertCandidateTimecardResult> {
		return ApiClient.request<UpsertCandidateTimecardResult>({
			method: "PUT",
			url: `/api/candidates/me/placements/${placementId}/timecards`,
			data: payload,
		});
	}
}
