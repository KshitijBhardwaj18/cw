import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CandidatePlacementsService } from "@/services/candidate-placements.service";
import type { UpsertCandidateTimecardPayload } from "@/types/candidate-timecard";

export const candidatePlacementsKeys = {
	all: ["candidate-placements"] as const,
	counts: () => [...candidatePlacementsKeys.all, "counts"] as const,
	list: () => [...candidatePlacementsKeys.all, "list"] as const,
	detail: (placementId: string) =>
		[...candidatePlacementsKeys.all, "detail", placementId] as const,
	offerHistory: (placementId: string) =>
		[...candidatePlacementsKeys.all, "offer-history", placementId] as const,
	compliance: (placementId: string) =>
		[...candidatePlacementsKeys.all, "compliance", placementId] as const,
	timecards: (placementId: string) =>
		[...candidatePlacementsKeys.all, "timecards", placementId] as const,
	timecardDetail: (placementId: string, timecardId: string) =>
		[
			...candidatePlacementsKeys.all,
			"timecard-detail",
			placementId,
			timecardId,
		] as const,
};

export function useCandidatePlacementsList(options?: { enabled?: boolean }) {
	const enabled = options?.enabled ?? true;
	return useQuery({
		queryKey: enabled
			? candidatePlacementsKeys.list()
			: ([...candidatePlacementsKeys.all, "list", "pending"] as const),
		queryFn: () => CandidatePlacementsService.list(),
		enabled,
		refetchOnMount: "always",
	});
}

export function useCandidatePlacementsCounts(options?: { enabled?: boolean }) {
	const enabled = options?.enabled ?? true;
	return useQuery({
		queryKey: enabled
			? candidatePlacementsKeys.counts()
			: ([...candidatePlacementsKeys.all, "counts", "pending"] as const),
		queryFn: () => CandidatePlacementsService.getCounts(),
		enabled,
		refetchOnMount: "always",
	});
}

export function useCandidatePlacementDetail(
	placementId: string,
	options?: { enabled?: boolean },
) {
	const enabled = (options?.enabled ?? true) && Boolean(placementId);
	return useQuery({
		queryKey: enabled
			? candidatePlacementsKeys.detail(placementId)
			: ([
					...candidatePlacementsKeys.all,
					"detail",
					"pending",
					placementId,
				] as const),
		queryFn: () => CandidatePlacementsService.getDetail(placementId),
		enabled,
		refetchOnMount: "always",
	});
}

export function useCandidatePlacementOfferHistory(
	placementId: string,
	queryEnabled: boolean,
	options?: { enabled?: boolean },
) {
	const enabled =
		(options?.enabled ?? true) && Boolean(placementId) && queryEnabled;
	return useQuery({
		queryKey: enabled
			? candidatePlacementsKeys.offerHistory(placementId)
			: ([
					...candidatePlacementsKeys.all,
					"offer-history",
					"pending",
					placementId,
				] as const),
		queryFn: () => CandidatePlacementsService.getOfferHistory(placementId),
		enabled,
		refetchOnMount: "always",
	});
}

export function useCandidatePlacementCompliance(
	placementId: string,
	queryEnabled: boolean,
	options?: { enabled?: boolean },
) {
	const enabled =
		(options?.enabled ?? true) && Boolean(placementId) && queryEnabled;
	return useQuery({
		queryKey: enabled
			? candidatePlacementsKeys.compliance(placementId)
			: ([
					...candidatePlacementsKeys.all,
					"compliance",
					"pending",
					placementId,
				] as const),
		queryFn: () => CandidatePlacementsService.getCompliance(placementId),
		enabled,
		refetchOnMount: "always",
	});
}

export function useCandidatePlacementTimecards(
	placementId: string,
	queryEnabled: boolean,
	options?: { enabled?: boolean },
) {
	const enabled =
		(options?.enabled ?? true) && Boolean(placementId) && queryEnabled;
	return useQuery({
		queryKey: enabled
			? candidatePlacementsKeys.timecards(placementId)
			: ([
					...candidatePlacementsKeys.all,
					"timecards",
					"pending",
					placementId,
				] as const),
		queryFn: () => CandidatePlacementsService.getTimecards(placementId),
		enabled,
		refetchOnMount: "always",
	});
}

export function useCandidateTimecardDetail(
	placementId: string,
	timecardId: string | null,
	queryEnabled: boolean,
	options?: { enabled?: boolean },
) {
	const enabled =
		(options?.enabled ?? true) &&
		Boolean(placementId && timecardId) &&
		queryEnabled;
	return useQuery({
		queryKey: enabled
			? candidatePlacementsKeys.timecardDetail(placementId, timecardId ?? "")
			: ([
					...candidatePlacementsKeys.all,
					"timecard-detail",
					"pending",
					placementId,
					timecardId ?? "",
				] as const),
		queryFn: () => {
			if (!timecardId) {
				throw new Error("timecardId required");
			}
			return CandidatePlacementsService.getTimecardDetail(
				placementId,
				timecardId,
			);
		},
		enabled,
		refetchOnMount: "always",
	});
}

export function useUpsertCandidateTimecard(placementId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: UpsertCandidateTimecardPayload) =>
			CandidatePlacementsService.upsertTimecard(placementId, payload),
		onSuccess: (data) => {
			void queryClient.invalidateQueries({
				queryKey: candidatePlacementsKeys.timecards(placementId),
			});
			if (data.timesheetId) {
				void queryClient.invalidateQueries({
					queryKey: candidatePlacementsKeys.timecardDetail(
						placementId,
						data.timesheetId,
					),
				});
			}
		},
	});
}
