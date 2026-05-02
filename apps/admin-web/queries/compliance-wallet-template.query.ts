import type { CombinationsFilter } from "@repo/shared";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { ComplianceWalletTemplateService } from "@/services";

export const complianceWalletTemplateKeys = {
	all: ["compliance-wallet-templates"] as const,
	byOrg: (organizationId: string) =>
		["compliance-wallet-templates", "org", organizationId] as const,
	detail: (walletId: string) =>
		["compliance-wallet-templates", "detail", walletId] as const,
	combinations: (
		organizationId: string,
		page: number,
		limit: number,
		search?: string,
		filter?: CombinationsFilter,
	) =>
		[
			"compliance-wallet-templates",
			"org",
			organizationId,
			"combinations",
			page,
			limit,
			search ?? "",
			filter ?? "all",
		] as const,
};

export function useCombinationsPaginated(
	organizationId: string,
	page = 1,
	limit = 10,
	search?: string,
	filter: CombinationsFilter = "all",
) {
	return useSuspenseQuery({
		queryKey: complianceWalletTemplateKeys.combinations(
			organizationId,
			page,
			limit,
			search,
			filter,
		),
		queryFn: () =>
			ComplianceWalletTemplateService.getCombinations(
				organizationId,
				page,
				limit,
				search,
				filter,
			),
	});
}

export function useWalletTemplateDetail(
	walletId: string,
	organizationId: string,
) {
	return useSuspenseQuery({
		queryKey: complianceWalletTemplateKeys.detail(walletId),
		queryFn: () =>
			ComplianceWalletTemplateService.getWalletTemplateDetail(
				walletId,
				organizationId,
			),
	});
}

export function useUpdateWalletItems(organizationId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			walletId,
			complianceListItemIds,
		}: {
			walletId: string;
			complianceListItemIds: string[];
		}) =>
			ComplianceWalletTemplateService.updateWalletItems(
				walletId,
				organizationId,
				complianceListItemIds,
			),
		onSuccess: (_, variables) => {
			void queryClient.invalidateQueries({
				queryKey: complianceWalletTemplateKeys.detail(variables.walletId),
			});
			void queryClient.invalidateQueries({
				predicate: (query) =>
					query.queryKey[0] === "compliance-wallet-templates" &&
					query.queryKey[1] === "org" &&
					query.queryKey[2] === organizationId,
			});
		},
	});
}

export function useDeleteWalletTemplate(organizationId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (walletId: string) =>
			ComplianceWalletTemplateService.deleteWalletTemplate(
				walletId,
				organizationId,
			),
		onSuccess: (_, walletId) => {
			void queryClient.invalidateQueries({
				queryKey: complianceWalletTemplateKeys.detail(walletId),
			});
			void queryClient.invalidateQueries({
				predicate: (query) =>
					query.queryKey[0] === "compliance-wallet-templates" &&
					query.queryKey[1] === "org" &&
					query.queryKey[2] === organizationId,
			});
		},
	});
}
