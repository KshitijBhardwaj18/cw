import { useQuery } from "@tanstack/react-query";
import { VendorDashboardService } from "@/services/vendor-dashboard.service";
import type { VendorDashboardResponse } from "@/types/vendor-dashboard";

export const vendorDashboardKey = ["vendor-dashboard"] as const;

export function useVendorDashboardQuery() {
	return useQuery<VendorDashboardResponse>({
		queryKey: vendorDashboardKey,
		queryFn: () => VendorDashboardService.getDashboard(),
	});
}

export const FINANCIAL_PERIOD_OPTIONS = [
	{ value: "this-week", label: "This Week" },
	{ value: "this-month", label: "This Month" },
	{ value: "this-quarter", label: "This Quarter" },
] as const;

export type FinancialPeriodValue =
	(typeof FINANCIAL_PERIOD_OPTIONS)[number]["value"];

export function useVendorFinancialQuery(period: FinancialPeriodValue) {
	return useQuery<VendorDashboardResponse["financial"]>({
		queryKey: [...vendorDashboardKey, "financial", period],
		queryFn: () => VendorDashboardService.getFinancial(period),
	});
}
