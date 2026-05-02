import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	CreateTaggingRulePayload,
	UpdateTaggingRulePayload,
} from "@/services/tagging-rules.service";
import { TaggingRulesService } from "@/services/tagging-rules.service";

export const taggingRulesKeys = {
	all: ["tagging-rules"] as const,
	list: (organizationId: string) =>
		[...taggingRulesKeys.all, "list", organizationId] as const,
	tags: (organizationId: string) =>
		[...taggingRulesKeys.all, "tags", organizationId] as const,
	questions: (
		organizationId: string,
		sourceType: string,
		occupationId?: string,
		specialtyId?: string,
	) =>
		[
			...taggingRulesKeys.all,
			"questions",
			organizationId,
			sourceType,
			occupationId ?? "",
			specialtyId ?? "",
		] as const,
	tagsList: (organizationId: string) =>
		[...taggingRulesKeys.all, "tags-list", organizationId] as const,
};

export function useTaggingRulesQuery(organizationId: string) {
	return useQuery({
		queryKey: taggingRulesKeys.list(organizationId),
		queryFn: () => TaggingRulesService.getTaggingRules(organizationId),
		enabled: !!organizationId,
		refetchOnMount: "always",
	});
}

export function useTagsWithRuleCountsQuery(organizationId: string) {
	return useQuery({
		queryKey: taggingRulesKeys.tags(organizationId),
		queryFn: () => TaggingRulesService.getTagsWithRuleCounts(organizationId),
		enabled: !!organizationId,
		refetchOnMount: "always",
	});
}

export function useTaggingRulesQuestionsQuery(
	organizationId: string,
	sourceType: "OCCUPATION" | "SPECIALTY",
	organizationOccupationId?: string,
	organizationSpecialtyId?: string,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: taggingRulesKeys.questions(
			organizationId,
			sourceType,
			organizationOccupationId,
			organizationSpecialtyId,
		),
		queryFn: () =>
			TaggingRulesService.getQuestions(
				organizationId,
				sourceType,
				organizationOccupationId,
				organizationSpecialtyId,
			),
		enabled:
			(options?.enabled ?? true) &&
			!!organizationId &&
			!!sourceType &&
			(sourceType === "OCCUPATION"
				? !!organizationOccupationId
				: !!organizationSpecialtyId),
	});
}

export function useTaggingRulesTagsListQuery(
	organizationId: string,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: taggingRulesKeys.tagsList(organizationId),
		queryFn: () => TaggingRulesService.getTagsList(organizationId),
		enabled: (options?.enabled ?? true) && !!organizationId,
	});
}

export function useCreateTaggingRuleMutation(organizationId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateTaggingRulePayload) =>
			TaggingRulesService.createTaggingRule(organizationId, payload),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: taggingRulesKeys.list(organizationId),
			});
			void queryClient.invalidateQueries({
				queryKey: taggingRulesKeys.tags(organizationId),
			});
		},
	});
}

export function useUpdateTaggingRuleMutation(organizationId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			taggingRuleId,
			payload,
		}: {
			taggingRuleId: string;
			payload: UpdateTaggingRulePayload;
		}) =>
			TaggingRulesService.updateTaggingRule(
				organizationId,
				taggingRuleId,
				payload,
			),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: taggingRulesKeys.list(organizationId),
			});
			void queryClient.invalidateQueries({
				queryKey: taggingRulesKeys.tags(organizationId),
			});
		},
	});
}

export function useDeleteTaggingRuleMutation(organizationId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (taggingRuleId: string) =>
			TaggingRulesService.deleteTaggingRule(organizationId, taggingRuleId),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: taggingRulesKeys.list(organizationId),
			});
			void queryClient.invalidateQueries({
				queryKey: taggingRulesKeys.tags(organizationId),
			});
		},
	});
}
