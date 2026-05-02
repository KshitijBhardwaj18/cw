import { useQuery } from "@tanstack/react-query";
import {
	type VendorOnboardingListQuery,
	VendorOnboardingService,
} from "@/services/vendor-onboarding.service";

export const vendorOnboardingKeys = {
	all: ["vendor-onboarding"] as const,
	metrics: () => [...vendorOnboardingKeys.all, "metrics"] as const,
	list: (query: VendorOnboardingListQuery) =>
		[...vendorOnboardingKeys.all, "list", query] as const,
};

export function useVendorOnboardingMetrics() {
	return useQuery({
		queryKey: vendorOnboardingKeys.metrics(),
		queryFn: () => VendorOnboardingService.getMetrics(),
		refetchOnMount: "always",
	});
}

export function useVendorOnboardingList(query: VendorOnboardingListQuery) {
	return useQuery({
		queryKey: vendorOnboardingKeys.list(query),
		queryFn: () => VendorOnboardingService.list(query),
		refetchOnMount: "always",
	});
}
