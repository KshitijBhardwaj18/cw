import type { CandidateWorkforceType } from "@repo/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	WorkforceListMembersQuery,
	WorkforceListsQuery,
} from "@/services/workforce-lists.service";
import { WorkforceListsService } from "@/services/workforce-lists.service";

export const workforceListsKeys = {
	all: ["workforce-lists"] as const,
	lists: (orgId: string, query: WorkforceListsQuery) =>
		[...workforceListsKeys.all, "lists", orgId, query] as const,
	detail: (orgId: string, listId: string) =>
		[...workforceListsKeys.all, "detail", orgId, listId] as const,
	members: (orgId: string, listId: string, query: WorkforceListMembersQuery) =>
		[...workforceListsKeys.all, "members", orgId, listId, query] as const,
	availableCandidates: (
		orgId: string,
		listId: string,
		query: WorkforceListMembersQuery,
	) =>
		[
			...workforceListsKeys.all,
			"available-candidates",
			orgId,
			listId,
			query,
		] as const,
};

export function useWorkforceLists(orgId: string, query: WorkforceListsQuery) {
	return useQuery({
		queryKey: workforceListsKeys.lists(orgId, query),
		queryFn: () => WorkforceListsService.list(query),
		enabled: !!orgId,
		refetchOnMount: "always",
	});
}

export function useWorkforceList(orgId: string, listId: string) {
	return useQuery({
		queryKey: workforceListsKeys.detail(orgId, listId),
		queryFn: () => WorkforceListsService.get(listId),
		enabled: !!orgId && !!listId,
		refetchOnMount: "always",
	});
}

export function useWorkforceListMembers(
	orgId: string,
	listId: string,
	query: WorkforceListMembersQuery,
) {
	return useQuery({
		queryKey: workforceListsKeys.members(orgId, listId, query),
		queryFn: () => WorkforceListsService.listMembers(listId, query),
		enabled: !!orgId && !!listId,
		refetchOnMount: "always",
	});
}

export function useAvailableCandidates(
	orgId: string,
	listId: string,
	query: WorkforceListMembersQuery,
) {
	return useQuery({
		queryKey: workforceListsKeys.availableCandidates(orgId, listId, query),
		queryFn: () => WorkforceListsService.listAvailableCandidates(listId, query),
		enabled: !!orgId && !!listId,
		refetchOnMount: "always",
	});
}

export function useCreateWorkforceList(_orgId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: { name: string; description?: string }) =>
			WorkforceListsService.create(input),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: workforceListsKeys.all });
		},
	});
}

export function useDeleteWorkforceList(_orgId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (listId: string) => WorkforceListsService.remove(listId),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: workforceListsKeys.all });
		},
	});
}

export function useAddWorkforceListMembers(_orgId: string, listId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (candidateIds: string[]) =>
			WorkforceListsService.addMembers(listId, candidateIds),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: workforceListsKeys.all });
		},
	});
}

export function useRemoveWorkforceListMember(_orgId: string, listId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (memberId: string) =>
			WorkforceListsService.removeMember(listId, memberId),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: workforceListsKeys.all });
		},
	});
}

export function useBulkTagWorkforceList(_orgId: string, listId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: { tagName: string; memberIds?: string[] }) =>
			WorkforceListsService.bulkTag(listId, input),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: workforceListsKeys.all });
		},
	});
}

// re-export type for convenience in callers
export type { CandidateWorkforceType };
