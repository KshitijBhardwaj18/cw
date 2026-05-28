import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SubmissionStageKey } from "@/constants/submissions";
import { requisitionsKeys } from "@/queries/requisitions.queries";
import type {
	OrgSubmissionsAgingStatsParams,
	OrgSubmissionsListParams,
} from "@/services/submissions.service";
import { SubmissionsService } from "@/services/submissions.service";

export const submissionsKeys = {
	all: ["submissions"] as const,
	statsRoot: () => [...submissionsKeys.all, "org", "stats"] as const,
	statsStages: () => [...submissionsKeys.statsRoot(), "stages"] as const,
	statsAging: (params: Record<string, string | undefined>) =>
		[...submissionsKeys.statsRoot(), "aging", params] as const,
	listsRoot: () => [...submissionsKeys.all, "org", "list"] as const,
	list: (params: Record<string, string | number | boolean | undefined>) =>
		[...submissionsKeys.listsRoot(), params] as const,
	/** Per-stage totals for a single requisition (tab badges on job details). */
	jobStageCounts: (requisitionId: string) =>
		[...submissionsKeys.all, "org", "job-stage-counts", requisitionId] as const,
	detail: (submissionId: string) =>
		[...submissionsKeys.all, "detail", submissionId] as const,
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
	requisitionId: string | null,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: submissionsKeys.jobStageCounts(requisitionId ?? ""),
		queryFn: () =>
			SubmissionsService.getRequisitionStageCounts(requisitionId as string),
		enabled: (options?.enabled ?? true) && !!requisitionId,
		refetchOnMount: "always",
	});
}

export function useOrgSubmissionsList(
	params: OrgSubmissionsListParams,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: submissionsKeys.list(listParamsRecord(params)),
		queryFn: () => SubmissionsService.list(params),
		enabled: options?.enabled ?? true,
		refetchOnMount: "always",
	});
}

export function useOrgSubmissionStageCounts(options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: submissionsKeys.statsStages(),
		queryFn: () => SubmissionsService.getStageStats(),
		enabled: options?.enabled ?? true,
		refetchOnMount: "always",
	});
}

export function useOrgSubmissionAgingCounts(
	params: OrgSubmissionsAgingStatsParams,
	options?: { enabled?: boolean },
) {
	const keyParams = agingStatsParamsRecord(params);
	return useQuery({
		queryKey: submissionsKeys.statsAging(keyParams),
		queryFn: () => SubmissionsService.getAgingStats(params),
		enabled: options?.enabled ?? true,
		refetchOnMount: "always",
	});
}

export function useOrgSubmissionDetail(submissionId: string) {
	return useQuery({
		queryKey: submissionsKeys.detail(submissionId),
		queryFn: () => SubmissionsService.get(submissionId),
		enabled: !!submissionId,
		refetchOnMount: "always",
	});
}

export function useUpdateOrgSubmissionStage() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			submissionId,
			stage,
			startDate,
			endDate,
			billRate,
			interviewDate,
			interviewLocation,
			interviewNotes,
		}: {
			submissionId: string;
			stage: SubmissionStageKey;
			startDate?: string;
			endDate?: string;
			billRate?: number;
			interviewDate?: string;
			interviewLocation?: string;
			interviewNotes?: string;
		}) =>
			SubmissionsService.updateStage(submissionId, {
				stage,
				startDate,
				endDate,
				billRate,
				interviewDate,
				interviewLocation,
				interviewNotes,
			}),
		onSuccess: (_data, variables) => {
			void queryClient.invalidateQueries({
				queryKey: submissionsKeys.detail(variables.submissionId),
			});
			void queryClient.invalidateQueries({
				queryKey: submissionsKeys.listsRoot(),
			});
			void queryClient.invalidateQueries({
				queryKey: [...submissionsKeys.all, "org", "job-stage-counts"],
			});
			void queryClient.invalidateQueries({
				queryKey: submissionsKeys.statsRoot(),
			});
			void queryClient.invalidateQueries({
				queryKey: requisitionsKeys.all,
			});
			// OFFERED creates a placement; ACCEPTED activates it — invalidate placements list
			if (variables.stage === "OFFERED" || variables.stage === "ACCEPTED") {
				void queryClient.invalidateQueries({ queryKey: ["placements"] });
			}
		},
	});
}
