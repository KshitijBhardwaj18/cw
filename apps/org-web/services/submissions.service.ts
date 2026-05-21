import type {
	SubmissionListRow,
	SubmissionStageKey,
} from "@/constants/submissions";
import { ApiClient } from "@/lib/api-client";
import type { OrgSubmissionDetail } from "@/types/submission-detail";
import type { SubmissionAgingCounts } from "@/types/submissions";

export type OrgSubmissionsListParams = {
	stage?: SubmissionStageKey;
	agingBucket?: "ALL" | "OVERDUE" | "NEAR" | "WITHIN";
	/** When set, only submissions for this requisition (e.g. job details page). */
	requisitionId?: string;
	search?: string;
	vendorId?: string;
	hiringManagerId?: string;
	departmentId?: string;
	locationId?: string;
	page?: number;
	limit?: number;
	all?: boolean;
};

export type OrgSubmissionsListResponse = {
	data: SubmissionListRow[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
};

/** Query params for `GET .../submissions/stats/aging` (matches list filters except paging & aging bucket). */
export type OrgSubmissionsAgingStatsParams = {
	stage?: SubmissionStageKey;
	requisitionId?: string;
	search?: string;
	vendorId?: string;
	hiringManagerId?: string;
	departmentId?: string;
	locationId?: string;
};

const BASE = "/api/org/submissions";

export class SubmissionsService {
	static async list(query: OrgSubmissionsListParams = {}) {
		return ApiClient.get<OrgSubmissionsListResponse>(BASE, query);
	}

	static async getStageStats() {
		return ApiClient.get<Record<SubmissionStageKey, number>>(
			`${BASE}/stats/stages`,
		);
	}

	static async getRequisitionStageCounts(requisitionId: string) {
		return ApiClient.get<Record<SubmissionStageKey, number>>(
			`${BASE}/stats/by-requisition`,
			{ requisitionId },
		);
	}

	static async getAgingStats(query: OrgSubmissionsAgingStatsParams) {
		return ApiClient.get<SubmissionAgingCounts>(`${BASE}/stats/aging`, query);
	}

	static async get(submissionId: string) {
		return ApiClient.get<OrgSubmissionDetail>(`${BASE}/${submissionId}`);
	}

	static async updateStage(
		submissionId: string,
		body: {
			stage: SubmissionStageKey;
			startDate?: string;
			endDate?: string;
			billRate?: number;
		},
	) {
		return ApiClient.patch<OrgSubmissionDetail>(
			`${BASE}/${submissionId}`,
			body,
		);
	}
}
