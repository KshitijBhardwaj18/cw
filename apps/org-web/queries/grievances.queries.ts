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
	logOptions: (orgId: string) =>
		[...grievancesKeys.all, "log-options", orgId] as const,
	counts: (orgId: string) => [...grievancesKeys.all, "counts", orgId] as const,
	list: (orgId: string, query: GrievanceListQuery) =>
		[...grievancesKeys.all, "list", orgId, query] as const,
	detail: (orgId: string, grievanceId: string) =>
		[...grievancesKeys.all, "detail", orgId, grievanceId] as const,
};

export function useGrievanceLogOptions(orgId: string, enabled = true) {
	return useQuery({
		queryKey: grievancesKeys.logOptions(orgId),
		queryFn: () => GrievancesService.getLogOptions(),
		enabled: enabled && !!orgId,
		staleTime: 60_000,
	});
}

export function useGrievanceCounts(orgId: string) {
	return useQuery({
		queryKey: grievancesKeys.counts(orgId),
		queryFn: () => GrievancesService.getCounts(),
		enabled: !!orgId,
		refetchOnMount: "always",
	});
}

export function useGrievancesList(orgId: string, query: GrievanceListQuery) {
	return useQuery({
		queryKey: grievancesKeys.list(orgId, query),
		queryFn: () => GrievancesService.list(query),
		enabled: !!orgId,
		refetchOnMount: "always",
	});
}

export function useGrievancesIndexSuspense(
	orgId: string,
	listQuery: GrievanceListQuery,
) {
	return useSuspenseQueries({
		queries: [
			{
				queryKey: grievancesKeys.counts(orgId),
				queryFn: () => GrievancesService.getCounts(),
				refetchOnMount: "always",
			},
			{
				queryKey: grievancesKeys.list(orgId, listQuery),
				queryFn: () => GrievancesService.list(listQuery),
				refetchOnMount: "always",
			},
		],
	});
}

export function useGrievanceDetail(orgId: string, grievanceId: string) {
	return useQuery({
		queryKey: grievancesKeys.detail(orgId, grievanceId),
		queryFn: () => GrievancesService.getById(grievanceId),
		enabled: !!orgId && !!grievanceId,
		refetchOnMount: "always",
	});
}

export function useCreateGrievance(_orgId: string) {
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

export function useCreateGrievanceTask(orgId: string, grievanceId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: CreateGrievanceTaskPayload) =>
			GrievancesService.createTask(grievanceId, body),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: grievancesKeys.detail(orgId, grievanceId),
			});
			void queryClient.invalidateQueries({
				queryKey: grievancesKeys.all,
			});
		},
	});
}

export function useUpdateGrievanceTask(orgId: string, grievanceId: string) {
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
				queryKey: grievancesKeys.detail(orgId, grievanceId),
			});
			void queryClient.invalidateQueries({
				queryKey: grievancesKeys.all,
			});
		},
	});
}
