import type { AgingRuleStageTransition } from "@repo/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type AgingRulesResponse,
	AgingRulesService,
	type UpsertAgingRulesPayload,
} from "@/services/aging-rules.service";

export const agingRulesKeys = {
	all: ["aging-rules"] as const,
	list: (organizationId: string) =>
		[...agingRulesKeys.all, "list", organizationId] as const,
};

export function useAgingRulesQuery(organizationId: string) {
	return useQuery({
		queryKey: agingRulesKeys.list(organizationId),
		queryFn: () => AgingRulesService.list(organizationId),
		enabled: !!organizationId,
		refetchOnMount: "always",
	});
}

export function useUpsertAgingRulesMutation(organizationId: string) {
	const queryClient = useQueryClient();
	return useMutation<AgingRulesResponse, Error, UpsertAgingRulesPayload>({
		mutationFn: (payload) => AgingRulesService.upsert(organizationId, payload),
		onSuccess: (data) => {
			queryClient.setQueryData(agingRulesKeys.list(organizationId), data);
			void queryClient.invalidateQueries({
				queryKey: agingRulesKeys.list(organizationId),
			});
		},
	});
}

export function useDeleteAgingRuleMutation(organizationId: string) {
	const queryClient = useQueryClient();
	return useMutation<void, Error, `${AgingRuleStageTransition}`>({
		mutationFn: (stageTransition) =>
			AgingRulesService.deleteOne(organizationId, stageTransition),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: agingRulesKeys.list(organizationId),
			});
		},
	});
}
