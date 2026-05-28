import type { CandidateWorkforceType } from "@repo/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	WorkforceListMembersQuery,
	WorkforceListsQuery,
} from "@/services/workforce-lists.service";
import { WorkforceListsService } from "@/services/workforce-lists.service";

export const workforceListsKeys = {
	all: ["workforce-lists"] as const,
	lists: (query: WorkforceListsQuery) =>
		[...workforceListsKeys.all, "lists", query] as const,
	detail: (listId: string) =>
		[...workforceListsKeys.all, "detail", listId] as const,
	members: (listId: string, query: WorkforceListMembersQuery) =>
		[...workforceListsKeys.all, "members", listId, query] as const,
	availableCandidates: (listId: string, query: WorkforceListMembersQuery) =>
		[...workforceListsKeys.all, "available-candidates", listId, query] as const,
};

export function useWorkforceLists(query: WorkforceListsQuery) {
	return useQuery({
		queryKey: workforceListsKeys.lists(query),
		queryFn: () => WorkforceListsService.list(query),
		refetchOnMount: "always",
	});
}

export function useWorkforceList(listId: string) {
	return useQuery({
		queryKey: workforceListsKeys.detail(listId),
		queryFn: () => WorkforceListsService.get(listId),
		enabled: !!listId,
		refetchOnMount: "always",
	});
}

export function useWorkforceListMembers(
	listId: string,
	query: WorkforceListMembersQuery,
) {
	return useQuery({
		queryKey: workforceListsKeys.members(listId, query),
		queryFn: () => WorkforceListsService.listMembers(listId, query),
		enabled: !!listId,
		refetchOnMount: "always",
	});
}

export function useAvailableCandidates(
	listId: string,
	query: WorkforceListMembersQuery,
) {
	return useQuery({
		queryKey: workforceListsKeys.availableCandidates(listId, query),
		queryFn: () => WorkforceListsService.listAvailableCandidates(listId, query),
		enabled: !!listId,
		refetchOnMount: "always",
	});
}

export function useCreateWorkforceList() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: { name: string; description?: string }) =>
			WorkforceListsService.create(input),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: workforceListsKeys.all });
		},
	});
}

export function useDeleteWorkforceList() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (listId: string) => WorkforceListsService.remove(listId),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: workforceListsKeys.all });
		},
	});
}

export function useAddWorkforceListMembers(listId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (candidateIds: string[]) =>
			WorkforceListsService.addMembers(listId, candidateIds),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: workforceListsKeys.all });
		},
	});
}

export function useRemoveWorkforceListMember(listId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (memberId: string) =>
			WorkforceListsService.removeMember(listId, memberId),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: workforceListsKeys.all });
		},
	});
}

export function useBulkTagWorkforceList(listId: string) {
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
