import type { CandidateWorkforceType } from "@repo/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { OnboardingService } from "@/services/onboarding.service";
import type {
	CandidateActivityEvent,
	CandidateProfileType,
	ExistingTalentQuery,
	InviteCandidateInput,
	TalentCommunityQuery,
} from "@/services/talent-community.service";
import { TalentCommunityService } from "@/services/talent-community.service";

export const talentCommunityKeys = {
	all: ["talent-community"] as const,
	list: (orgId: string, query: TalentCommunityQuery) =>
		[...talentCommunityKeys.all, "list", orgId, query] as const,
	orgOccupations: (orgId: string) =>
		[...talentCommunityKeys.all, "org-occupations", orgId] as const,
	orgOccupationSpecialties: (orgId: string) =>
		[...talentCommunityKeys.all, "org-occupation-specialties", orgId] as const,
	specialties: (occupationId: string) =>
		[...talentCommunityKeys.all, "specialties", occupationId] as const,
	vendors: (orgId: string) =>
		[...talentCommunityKeys.all, "vendors", orgId] as const,
	existing: (orgId: string, query: ExistingTalentQuery) =>
		[...talentCommunityKeys.all, "existing", orgId, query] as const,
	candidateProfile: (orgId: string, candidateId: string) =>
		[
			...talentCommunityKeys.all,
			"candidate-profile",
			orgId,
			candidateId,
		] as const,
	candidateActivity: (orgId: string, candidateId: string) =>
		[
			...talentCommunityKeys.all,
			"candidate-activity",
			orgId,
			candidateId,
		] as const,
};

export function useTalentCommunity(orgId: string, query: TalentCommunityQuery) {
	return useQuery({
		queryKey: talentCommunityKeys.list(orgId, query),
		queryFn: () => TalentCommunityService.getTalentCommunity(query),
		refetchOnMount: "always",
		enabled: !!orgId,
	});
}

export function useOrgOccupations(orgId: string) {
	return useQuery({
		queryKey: talentCommunityKeys.orgOccupations(orgId),
		queryFn: () => OnboardingService.getLinkedOccupationsForOrg({ limit: 100 }),
		enabled: !!orgId,
		staleTime: 5 * 60 * 1000,
	});
}

export function useOrgLinkedOccupationSpecialties(orgId: string) {
	return useQuery({
		queryKey: talentCommunityKeys.orgOccupationSpecialties(orgId),
		queryFn: () =>
			OnboardingService.getDistinctSpecialtiesForOrgLinkedOccupations(),
		enabled: !!orgId,
		staleTime: 5 * 60 * 1000,
	});
}

export function useSpecialtiesForOccupation(
	orgId: string,
	occupationId: string | null,
) {
	return useQuery({
		queryKey: talentCommunityKeys.specialties(occupationId ?? ""),
		queryFn: () =>
			OnboardingService.listCatalogSpecialtiesForOccupation(
				occupationId as string,
			),
		enabled: !!occupationId && !!orgId,
		staleTime: 5 * 60 * 1000,
	});
}

export function useOrgVendors(orgId: string) {
	return useQuery({
		queryKey: talentCommunityKeys.vendors(orgId),
		queryFn: () => TalentCommunityService.getOrgVendors(),
		enabled: !!orgId,
		staleTime: 5 * 60 * 1000,
	});
}

export function useInviteCandidate(_orgId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: InviteCandidateInput) =>
			TalentCommunityService.inviteCandidate(input),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: talentCommunityKeys.all,
			});
		},
	});
}

export function useExistingTalent(orgId: string, query: ExistingTalentQuery) {
	return useQuery({
		queryKey: talentCommunityKeys.existing(orgId, query),
		queryFn: () => TalentCommunityService.getExistingCandidates(query),
		enabled: !!orgId,
		refetchOnMount: "always",
	});
}

export function useAddExistingTalent(_orgId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (candidateIds: string[]) =>
			TalentCommunityService.addExistingCandidates(candidateIds),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: talentCommunityKeys.all });
		},
	});
}

export function useCandidateProfile(orgId: string, candidateId: string | null) {
	return useQuery<CandidateProfileType>({
		queryKey: talentCommunityKeys.candidateProfile(orgId, candidateId ?? ""),
		queryFn: () =>
			TalentCommunityService.getCandidateProfile(candidateId as string),
		enabled: !!orgId && !!candidateId,
		refetchOnMount: "always",
	});
}

export function useCandidateActivity(
	orgId: string,
	candidateId: string | null,
) {
	return useQuery<CandidateActivityEvent[]>({
		queryKey: talentCommunityKeys.candidateActivity(orgId, candidateId ?? ""),
		queryFn: () =>
			TalentCommunityService.getCandidateActivity(candidateId as string),
		enabled: !!orgId && !!candidateId,
		refetchOnMount: "always",
	});
}

export function useAssignCandidateWorkforceType(orgId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			candidateId,
			workforceType,
			vendorId,
		}: {
			candidateId: string;
			workforceType: CandidateWorkforceType;
			vendorId?: string;
		}) =>
			TalentCommunityService.updateCandidateWorkforceType(
				candidateId,
				workforceType,
				vendorId,
			),
		onSuccess: (_updated, variables) => {
			void queryClient.invalidateQueries({ queryKey: talentCommunityKeys.all });
			void queryClient.invalidateQueries({
				queryKey: talentCommunityKeys.candidateProfile(
					orgId,
					variables.candidateId,
				),
			});
			void queryClient.invalidateQueries({
				queryKey: talentCommunityKeys.candidateActivity(
					orgId,
					variables.candidateId,
				),
			});
		},
	});
}
