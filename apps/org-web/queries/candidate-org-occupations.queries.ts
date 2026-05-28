import { useQuery } from "@tanstack/react-query";
import {
	OnboardingService,
	type OrgEnabledSpecialtyOption,
} from "@/services/onboarding.service";

export type CandidateOrgOccupation = {
	organizationOccupationId: string;
	occupationId: string;
	name: string;
	acronym: string | null;
};

export const candidateOrgOccupationsKeys = {
	root: ["candidate-org-occupations"] as const,
	occupations: () => [...candidateOrgOccupationsKeys.root, "list"] as const,
	specialties: (occupationId: string) =>
		[...candidateOrgOccupationsKeys.root, "specialties", occupationId] as const,
};

export function useCandidateOrgOccupations(options?: { enabled?: boolean }) {
	const enabled = options?.enabled ?? true;
	return useQuery<CandidateOrgOccupation[]>({
		queryKey: candidateOrgOccupationsKeys.occupations(),
		queryFn: async () => {
			const res = await OnboardingService.getMyOrgOccupations();
			return res.data.map((row) => ({
				organizationOccupationId: row.id,
				occupationId: row.occupationId,
				name: row.occupation.name,
				acronym: row.occupation.acronym,
			}));
		},
		enabled,
		staleTime: 5 * 60 * 1000,
	});
}

export function useCandidateOccupationSpecialties(
	occupationId: string | null | undefined,
	options?: { enabled?: boolean },
) {
	const trimmed = (occupationId ?? "").trim();
	const enabled = (options?.enabled ?? true) && trimmed.length > 0;
	return useQuery<OrgEnabledSpecialtyOption[]>({
		queryKey: candidateOrgOccupationsKeys.specialties(trimmed),
		queryFn: () => OnboardingService.getMyOccupationSpecialties(trimmed),
		enabled,
		staleTime: 5 * 60 * 1000,
	});
}
