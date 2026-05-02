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
	lists: (orgId: string) =>
		[...complianceChecklistKeys.all, "list", orgId] as const,
	list: (orgId: string, params?: GetChecklistsParams) =>
		[...complianceChecklistKeys.lists(orgId), params] as const,
	detail: (orgId: string, id: string) =>
		[...complianceChecklistKeys.all, "detail", orgId, id] as const,
	activeItems: (search?: string) =>
		["compliance-list-items", "active", search] as const,
};

export function useComplianceChecklists(
	orgId: string,
	params?: GetChecklistsParams,
) {
	return useQuery({
		queryKey: complianceChecklistKeys.list(orgId, params),
		queryFn: () => ComplianceChecklistService.getChecklists(params),
		enabled: !!orgId,
		refetchOnMount: "always",
	});
}

export function useComplianceChecklistsSuspense(
	orgId: string,
	params?: GetChecklistsParams,
) {
	return useSuspenseQuery({
		queryKey: complianceChecklistKeys.list(orgId, params),
		queryFn: () => ComplianceChecklistService.getChecklists(params),
		refetchOnMount: "always",
	});
}

export function useComplianceChecklist(orgId: string, id: string) {
	return useQuery({
		queryKey: complianceChecklistKeys.detail(orgId, id),
		queryFn: () => ComplianceChecklistService.getChecklist(id),
		enabled: !!orgId && !!id,
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

export function useCreateChecklist(orgId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateChecklistInput) =>
			ComplianceChecklistService.createChecklist(input),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: complianceChecklistKeys.lists(orgId),
			});
		},
	});
}

export function useUpdateChecklist(orgId: string, id: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: UpdateChecklistInput) =>
			ComplianceChecklistService.updateChecklist(id, input),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: complianceChecklistKeys.lists(orgId),
			});
			void queryClient.invalidateQueries({
				queryKey: complianceChecklistKeys.detail(orgId, id),
			});
		},
	});
}

export function useDeleteChecklist(orgId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => ComplianceChecklistService.deleteChecklist(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: complianceChecklistKeys.lists(orgId),
			});
		},
	});
}

export function useDuplicateChecklist(orgId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) =>
			ComplianceChecklistService.duplicateChecklist(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: complianceChecklistKeys.lists(orgId),
			});
		},
	});
}
