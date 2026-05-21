import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SubmissionStageKey } from "@/constants/submissions";
import type {
	OrgSubmissionsAgingStatsParams,
	OrgSubmissionsListParams,
} from "@/services/submissions.service";
import { SubmissionsService } from "@/services/submissions.service";

export const submissionsKeys = {
	all: ["submissions"] as const,
	statsRoot: (orgId: string) =>
		[...submissionsKeys.all, "org", orgId, "stats"] as const,
	statsStages: (orgId: string) =>
		[...submissionsKeys.statsRoot(orgId), "stages"] as const,
	statsAging: (orgId: string, params: Record<string, string | undefined>) =>
		[...submissionsKeys.statsRoot(orgId), "aging", params] as const,
	listsRoot: (orgId: string) =>
		[...submissionsKeys.all, "org", orgId, "list"] as const,
	list: (
		orgId: string,
		params: Record<string, string | number | boolean | undefined>,
	) => [...submissionsKeys.listsRoot(orgId), params] as const,
	/** Per-stage totals for a single requisition (tab badges on job details). */
	jobStageCounts: (orgId: string, requisitionId: string) =>
		[
			...submissionsKeys.all,
			"org",
			orgId,
			"job-stage-counts",
			requisitionId,
		] as const,
	detail: (orgId: string, submissionId: string) =>
		[...submissionsKeys.all, "detail", orgId, submissionId] as const,
};

function listParamsRecord(
	params: OrgSubmissionsListParams,
): Record<string, string | number | boolean | undefined> {
	return {
		stage: params.stage,
		agingBucket: params.agingBucket,
		requisitionId: params.requisitionId,
		search: params.search,
		vendorId: params.vendorId,
		hiringManagerId: params.hiringManagerId,
		departmentId: params.departmentId,
		locationId: params.locationId,
		page: params.page,
		limit: params.limit,
		all: params.all,
	};
}

function agingStatsParamsRecord(
	params: OrgSubmissionsAgingStatsParams,
): Record<string, string | undefined> {
	return {
		stage: params.stage,
		requisitionId: params.requisitionId,
		search: params.search,
		vendorId: params.vendorId,
		hiringManagerId: params.hiringManagerId,
		departmentId: params.departmentId,
		locationId: params.locationId,
	};
}

export function useJobSubmissionStageCounts(
	orgId: string | undefined,
	requisitionId: string | null,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: submissionsKeys.jobStageCounts(orgId ?? "", requisitionId ?? ""),
		queryFn: () =>
			SubmissionsService.getRequisitionStageCounts(requisitionId as string),
		enabled: (options?.enabled ?? true) && !!orgId && !!requisitionId,
		refetchOnMount: "always",
	});
}

export function useOrgSubmissionsList(
	orgId: string | undefined,
	params: OrgSubmissionsListParams,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: submissionsKeys.list(orgId ?? "", listParamsRecord(params)),
		queryFn: () => SubmissionsService.list(params),
		enabled: !!orgId && (options?.enabled ?? true),
		refetchOnMount: "always",
	});
}

export function useOrgSubmissionStageCounts(
	orgId: string | undefined,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: submissionsKeys.statsStages(orgId ?? ""),
		queryFn: () => SubmissionsService.getStageStats(),
		enabled: !!orgId && (options?.enabled ?? true),
		refetchOnMount: "always",
	});
}

export function useOrgSubmissionAgingCounts(
	orgId: string | undefined,
	params: OrgSubmissionsAgingStatsParams,
	options?: { enabled?: boolean },
) {
	const keyParams = agingStatsParamsRecord(params);
	return useQuery({
		queryKey: submissionsKeys.statsAging(orgId ?? "", keyParams),
		queryFn: () => SubmissionsService.getAgingStats(params),
		enabled: !!orgId && (options?.enabled ?? true),
		refetchOnMount: "always",
	});
}

export function useOrgSubmissionDetail(
	orgId: string | undefined,
	submissionId: string,
) {
	return useQuery({
		queryKey: submissionsKeys.detail(orgId ?? "", submissionId),
		queryFn: () => SubmissionsService.get(submissionId),
		enabled: !!orgId && !!submissionId,
		refetchOnMount: "always",
	});
}

export function useUpdateOrgSubmissionStage(orgId: string | undefined) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			submissionId,
			stage,
			startDate,
			endDate,
			billRate,
		}: {
			submissionId: string;
			stage: SubmissionStageKey;
			startDate?: string;
			endDate?: string;
			billRate?: number;
		}) =>
			SubmissionsService.updateStage(submissionId, {
				stage,
				startDate,
				endDate,
				billRate,
			}),
		onSuccess: (_data, variables) => {
			if (!orgId) return;
			void queryClient.invalidateQueries({
				queryKey: submissionsKeys.detail(orgId, variables.submissionId),
			});
			void queryClient.invalidateQueries({
				queryKey: submissionsKeys.listsRoot(orgId),
			});
			void queryClient.invalidateQueries({
				queryKey: [...submissionsKeys.all, "org", orgId, "job-stage-counts"],
			});
			void queryClient.invalidateQueries({
				queryKey: submissionsKeys.statsRoot(orgId),
			});
			// OFFERED creates a placement; ACCEPTED activates it — invalidate placements list
			if (variables.stage === "OFFERED" || variables.stage === "ACCEPTED") {
				void queryClient.invalidateQueries({ queryKey: ["placements"] });
			}
		},
	});
}
