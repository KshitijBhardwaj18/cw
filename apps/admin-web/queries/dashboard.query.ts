import { useSuspenseQuery } from "@tanstack/react-query";
import { DashboardService } from "@/services";

export const dashboardKeys = {
	all: ["dashboard"] as const,
	summary: ["dashboard", "summary"] as const,
};

export const useDashboardSummary = () => {
	return useSuspenseQuery({
		queryKey: dashboardKeys.summary,
		queryFn: () => DashboardService.getDashboardSummary(),
	});
};
