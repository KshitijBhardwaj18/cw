import type { PagePaginatedResponse } from "@repo/shared";
import { ApiClient } from "@/lib/api-client";
import type {
	OnboardingCandidate,
	OnboardingWeekGroup,
} from "@/types/vendor-onboarding-tracker";

const BASE = "/api/vendor/candidates/onboarding";

export type VendorOnboardingMetrics = {
	totalPlacements: number;
	cleared: number;
	inProgress: number;
	behindSchedule: number;
	windowDays: number;
};

export type VendorOnboardingListQuery = {
	weekBucket?: "1" | "2" | "3" | "all";
	page?: number;
	limit?: number;
	search?: string;
};

export type VendorOnboardingListResponse =
	PagePaginatedResponse<OnboardingCandidate> & {
		weekBucket: "1" | "2" | "3" | "all";
		weekLabel: string;
		weekDescription: string;
	};

export class VendorOnboardingService {
	static async getMetrics(): Promise<VendorOnboardingMetrics> {
		return ApiClient.get<VendorOnboardingMetrics>(`${BASE}/metrics`);
	}

	static async list(
		query: VendorOnboardingListQuery,
	): Promise<VendorOnboardingListResponse> {
		return ApiClient.get<VendorOnboardingListResponse>(BASE, {
			...(query as Record<string, unknown>),
		});
	}

	static async queueReminder(placementId: string): Promise<{
		queued: true;
		placementCount: number;
	}> {
		return ApiClient.post<{ queued: true; placementCount: number }>(
			`${BASE}/remind`,
			{ placementId },
		);
	}
}

export function toWeekGroupFromListResponse(
	res: VendorOnboardingListResponse,
): OnboardingWeekGroup {
	const week =
		res.weekBucket === "all" ? 0 : Number.parseInt(res.weekBucket, 10) || 1;
	return {
		week,
		label: res.weekLabel,
		description: res.weekDescription,
		candidates: res.data,
	};
}
