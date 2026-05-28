import { useQuery } from "@tanstack/react-query";
import { OnboardingService } from "@/services/onboarding.service";

export const candidatesKeys = {
	occupations: () => ["candidates", "occupations"] as const,
	locationsForOrg: () => ["candidates", "locations"] as const,
};

export function useOccupationsForOrg(options?: { enabled?: boolean }) {
	const enabled = options?.enabled ?? true;

	return useQuery({
		queryKey: candidatesKeys.occupations(),
		queryFn: () => OnboardingService.getOccupationsForOrg(),
		enabled: enabled,
		staleTime: 60_000,
	});
}

export function useLocationsForOrg() {
	const query = useQuery({
		queryKey: candidatesKeys.locationsForOrg(),
		queryFn: () => OnboardingService.getLocationsForOrg({ limit: 100 }),
		staleTime: 60_000,
	});

	return {
		data: query.data?.data ?? [],
		isLoading: query.isLoading,
	};
}
