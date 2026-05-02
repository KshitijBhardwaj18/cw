import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	OnboardingService,
	type SaveMeOnboardingInput,
} from "@/services/onboarding.service";

export const candidateProfileKeys = {
	me: ["candidates", "me", "onboarding"] as const,
	resumeSignedUrl: ["candidates", "me", "resume-signed-url"] as const,
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
