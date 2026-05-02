import { useQuery } from "@tanstack/react-query";
import { OnboardingService } from "@/services/onboarding.service";

export const candidatesKeys = {
	occupations: (orgId: string) => ["candidates", "occupations", orgId] as const,
	specialtiesForOccupation: (occupationId: string) =>
		["candidates", "specialties", occupationId] as const,
	specialtiesForOccupationInOrg: (orgId: string, occupationId: string) =>
		["candidates", "specialties", orgId, occupationId] as const,
	locationsForOrg: (orgId: string) =>
		["candidates", "locations", orgId] as const,
};

export function useOccupationsForOrg(
	orgId: string | undefined,
	options?: {
		enabled?: boolean;
	},
) {
	const enabled = options?.enabled ?? true;

	return useQuery({
		queryKey: candidatesKeys.occupations(orgId ?? ""),
		queryFn: () => OnboardingService.getOccupationsForOrg(),
		enabled: enabled && !!orgId,
		staleTime: 60_000,
	});
}

export function useSpecialtiesForOccupation(occupationId: string) {
	const trimmed = occupationId.trim();

	const query = useQuery({
		queryKey: candidatesKeys.specialtiesForOccupation(trimmed),
		queryFn: () => OnboardingService.getSpecialtiesForOccupation(trimmed),
		enabled: !!trimmed,
		staleTime: 60_000,
	});

	return {
		data: query.data?.data ?? [],
		isLoading: query.isLoading,
	};
}

export function useSpecialtiesForOccupationInOrg(
	orgId: string | undefined,
	occupationId: string | undefined,
) {
	const trimmedOrg = (orgId ?? "").trim();
	const trimmedOcc = (occupationId ?? "").trim();

	const query = useQuery({
		queryKey: candidatesKeys.specialtiesForOccupationInOrg(
			trimmedOrg,
			trimmedOcc,
		),
		queryFn: async () => {
			const data =
				await OnboardingService.listCatalogSpecialtiesForOccupation(trimmedOcc);
			return {
				data,
				total: data.length,
				page: 1,
				limit: data.length,
				totalPages: 1,
			};
		},
		enabled: !!trimmedOrg && !!trimmedOcc,
		staleTime: 60_000,
	});

	return {
		data: query.data?.data ?? [],
		isLoading: query.isLoading,
	};
}

export function useLocationsForOrg(orgId: string | undefined) {
	const trimmed = (orgId ?? "").trim();

	const query = useQuery({
		queryKey: candidatesKeys.locationsForOrg(trimmed),
		queryFn: () => OnboardingService.getLocationsForOrg({ limit: 100 }),
		enabled: !!trimmed,
		staleTime: 60_000,
	});

	return {
		data: query.data?.data ?? [],
		isLoading: query.isLoading,
	};
}
