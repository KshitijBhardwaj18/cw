import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type VendorCandidateDocumentWalletItemsQuery,
	VendorCandidateDocumentWalletService,
} from "@/services/vendor-candidate-document-wallet.service";

export const vendorCandidateDocumentWalletKeys = {
	all: ["vendor-candidate-document-wallet"] as const,
	summary: (candidateId: string) =>
		[...vendorCandidateDocumentWalletKeys.all, "summary", candidateId] as const,
	items: (
		candidateId: string,
		query: VendorCandidateDocumentWalletItemsQuery,
	) =>
		[
			...vendorCandidateDocumentWalletKeys.all,
			"items",
			candidateId,
			query,
		] as const,
};

export function useVendorCandidateDocumentWalletSummary(
	candidateId: string | null | undefined,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: vendorCandidateDocumentWalletKeys.summary(candidateId ?? ""),
		queryFn: () =>
			VendorCandidateDocumentWalletService.getSummary(candidateId as string),
		enabled: (options?.enabled ?? true) && !!candidateId,
		refetchOnMount: "always",
	});
}

export function useVendorCandidateDocumentWalletItems(
	candidateId: string | null | undefined,
	query: VendorCandidateDocumentWalletItemsQuery,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: vendorCandidateDocumentWalletKeys.items(candidateId ?? "", query),
		queryFn: () =>
			VendorCandidateDocumentWalletService.getItems(
				candidateId as string,
				query,
			),
		enabled: (options?.enabled ?? true) && !!candidateId,
		refetchOnMount: "always",
		placeholderData: (previousData) => previousData,
	});
}

export function useVendorCandidateDocumentSignedUrl(candidateId: string) {
	return useMutation({
		mutationFn: (complianceListItemId: string) =>
			VendorCandidateDocumentWalletService.getSignedUrl(
				candidateId,
				complianceListItemId,
			),
	});
}

export function useVendorUpdateCandidateComplianceStatus(candidateId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			complianceListItemId,
			body,
		}: {
			complianceListItemId: string;
			body: { status: string; notes?: string; expiryDate?: string };
		}) =>
			VendorCandidateDocumentWalletService.updateComplianceStatus(
				candidateId,
				complianceListItemId,
				body,
			),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: vendorCandidateDocumentWalletKeys.summary(candidateId),
			});
			void queryClient.invalidateQueries({
				queryKey: [
					...vendorCandidateDocumentWalletKeys.all,
					"items",
					candidateId,
				],
			});
		},
	});
}
