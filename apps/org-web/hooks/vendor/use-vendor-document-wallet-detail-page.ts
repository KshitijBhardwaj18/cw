"use client";

import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useSearchWithFilters } from "@repo/ui/hooks/use-search-with-filters";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { DOCUMENT_WALLET_LIST_PAGE_SIZE } from "@/constants/document-wallet";
import {
	useVendorCandidateDocumentSignedUrl,
	useVendorCandidateDocumentWalletItems,
	useVendorCandidateDocumentWalletSummary,
	useVendorUpdateCandidateComplianceStatus,
} from "@/queries/vendor-candidate-document-wallet.queries";
import type { CandidateDocumentWalletItem } from "@/types/candidate-document-wallet";

export const DWD_PARAMS = {
	PAGE: "dwdPage",
	SEARCH: "dwdSearch",
	CATEGORY: "dwdCategory",
} as const;

export function useVendorDocumentWalletDetailPage(candidateId: string) {
	const { page, setPage } = usePaginationControls({
		pageParamKey: DWD_PARAMS.PAGE,
		defaultLimit: DOCUMENT_WALLET_LIST_PAGE_SIZE,
	});

	const {
		searchValue: localSearch,
		searchFromUrl,
		handleSearchChange,
		values,
		onFilterChange,
	} = useSearchWithFilters({
		pagination: { pageParamKey: DWD_PARAMS.PAGE },
		search: { paramKey: DWD_PARAMS.SEARCH },
		filters: [
			{
				id: DWD_PARAMS.CATEGORY,
				label: "Category",
				type: "select",
				defaultValue: "all",
			},
		],
	});

	const categoryKey =
		values[DWD_PARAMS.CATEGORY] === "all"
			? undefined
			: values[DWD_PARAMS.CATEGORY];

	const setCategoryKey = useCallback(
		(val: string | undefined) => {
			onFilterChange(DWD_PARAMS.CATEGORY, val || "all");
		},
		[onFilterChange],
	);

	const summaryQuery = useVendorCandidateDocumentWalletSummary(candidateId);
	const itemsQuery = useVendorCandidateDocumentWalletItems(candidateId, {
		page,
		limit: DOCUMENT_WALLET_LIST_PAGE_SIZE,
		search: searchFromUrl.trim() || undefined,
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
		search: localSearch,
		setSearch: handleSearchChange,
		categoryKey,
		setCategoryKey,
		summaryQuery,
		itemsQuery,
		openDocument,
		runComplianceReview,
		reviewActionItemId,
	};
}
