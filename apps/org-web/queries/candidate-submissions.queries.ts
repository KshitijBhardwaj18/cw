import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CandidateSubmissionsService } from "@/services/candidate-submissions.service";

export const CANDIDATE_SUBMISSIONS_PAGE_SIZE = 10;

export const candidateSubmissionsKeys = {
	all: ["candidate-submissions"] as const,
	stats: () => [...candidateSubmissionsKeys.all, "stats"] as const,
	list: (tab: string, page: number, limit: number) =>
		[...candidateSubmissionsKeys.all, "list", tab, page, limit] as const,
	detail: (submissionId: string) =>
		[...candidateSubmissionsKeys.all, "detail", submissionId] as const,
};

export function useCandidateSubmissionTabStats(options?: {
	enabled?: boolean;
}) {
	const enabled = options?.enabled ?? true;
	return useQuery({
		queryKey: enabled
			? candidateSubmissionsKeys.stats()
			: ([...candidateSubmissionsKeys.all, "stats", "pending"] as const),
		queryFn: () => CandidateSubmissionsService.getTabStats(),
		enabled,
		refetchOnMount: "always",
	});
}

export function useWithdrawCandidateSubmission() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (vars: { submissionId: string; withdrawalReason?: string }) =>
			CandidateSubmissionsService.withdraw(
				vars.submissionId,
				vars.withdrawalReason
					? { withdrawalReason: vars.withdrawalReason }
					: undefined,
			),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: candidateSubmissionsKeys.all });
		},
	});
}

export function useAcceptCandidateOffer() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (vars: { submissionId: string }) =>
			CandidateSubmissionsService.acceptOffer(vars.submissionId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: candidateSubmissionsKeys.all });
		},
	});
}
