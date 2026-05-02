import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { InviteCandidateInput } from "@/services/talent-community.service";
import {
	type VendorCandidatesListQuery,
	VendorCandidatesService,
} from "@/services/vendor-candidates.service";

export const vendorCandidatesKeys = {
	all: ["vendor-candidates"] as const,
	metrics: () => [...vendorCandidatesKeys.all, "metrics"] as const,
	list: (query: VendorCandidatesListQuery) =>
		[...vendorCandidatesKeys.all, "list", query] as const,
	jobBoardProfile: (candidateId: string, previewKey?: string) =>
		[
			...vendorCandidatesKeys.all,
			"job-board-profile",
			candidateId,
			previewKey ?? "__saved",
		] as const,
};

export function useVendorCandidatesMetrics() {
	return useQuery({
		queryKey: vendorCandidatesKeys.metrics(),
		queryFn: () => VendorCandidatesService.getMetrics(),
		staleTime: 30_000,
		refetchOnMount: "always",
	});
}

export function useVendorCandidatesList(
	query: VendorCandidatesListQuery,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: vendorCandidatesKeys.list(query),
		queryFn: () => VendorCandidatesService.list(query),
		staleTime: 30_000,
		refetchOnMount: "always",
		enabled: options?.enabled ?? true,
	});
}

export function useVendorCandidateJobBoardProfile(
	candidateId: string | null,
	options?: {
		enabled?: boolean;
		previewOccupationId?: string;
		previewSpecialtyIds?: string[];
	},
) {
	const previewKey =
		options?.previewOccupationId != null && options.previewOccupationId !== ""
			? `${options.previewOccupationId}|${(options.previewSpecialtyIds ?? []).slice().sort().join(",")}`
			: "__saved";

	return useQuery({
		queryKey: vendorCandidatesKeys.jobBoardProfile(
			candidateId ?? "",
			previewKey,
		),
		queryFn: () =>
			VendorCandidatesService.getJobBoardProfile(candidateId as string, {
				previewOccupationId: options?.previewOccupationId,
				previewSpecialtyIds: options?.previewSpecialtyIds,
			}),
		enabled: (options?.enabled ?? true) && !!candidateId,
		staleTime: 60_000,
		refetchOnMount: "always",
	});
}

export function useInviteVendorCandidate() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (input: InviteCandidateInput) =>
			VendorCandidatesService.invite(input),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: vendorCandidatesKeys.all });
		},
	});
}

export function usePatchVendorCandidateJobBoardProfile() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (vars: {
			candidateId: string;
			body: Parameters<typeof VendorCandidatesService.patchJobBoardProfile>[1];
		}) =>
			VendorCandidatesService.patchJobBoardProfile(vars.candidateId, vars.body),
		onSuccess: (_data, vars) => {
			void qc.invalidateQueries({
				queryKey: [
					...vendorCandidatesKeys.all,
					"job-board-profile",
					vars.candidateId,
				],
			});
			void qc.invalidateQueries({ queryKey: vendorCandidatesKeys.all });
		},
	});
}
