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
	list: (query: TalentCommunityQuery) =>
		[...talentCommunityKeys.all, "list", query] as const,
	orgOccupations: () =>
		[...talentCommunityKeys.all, "org-occupations"] as const,
	orgOccupationSpecialties: () =>
		[...talentCommunityKeys.all, "org-occupation-specialties"] as const,
	vendors: () => [...talentCommunityKeys.all, "vendors"] as const,
	existing: (query: ExistingTalentQuery) =>
		[...talentCommunityKeys.all, "existing", query] as const,
	candidateProfile: (candidateId: string) =>
		[...talentCommunityKeys.all, "candidate-profile", candidateId] as const,
	candidateActivity: (candidateId: string) =>
		[...talentCommunityKeys.all, "candidate-activity", candidateId] as const,
};

export function useTalentCommunity(query: TalentCommunityQuery) {
	return useQuery({
		queryKey: talentCommunityKeys.list(query),
		queryFn: () => TalentCommunityService.getTalentCommunity(query),
		refetchOnMount: "always",
	});
}

export function useOrgOccupations() {
	return useQuery({
		queryKey: talentCommunityKeys.orgOccupations(),
		queryFn: () => OnboardingService.getLinkedOccupationsForOrg({ limit: 100 }),
		staleTime: 5 * 60 * 1000,
	});
}

export function useOrgLinkedOccupationSpecialties() {
	return useQuery({
		queryKey: talentCommunityKeys.orgOccupationSpecialties(),
		queryFn: () =>
			OnboardingService.getDistinctSpecialtiesForOrgLinkedOccupations(),
		staleTime: 5 * 60 * 1000,
	});
}

export function useOrgVendors() {
	return useQuery({
		queryKey: talentCommunityKeys.vendors(),
		queryFn: () => TalentCommunityService.getOrgVendors(),
		staleTime: 5 * 60 * 1000,
	});
}

export function useInviteCandidate() {
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

export function useExistingTalent(query: ExistingTalentQuery) {
	return useQuery({
		queryKey: talentCommunityKeys.existing(query),
		queryFn: () => TalentCommunityService.getExistingCandidates(query),
		refetchOnMount: "always",
	});
}

export function useAddExistingTalent() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (candidateIds: string[]) =>
			TalentCommunityService.addExistingCandidates(candidateIds),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: talentCommunityKeys.all });
		},
	});
}

export function useCandidateProfile(candidateId: string | null) {
	return useQuery<CandidateProfileType>({
		queryKey: talentCommunityKeys.candidateProfile(candidateId ?? ""),
		queryFn: () =>
			TalentCommunityService.getCandidateProfile(candidateId as string),
		enabled: !!candidateId,
		refetchOnMount: "always",
	});
}

export function useCandidateActivity(candidateId: string | null) {
	return useQuery<CandidateActivityEvent[]>({
		queryKey: talentCommunityKeys.candidateActivity(candidateId ?? ""),
		queryFn: () =>
			TalentCommunityService.getCandidateActivity(candidateId as string),
		enabled: !!candidateId,
		refetchOnMount: "always",
	});
}

export function useAssignCandidateWorkforceType() {
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
				queryKey: talentCommunityKeys.candidateProfile(variables.candidateId),
			});
			void queryClient.invalidateQueries({
				queryKey: talentCommunityKeys.candidateActivity(variables.candidateId),
			});
		},
	});
}
