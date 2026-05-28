import { ApiClient } from "@/lib/api-client";
import type {
	ActiveWorkforceCountsByType,
	ActiveWorkforceOccupationItem,
	CandidateProcessingIssueTableItem,
	HiringFunnelJobListingItem,
	HiringFunnelSummaryKey,
	OperationsManagementFilterCategory,
	OperationsManagementFilterKey,
	PerformanceMetricGroupApiItem,
	PerformanceSummaryStatApiItem,
	RequisitionPerformanceTableItem,
} from "@/types/command-center";

export type CommandCenterOperationsResponse = {
	activeFilterKey: OperationsManagementFilterKey | null;
	activeCategory: OperationsManagementFilterCategory | null;
	activeFilterMeta: { heading: string; description: string } | null;
	requisitionCountsByFilter: Record<
		"slow-time-to-fill" | "no-submissions" | "low-submissions",
		number
	>;
	candidateCountsByFilter: Record<
		| "overdue-submissions"
		| "aging-qualified"
		| "aging-shortlisted"
		| "interview-delayed"
		| "offer-pending"
		| "overdue-offers"
		| "delayed-onboarding",
		number
	>;
	requisitionRows: RequisitionPerformanceTableItem[];
	candidateRows: CandidateProcessingIssueTableItem[];
	rowsTotal: number;
	page: number;
	limit: number;
	/** False when the org's requisition attention rules haven't been configured by the admin. */
	requisitionAttentionRulesConfigured: boolean;
	/** False when the org's candidate-side aging rules haven't been configured by the admin. */
	candidateAgingRulesConfigured: boolean;
	requisitionCardDescriptions: Record<
		"slow-time-to-fill" | "no-submissions" | "low-submissions",
		string
	>;
	candidateCardDescriptions: Record<
		| "overdue-submissions"
		| "aging-qualified"
		| "aging-shortlisted"
		| "interview-delayed"
		| "offer-pending"
		| "overdue-offers"
		| "delayed-onboarding",
		string
	>;
	requisitionCardConfigured: Record<
		"slow-time-to-fill" | "no-submissions" | "low-submissions",
		boolean
	>;
	candidateCardConfigured: Record<
		| "overdue-submissions"
		| "aging-qualified"
		| "aging-shortlisted"
		| "interview-delayed"
		| "offer-pending"
		| "overdue-offers"
		| "delayed-onboarding",
		boolean
	>;
	requisitionCardActive: Record<
		"slow-time-to-fill" | "no-submissions" | "low-submissions",
		boolean
	>;
	candidateCardActive: Record<
		| "overdue-submissions"
		| "aging-qualified"
		| "aging-shortlisted"
		| "interview-delayed"
		| "offer-pending"
		| "overdue-offers"
		| "delayed-onboarding",
		boolean
	>;
};

export type CommandCenterPerformanceResponse = {
	summaryStats: PerformanceSummaryStatApiItem[];
	groupedMetrics: PerformanceMetricGroupApiItem[];
	lastRefreshedAt: string | null;
};

export type CommandCenterActiveWorkforceResponse = {
	occupations: ActiveWorkforceOccupationItem[];
	selectedOccupationId: string;
	workforceCountsByType: ActiveWorkforceCountsByType;
};

export type CommandCenterHiringFunnelResponse = {
	locationOptions: Array<{ value: string; label: string }>;
	departmentOptions: Array<{ value: string; label: string }>;
	jobListings: HiringFunnelJobListingItem[];
	summaryByKey: Record<
		HiringFunnelSummaryKey,
		{ value: number; helperText: string }
	>;
	page: number;
	limit: number;
	total: number;
};

const BASE = "/api/org/command-center";

export class CommandCenterService {
	static async getOperations(query: {
		filterKey?: string;
		page?: number;
		limit?: number;
	}) {
		return ApiClient.get<CommandCenterOperationsResponse>(
			`${BASE}/operations`,
			{
				filterKey: query.filterKey,
				page: query.page,
				limit: query.limit,
			},
		);
	}

	static async getPerformance(query: {
		range?: "last-30-days" | "last-quarter" | "custom-date-range";
		startDate?: string;
		endDate?: string;
	}) {
		return ApiClient.get<CommandCenterPerformanceResponse>(
			`${BASE}/performance`,
			query,
		);
	}

	static async getActiveWorkforce(occupationId?: string) {
		return ApiClient.get<CommandCenterActiveWorkforceResponse>(
			`${BASE}/active-workforce`,
			{ occupationId },
		);
	}

	static async getHiringFunnel(query: {
		search?: string;
		location?: string;
		department?: string;
		page?: number;
		limit?: number;
	}) {
		return ApiClient.get<CommandCenterHiringFunnelResponse>(
			`${BASE}/hiring-funnel`,
			query,
		);
	}

	static async queueRequisitionReminder(
		requisitionId: string,
		placementId?: string,
	) {
		return ApiClient.post<{
			queued: true;
			requisitionId: string;
			placementId: string;
		}>(`${BASE}/operations/remind`, {
			requisitionId,
			placementId,
		});
	}
}
