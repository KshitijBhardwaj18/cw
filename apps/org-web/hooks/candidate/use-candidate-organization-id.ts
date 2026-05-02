"use client";

import { useQuery } from "@tanstack/react-query";
import { OnboardingService } from "@/services/onboarding.service";

const ONBOARDING_ME_QUERY_KEY = ["candidates", "me", "onboarding"] as const;

export function useCandidateOrganizationId() {
	const query = useQuery({
		queryKey: ONBOARDING_ME_QUERY_KEY,
		queryFn: () => OnboardingService.getMeOnboarding(),
		refetchOnMount: "always",
	});

	const organizationId = query.data?.organizationId?.trim() ?? "";
	const occupationId = query.data?.occupationId?.trim() ?? "";

	return {
		organizationId: organizationId || null,
		occupationId: occupationId || null,
		name: query.data?.name ?? null,
		email: query.data?.email ?? null,
		phoneNumber: query.data?.phoneNumber ?? null,
		occupationName: query.data?.occupationName ?? null,
		yearsOfExperience: query.data?.yearsOfExperience ?? null,
		isLoading: query.isPending,
		isReady: query.isSuccess,
	};
}
