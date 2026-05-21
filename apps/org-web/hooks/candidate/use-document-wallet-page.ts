"use client";

import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useSearchWithFilters } from "@repo/ui/hooks/use-search-with-filters";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
	DOCUMENT_WALLET_LIST_PAGE_SIZE,
	DOCUMENT_WALLET_SEARCH_DEBOUNCE_MS,
	DOCUMENT_WALLET_URL_KEYS as U,
} from "@/constants/document-wallet";
import {
	candidateDocumentWalletKeys,
	useCandidateComplianceDocumentSignedUrl,
	useCandidateDocumentWalletUploadOptionsQuery,
	useUploadCandidateDocumentWalletItem,
} from "@/queries/candidate-document-wallet.queries";
import { CandidateDocumentWalletService } from "@/services/candidate-document-wallet.service";
import { useCandidateOrganizationId } from "./use-candidate-organization-id";

export function useDocumentWalletPage() {
	const {
		organizationId: orgId,
		isLoading: onboardingLoading,
		isReady,
	} = useCandidateOrganizationId();

	const organizationId = orgId ?? "";
	const hasOrg = Boolean(organizationId);

	const {
		searchValue: localSearch,
		searchFromUrl,
		handleSearchChange,
		values,
		onFilterChange,
	} = useSearchWithFilters({
		search: {
			paramKey: U.search,
			wait: DOCUMENT_WALLET_SEARCH_DEBOUNCE_MS,
		},
		pagination: { pageParamKey: U.page },
		filters: [
			{
				id: U.category,
				label: "Category",
				defaultValue: "",
			},
		],
	});

	const { page, setPage } = usePaginationControls({
		pageParamKey: U.page,
		defaultLimit: DOCUMENT_WALLET_LIST_PAGE_SIZE,
	});

	const categoryRaw = values[U.category];
	const categoryKey =
		categoryRaw && categoryRaw.trim() !== "" ? categoryRaw : undefined;

	const setCategoryKey = useCallback(
		(next: string | undefined) => {
			onFilterChange(U.category, next ?? "");
		},
		[onFilterChange],
	);

	const listEnabled = hasOrg && isReady;

	const summaryQuery = useQuery({
		queryKey: listEnabled
			? candidateDocumentWalletKeys.summary()
			: ([...candidateDocumentWalletKeys.all, "summary", "pending"] as const),
		queryFn: () => CandidateDocumentWalletService.getSummary(),
		enabled: listEnabled,
		refetchOnMount: "always",
	});

	const itemsQuery = useQuery({
		queryKey: listEnabled
			? candidateDocumentWalletKeys.items({
					page,
					limit: DOCUMENT_WALLET_LIST_PAGE_SIZE,
					search: searchFromUrl.trim() || undefined,
					categoryKey,
				})
			: ([
					...candidateDocumentWalletKeys.all,
					"items",
					"pending",
					page,
					DOCUMENT_WALLET_LIST_PAGE_SIZE,
					searchFromUrl,
					categoryKey ?? "",
				] as const),
		queryFn: () =>
			CandidateDocumentWalletService.getItems({
				page,
				limit: DOCUMENT_WALLET_LIST_PAGE_SIZE,
				search: searchFromUrl.trim() || undefined,
				categoryKey,
			}),
		enabled: listEnabled,
		refetchOnMount: "always",
		placeholderData: (previousData) => previousData,
	});

	const [uploadOpen, setUploadOpen] = useState(false);
	const [defaultComplianceListItemId, setDefaultComplianceListItemId] =
		useState<string | undefined>();

	const uploadOptionsQuery = useCandidateDocumentWalletUploadOptionsQuery(
		uploadOpen,
		{ enabled: listEnabled },
	);

	const uploadMutation = useUploadCandidateDocumentWalletItem();
	const signedUrlMutation = useCandidateComplianceDocumentSignedUrl();

	const openDocument = useCallback(
		(complianceListItemId: string) => {
			if (!listEnabled) return;
			signedUrlMutation.mutate(
				{ complianceListItemId },
				{
					onSuccess: (data) => {
						window.open(data.signedUrl, "_blank", "noopener,noreferrer");
					},
					onError: (e) => {
						toast.error(
							e instanceof Error ? e.message : "Could not open document",
						);
					},
				},
			);
		},
		[listEnabled, signedUrlMutation],
	);

	const openUpload = useCallback((complianceListItemId?: string) => {
		setDefaultComplianceListItemId(complianceListItemId);
		setUploadOpen(true);
	}, []);

	return {
		onboardingLoading,
		organizationId: hasOrg ? organizationId : null,
		summary: summaryQuery.data,
		isSummaryLoading: summaryQuery.isLoading,
		items: itemsQuery.data,
		isItemsLoading: itemsQuery.isLoading,
		setPage,
		search: localSearch,
		setSearch: handleSearchChange,
		categoryKey,
		setCategoryKey,
		uploadMutation,
		openDocument,
		openUpload,
		uploadOpen,
		setUploadOpen,
		uploadOptionsQuery,
		defaultComplianceListItemId,
	};
}
