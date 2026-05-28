"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CandidateMatchesService } from "@/services/candidate-matches.service";
import type { CandidateMatchesQueryParams } from "@/types/candidate-matches";
import { candidateSubmissionsKeys } from "./candidate-submissions.queries";

export const candidateMatchesKeys = {
	all: ["candidate", "matches"] as const,
	list: (params: CandidateMatchesQueryParams) =>
		[...candidateMatchesKeys.all, "list", params] as const,
	detail: (requisitionId: string) =>
		[...candidateMatchesKeys.all, "detail", requisitionId] as const,
};

export function useCandidateMatches(
	params: CandidateMatchesQueryParams = {},
	options?: { enabled?: boolean },
) {
	const enabled = options?.enabled ?? true;
	return useQuery({
		queryKey: enabled
			? candidateMatchesKeys.list(params)
			: ([...candidateMatchesKeys.all, "list", "pending", params] as const),
		queryFn: () => CandidateMatchesService.getMatches(params),
		enabled,
		refetchOnMount: "always",
	});
}

export function useCandidateMatchDetail(
	requisitionId: string,
	options?: { enabled?: boolean },
) {
	const enabled = (options?.enabled ?? true) && Boolean(requisitionId);
	return useQuery({
		queryKey: enabled
			? candidateMatchesKeys.detail(requisitionId)
			: ([
					...candidateMatchesKeys.all,
					"detail",
					"pending",
					requisitionId,
				] as const),
		queryFn: () => CandidateMatchesService.getDetail(requisitionId),
		enabled,
		refetchOnMount: "always",
	});
}

export function useSaveMatch() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (requisitionId: string) =>
			CandidateMatchesService.saveJob(requisitionId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: candidateMatchesKeys.all });
		},
	});
}

export function useUnsaveMatch() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (requisitionId: string) =>
			CandidateMatchesService.unsaveJob(requisitionId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: candidateMatchesKeys.all });
		},
	});
}

export function useSubmitForVendorReview() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (requisitionId: string) =>
			CandidateMatchesService.submitForVendorReview(requisitionId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: candidateMatchesKeys.all });
			queryClient.invalidateQueries({
				queryKey: candidateSubmissionsKeys.all,
			});
		},
	});
}

export function useCandidateSavedJobs(
	limit = 3,
	options?: { enabled?: boolean },
) {
	const enabled = options?.enabled ?? true;
	const params: CandidateMatchesQueryParams = {
		savedOnly: true,
		limit,
		page: 1,
	};
	return useQuery({
		queryKey: enabled
			? candidateMatchesKeys.list(params)
			: ([...candidateMatchesKeys.all, "list", "pending", params] as const),
		queryFn: () => CandidateMatchesService.getMatches(params),
		enabled,
		refetchOnMount: "always",
	});
}

export function useApplyToJob() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (vars: {
			requisitionId: string;
			summaryNote?: string;
			rtos?: Array<{ startDate: string; endDate?: string; label: string }>;
		}) => CandidateMatchesService.applyToJob(vars),
		onSuccess: (_data, vars) => {
			queryClient.invalidateQueries({ queryKey: candidateMatchesKeys.all });
			queryClient.invalidateQueries({
				queryKey: candidateMatchesKeys.detail(vars.requisitionId),
			});
			queryClient.invalidateQueries({
				queryKey: candidateSubmissionsKeys.all,
			});
		},
	});
}
