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
