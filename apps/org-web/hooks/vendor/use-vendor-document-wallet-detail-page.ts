"use client";

import { useLocalDebouncedSearch } from "@repo/ui/hooks/use-local-debounced-search";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
	DOCUMENT_WALLET_LIST_PAGE_SIZE,
	DOCUMENT_WALLET_SEARCH_DEBOUNCE_MS,
} from "@/constants/document-wallet";
import {
	useVendorCandidateDocumentSignedUrl,
	useVendorCandidateDocumentWalletItems,
	useVendorCandidateDocumentWalletSummary,
	useVendorUpdateCandidateComplianceStatus,
} from "@/queries/vendor-candidate-document-wallet.queries";
import type { CandidateDocumentWalletItem } from "@/types/candidate-document-wallet";

export function useVendorDocumentWalletDetailPage(candidateId: string) {
	const [page, setPage] = useState(1);
	const { search, debouncedSearch, setSearch } = useLocalDebouncedSearch("", {
		wait: DOCUMENT_WALLET_SEARCH_DEBOUNCE_MS,
	});
	const [categoryKey, setCategoryKey] = useState<string | undefined>();

	// biome-ignore lint/correctness/useExhaustiveDependencies: reset page when filters change
	useEffect(() => {
		setPage(1);
	}, [debouncedSearch, categoryKey]);

	const summaryQuery = useVendorCandidateDocumentWalletSummary(candidateId);
	const itemsQuery = useVendorCandidateDocumentWalletItems(candidateId, {
		page,
		limit: DOCUMENT_WALLET_LIST_PAGE_SIZE,
		search: debouncedSearch.trim() || undefined,
		categoryKey,
	});

	const signedUrlMutation = useVendorCandidateDocumentSignedUrl(candidateId);
	const updateStatusMutation =
		useVendorUpdateCandidateComplianceStatus(candidateId);
	const [reviewActionItemId, setReviewActionItemId] = useState<string | null>(
		null,
	);

	const openDocument = useCallback(
		(complianceListItemId: string) => {
			signedUrlMutation.mutate(complianceListItemId, {
				onSuccess: (data) => {
					window.open(data.signedUrl, "_blank", "noopener,noreferrer");
				},
				onError: (e) => {
					toast.error(
						e instanceof Error ? e.message : "Could not open document",
					);
				},
			});
		},
		[signedUrlMutation],
	);

	const runComplianceReview = useCallback(
		(item: CandidateDocumentWalletItem, status: "APPROVED" | "PENDING") => {
			const apiStatus = status === "APPROVED" ? "APPROVED" : "MISSING";
			setReviewActionItemId(item.complianceListItemId);
			updateStatusMutation.mutate(
				{
					complianceListItemId: item.complianceListItemId,
					body: { status: apiStatus },
				},
				{
					onSuccess: () => {
						toast.success(
							status === "APPROVED"
								? "Document approved."
								: "Document sent back. The candidate can upload a new file.",
						);
					},
					onError: (e) => {
						toast.error(
							e instanceof Error ? e.message : "Could not update status.",
						);
					},
					onSettled: () => {
						setReviewActionItemId(null);
					},
				},
			);
		},
		[updateStatusMutation],
	);

	return {
		page,
		setPage,
		search,
		setSearch,
		categoryKey,
		setCategoryKey,
		summaryQuery,
		itemsQuery,
		openDocument,
		runComplianceReview,
		reviewActionItemId,
	};
}
