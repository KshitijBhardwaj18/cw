import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DOCUMENT_WALLET_LIST_PAGE_SIZE } from "@/constants/document-wallet";
import type { CandidateDocumentWalletItemsQuery } from "@/services/candidate-document-wallet.service";
import { CandidateDocumentWalletService } from "@/services/candidate-document-wallet.service";
import type { CandidateDocumentWalletUploadVars } from "@/types/candidate-document-wallet";

export const candidateDocumentWalletKeys = {
	all: ["candidate-document-wallet"] as const,
	summary: () => [...candidateDocumentWalletKeys.all, "summary"] as const,
	items: (q: CandidateDocumentWalletItemsQuery) =>
		[
			...candidateDocumentWalletKeys.all,
			"items",
			q.page ?? 1,
			q.limit ?? DOCUMENT_WALLET_LIST_PAGE_SIZE,
			q.search ?? "",
			q.categoryKey ?? "",
		] as const,
	uploadOptions: () =>
		[...candidateDocumentWalletKeys.all, "upload-options"] as const,
};

export function useCandidateDocumentWalletSummary(options?: {
	enabled?: boolean;
}) {
	const enabled = options?.enabled ?? true;
	return useQuery({
		queryKey: enabled
			? candidateDocumentWalletKeys.summary()
			: ([...candidateDocumentWalletKeys.all, "summary", "pending"] as const),
		queryFn: () => CandidateDocumentWalletService.getSummary(),
		enabled,
		refetchOnMount: "always",
	});
}

export function useCandidateDocumentWalletUploadOptionsQuery(
	open: boolean,
	options?: { enabled?: boolean },
) {
	const enabled = (options?.enabled ?? true) && open;
	return useQuery({
		queryKey: enabled
			? candidateDocumentWalletKeys.uploadOptions()
			: ([
					...candidateDocumentWalletKeys.all,
					"upload-options",
					"pending",
				] as const),
		queryFn: () => CandidateDocumentWalletService.getUploadOptions(),
		enabled,
	});
}

export function useUploadCandidateDocumentWalletItem() {
	const qc = useQueryClient();

	return useMutation<
		{ success: true },
		Error,
		CandidateDocumentWalletUploadVars
	>({
		mutationFn: CandidateDocumentWalletService.uploadDocument,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: candidateDocumentWalletKeys.all });
		},
	});
}

export function useCandidateComplianceDocumentSignedUrl() {
	return useMutation<
		{ signedUrl: string },
		Error,
		{ complianceListItemId: string }
	>({
		mutationFn: ({ complianceListItemId }) =>
			CandidateDocumentWalletService.getSignedUrl(complianceListItemId),
	});
}
