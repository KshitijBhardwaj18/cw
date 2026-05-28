import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type RequisitionAttentionRulesResponse,
	RequisitionAttentionRulesService,
	type UpsertRequisitionAttentionRulesPayload,
} from "@/services/requisition-attention-rules.service";

export const requisitionAttentionRulesKeys = {
	all: ["requisition-attention-rules"] as const,
	list: (organizationId: string) =>
		[...requisitionAttentionRulesKeys.all, "list", organizationId] as const,
};

export function useRequisitionAttentionRulesQuery(organizationId: string) {
	return useQuery({
		queryKey: requisitionAttentionRulesKeys.list(organizationId),
		queryFn: () => RequisitionAttentionRulesService.list(organizationId),
		enabled: !!organizationId,
		refetchOnMount: "always",
	});
}

export function useUpsertRequisitionAttentionRulesMutation(
	organizationId: string,
) {
	const queryClient = useQueryClient();
	return useMutation<
		RequisitionAttentionRulesResponse,
		Error,
		UpsertRequisitionAttentionRulesPayload
	>({
		mutationFn: (payload) =>
			RequisitionAttentionRulesService.upsert(organizationId, payload),
		onSuccess: (data) => {
			queryClient.setQueryData(
				requisitionAttentionRulesKeys.list(organizationId),
				data,
			);
			void queryClient.invalidateQueries({
				queryKey: requisitionAttentionRulesKeys.list(organizationId),
			});
		},
	});
}
