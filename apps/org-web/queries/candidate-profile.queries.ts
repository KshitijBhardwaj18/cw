import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	OnboardingService,
	type SaveMeOnboardingInput,
	type SaveOnboardingIdentityInput,
	type SaveOnboardingReferenceInput,
	type SaveQuestionnaireAnswersInput,
	type StartSelfOnboardingInput,
} from "@/services/onboarding.service";

export const candidateProfileKeys = {
	me: ["candidates", "me", "onboarding"] as const,
	resumeSignedUrl: ["candidates", "me", "resume-signed-url"] as const,
	questionnaires: ["candidates", "me", "onboarding", "questionnaires"] as const,
};

export function useCandidateMeProfile() {
	return useQuery({
		queryKey: candidateProfileKeys.me,
		queryFn: () => OnboardingService.getMeOnboarding(),
		refetchOnMount: "always",
	});
}

export function useUpdateCandidateProfile() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: SaveMeOnboardingInput) =>
			OnboardingService.saveMeOnboarding(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: candidateProfileKeys.me });
		},
	});
}

export function useDismissProfileBanner() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => OnboardingService.dismissProfileBanner(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: candidateProfileKeys.me });
		},
	});
}

export function useUploadResume() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (file: File) => OnboardingService.saveMeResume(file),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: candidateProfileKeys.me });
			queryClient.removeQueries({
				queryKey: candidateProfileKeys.resumeSignedUrl,
			});
		},
	});
}

export function useCandidateResumeSignedUrl(enabled: boolean) {
	return useQuery({
		queryKey: candidateProfileKeys.resumeSignedUrl,
		queryFn: () => OnboardingService.getMeResumeSignedUrl(),
		enabled,
		staleTime: 50_000,
	});
}

export function useStartSelfOnboarding() {
	return useMutation({
		mutationFn: (input: StartSelfOnboardingInput) =>
			OnboardingService.startSelfOnboarding(input),
	});
}

export function useSaveMeQuestionnaireAnswers() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: SaveQuestionnaireAnswersInput) =>
			OnboardingService.saveMeQuestionnaireAnswers(input),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: candidateProfileKeys.questionnaires,
			});
		},
	});
}

export function useSaveMeIdentity() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: SaveOnboardingIdentityInput) =>
			OnboardingService.saveMeIdentity(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: candidateProfileKeys.me });
		},
	});
}

export function useSaveMeReferences() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (references: SaveOnboardingReferenceInput[]) =>
			OnboardingService.saveMeReferences(references),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: candidateProfileKeys.me });
		},
	});
}

export function useSaveMeSkillsChecklist() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (file: File) => OnboardingService.saveMeSkillsChecklist(file),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: candidateProfileKeys.me });
		},
	});
}

export function useCompleteMeInvite() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (locationIds?: string[]) =>
			OnboardingService.completeMeInvite(locationIds),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: candidateProfileKeys.me });
		},
	});
}
