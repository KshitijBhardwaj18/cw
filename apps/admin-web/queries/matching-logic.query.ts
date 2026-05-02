import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { MatchingLogicService } from "@/services/matching-logic.service";
import type { SaveMatchingLogicItem } from "@/types";

export const matchingLogicKeys = {
	all: ["matching-logic"] as const,
	list: (organizationId: string) =>
		[...matchingLogicKeys.all, "list", organizationId] as const,
};

export const useMatchingLogic = (organizationId: string) => {
	return useSuspenseQuery({
		queryKey: matchingLogicKeys.list(organizationId),
		queryFn: () => MatchingLogicService.getMatchingLogic(organizationId),
	});
};

export const useSaveMatchingLogic = (organizationId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (items: SaveMatchingLogicItem[]) =>
			MatchingLogicService.saveMatchingLogic(organizationId, items),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: matchingLogicKeys.list(organizationId),
			});
		},
	});
};
