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
		| "overdue-offers"
		| "delayed-onboarding",
		number
	>;
	requisitionRows: RequisitionPerformanceTableItem[];
	candidateRows: CandidateProcessingIssueTableItem[];
	rowsTotal: number;
	page: number;
	limit: number;
};

export type CommandCenterPerformanceResponse = {
	summaryStats: PerformanceSummaryStatApiItem[];
	groupedMetrics: PerformanceMetricGroupApiItem[];
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
