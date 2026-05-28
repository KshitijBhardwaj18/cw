import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DOCUMENT_WALLET_DEFAULT_LIMIT } from "@/constants/document-wallet";
import { candidateMatchesKeys } from "@/queries/candidate-matches.queries";
import { candidatePlacementsKeys } from "@/queries/candidate-placements.queries";
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
			q.limit ?? DOCUMENT_WALLET_DEFAULT_LIMIT,
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
			qc.invalidateQueries({ queryKey: candidateMatchesKeys.all });
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

export function useMarkCandidateComplianceLinkSubmitted() {
	const qc = useQueryClient();
	return useMutation<{ success: true }, Error, string>({
		mutationFn: (complianceListItemId: string) =>
			CandidateDocumentWalletService.markLinkSubmitted(complianceListItemId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: candidateDocumentWalletKeys.all });
			qc.invalidateQueries({ queryKey: candidateMatchesKeys.all });
		},
	});
}

export function useUploadCandidateRequisitionComplianceItem(
	requisitionId: string,
) {
	const qc = useQueryClient();
	return useMutation<
		{ success: true },
		Error,
		CandidateDocumentWalletUploadVars
	>({
		mutationFn: (input) =>
			CandidateDocumentWalletService.uploadDocumentForRequisition(
				requisitionId,
				input,
			),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: candidateDocumentWalletKeys.all });
			qc.invalidateQueries({ queryKey: candidateMatchesKeys.all });
		},
	});
}

export function useMarkCandidateRequisitionComplianceLinkSubmitted(
	requisitionId: string,
) {
	const qc = useQueryClient();
	return useMutation<{ success: true }, Error, string>({
		mutationFn: (complianceListItemId: string) =>
			CandidateDocumentWalletService.markLinkSubmittedForRequisition(
				requisitionId,
				complianceListItemId,
			),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: candidateDocumentWalletKeys.all });
			qc.invalidateQueries({ queryKey: candidateMatchesKeys.all });
		},
	});
}

export function useUploadCandidatePlacementComplianceItem(placementId: string) {
	const qc = useQueryClient();
	return useMutation<
		{ success: true },
		Error,
		CandidateDocumentWalletUploadVars
	>({
		mutationFn: (input) =>
			CandidateDocumentWalletService.uploadDocumentForPlacement(
				placementId,
				input,
			),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: candidateDocumentWalletKeys.all });
			qc.invalidateQueries({
				queryKey: candidatePlacementsKeys.compliance(placementId),
			});
		},
	});
}

export function useMarkCandidatePlacementComplianceLinkSubmitted(
	placementId: string,
) {
	const qc = useQueryClient();
	return useMutation<{ success: true }, Error, string>({
		mutationFn: (complianceListItemId: string) =>
			CandidateDocumentWalletService.markLinkSubmittedForPlacement(
				placementId,
				complianceListItemId,
			),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: candidateDocumentWalletKeys.all });
			qc.invalidateQueries({
				queryKey: candidatePlacementsKeys.compliance(placementId),
			});
		},
	});
}
