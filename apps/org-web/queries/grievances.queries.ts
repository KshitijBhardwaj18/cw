import {
	useMutation,
	useQuery,
	useQueryClient,
	useSuspenseQueries,
} from "@tanstack/react-query";
import type {
	CreateGrievancePayload,
	CreateGrievanceTaskPayload,
	GrievanceListQuery,
} from "@/services/grievances.service";
import { GrievancesService } from "@/services/grievances.service";

export const grievancesKeys = {
	all: ["grievances"] as const,
	logOptions: () => [...grievancesKeys.all, "log-options"] as const,
	counts: () => [...grievancesKeys.all, "counts"] as const,
	list: (query: GrievanceListQuery) =>
		[...grievancesKeys.all, "list", query] as const,
	detail: (grievanceId: string) =>
		[...grievancesKeys.all, "detail", grievanceId] as const,
};

export function useGrievanceLogOptions(enabled = true) {
	return useQuery({
		queryKey: grievancesKeys.logOptions(),
		queryFn: () => GrievancesService.getLogOptions(),
		enabled: enabled,
		staleTime: 60_000,
	});
}

export function useGrievanceCounts() {
	return useQuery({
		queryKey: grievancesKeys.counts(),
		queryFn: () => GrievancesService.getCounts(),
		refetchOnMount: "always",
	});
}

export function useGrievancesList(query: GrievanceListQuery) {
	return useQuery({
		queryKey: grievancesKeys.list(query),
		queryFn: () => GrievancesService.list(query),
		refetchOnMount: "always",
	});
}

export function useGrievancesIndexSuspense(listQuery: GrievanceListQuery) {
	return useSuspenseQueries({
		queries: [
			{
				queryKey: grievancesKeys.counts(),
				queryFn: () => GrievancesService.getCounts(),
				refetchOnMount: "always",
			},
			{
				queryKey: grievancesKeys.list(listQuery),
				queryFn: () => GrievancesService.list(listQuery),
				refetchOnMount: "always",
			},
		],
	});
}

export function useGrievanceDetail(grievanceId: string) {
	return useQuery({
		queryKey: grievancesKeys.detail(grievanceId),
		queryFn: () => GrievancesService.getById(grievanceId),
		enabled: !!grievanceId,
		refetchOnMount: "always",
	});
}

export function useCreateGrievance() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: CreateGrievancePayload) =>
			GrievancesService.create(body),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: grievancesKeys.all,
			});
		},
	});
}

export function useCreateGrievanceTask(grievanceId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: CreateGrievanceTaskPayload) =>
			GrievancesService.createTask(grievanceId, body),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: grievancesKeys.detail(grievanceId),
			});
			void queryClient.invalidateQueries({
				queryKey: grievancesKeys.all,
			});
		},
	});
}

export function useUpdateGrievanceTask(grievanceId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			taskId,
			status,
		}: {
			taskId: string;
			status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
		}) => GrievancesService.updateTask(grievanceId, taskId, { status }),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: grievancesKeys.detail(grievanceId),
			});
			void queryClient.invalidateQueries({
				queryKey: grievancesKeys.all,
			});
		},
	});
}
