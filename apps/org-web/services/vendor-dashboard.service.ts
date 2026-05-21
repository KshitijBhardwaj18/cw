import { ApiClient } from "@/lib/api-client";
import type { VendorDashboardResponse } from "@/types/vendor-dashboard";

export class VendorDashboardService {
	static async getSummary(): Promise<VendorDashboardResponse["summary"]> {
		return ApiClient.get<VendorDashboardResponse["summary"]>(
			"/api/vendor/dashboard/summary",
		);
	}

	static async getPerformance(): Promise<
		VendorDashboardResponse["performance"]
	> {
		return ApiClient.get<VendorDashboardResponse["performance"]>(
			"/api/vendor/dashboard/performance",
		);
	}

	static async getFinancial(
		period?: string,
	): Promise<VendorDashboardResponse["financial"]> {
		return ApiClient.get<VendorDashboardResponse["financial"]>(
			"/api/vendor/dashboard/financial",
			period ? { period } : undefined,
		);
	}

	static async getInvoiceStatus(): Promise<
		VendorDashboardResponse["invoiceStatus"]
	> {
		return ApiClient.get<VendorDashboardResponse["invoiceStatus"]>(
			"/api/vendor/dashboard/invoice-status",
		);
	}

	static async getComplianceAlerts(): Promise<
		VendorDashboardResponse["complianceAlerts"]
	> {
		return ApiClient.get<VendorDashboardResponse["complianceAlerts"]>(
			"/api/vendor/dashboard/compliance-alerts",
		);
	}

	static async getRecentActivity(): Promise<
		VendorDashboardResponse["recentActivity"]
	> {
		return ApiClient.get<VendorDashboardResponse["recentActivity"]>(
			"/api/vendor/dashboard/recent-activity",
		);
	}

	static async getOffers(): Promise<VendorDashboardResponse["offers"]> {
		return ApiClient.get<VendorDashboardResponse["offers"]>(
			"/api/vendor/dashboard/offers",
		);
	}

	static async getUpcomingShifts(): Promise<
		VendorDashboardResponse["upcomingShifts"]
	> {
		return ApiClient.get<VendorDashboardResponse["upcomingShifts"]>(
			"/api/vendor/dashboard/upcoming-shifts",
		);
	}

	static async getDashboard(): Promise<VendorDashboardResponse> {
		const [
			summary,
			performance,
			financial,
			invoiceStatus,
			complianceAlerts,
			recentActivity,
			offers,
			upcomingShifts,
		] = await Promise.all([
			VendorDashboardService.getSummary(),
			VendorDashboardService.getPerformance(),
			VendorDashboardService.getFinancial(),
			VendorDashboardService.getInvoiceStatus(),
			VendorDashboardService.getComplianceAlerts(),
			VendorDashboardService.getRecentActivity(),
			VendorDashboardService.getOffers(),
			VendorDashboardService.getUpcomingShifts(),
		]);

		return {
			summary,
			performance,
			financial,
			invoiceStatus,
			complianceAlerts,
			recentActivity,
			offers,
			upcomingShifts,
		};
	}
}
