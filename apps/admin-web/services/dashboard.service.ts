import { ApiClient } from "@/lib/api-client";
import type { DashboardSummaryResponse } from "@/types";

export class DashboardService {
	static async getDashboardSummary() {
		return ApiClient.get<DashboardSummaryResponse>("/api/dashboard/summary");
	}
}
