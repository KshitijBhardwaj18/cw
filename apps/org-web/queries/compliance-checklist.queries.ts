import {
	useMutation,
	useQuery,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import type {
	CreateChecklistInput,
	GetChecklistsParams,
	UpdateChecklistInput,
} from "@/services/compliance-checklist.service";
import { ComplianceChecklistService } from "@/services/compliance-checklist.service";

export const complianceChecklistKeys = {
	all: ["compliance-checklists"] as const,
	lists: () => [...complianceChecklistKeys.all, "list"] as const,
	list: (params?: GetChecklistsParams) =>
		[...complianceChecklistKeys.lists(), params] as const,
	detail: (id: string) =>
		[...complianceChecklistKeys.all, "detail", id] as const,
	activeItems: (search?: string) =>
		["compliance-list-items", "active", search] as const,
};

export function useComplianceChecklists(params?: GetChecklistsParams) {
	return useQuery({
		queryKey: complianceChecklistKeys.list(params),
		queryFn: () => ComplianceChecklistService.getChecklists(params),
		refetchOnMount: "always",
	});
}

export function useComplianceChecklistsSuspense(params?: GetChecklistsParams) {
	return useSuspenseQuery({
		queryKey: complianceChecklistKeys.list(params),
		queryFn: () => ComplianceChecklistService.getChecklists(params),
		refetchOnMount: "always",
	});
}

export function useComplianceChecklist(id: string) {
	return useQuery({
		queryKey: complianceChecklistKeys.detail(id),
		queryFn: () => ComplianceChecklistService.getChecklist(id),
		enabled: !!id,
	});
}

export function useActiveComplianceListItems(search?: string, enabled = true) {
	return useQuery({
		queryKey: complianceChecklistKeys.activeItems(search),
		queryFn: () => ComplianceChecklistService.getActiveListItems(search),
		staleTime: 5 * 60 * 1000,
		enabled,
	});
}

export function useCreateChecklist() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateChecklistInput) =>
			ComplianceChecklistService.createChecklist(input),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: complianceChecklistKeys.lists(),
			});
		},
	});
}

export function useUpdateChecklist(id: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: UpdateChecklistInput) =>
			ComplianceChecklistService.updateChecklist(id, input),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: complianceChecklistKeys.lists(),
			});
			void queryClient.invalidateQueries({
				queryKey: complianceChecklistKeys.detail(id),
			});
		},
	});
}

export function useDeleteChecklist() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => ComplianceChecklistService.deleteChecklist(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: complianceChecklistKeys.lists(),
			});
		},
	});
}

export function useDuplicateChecklist() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) =>
			ComplianceChecklistService.duplicateChecklist(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: complianceChecklistKeys.lists(),
			});
		},
	});
}
