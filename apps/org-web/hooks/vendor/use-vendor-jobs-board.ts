"use client";

import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { useUrlQueryState } from "@repo/ui/hooks/use-url-query-state";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useVendorRequisitionsList } from "@/queries/vendor-requisitions.queries";
import type { Candidate, Requisition } from "@/types/vendor-jobs-board";
import { mapListItemToRequisition } from "@/utils/vendor-job-board-mapper";

export function useVendorJobsBoard() {
	const searchParams = useSearchParams();
	const { pushParams } = useUrlQueryState();
	const { localSearch, searchFromUrl, handleSearchChange } = useDebouncedSearch(
		{ wait: 350, paramKey: "vjbSearch", pageParamKey: "vjbPage" },
	);

	const [selectedRequisition, setSelectedRequisition] =
		useState<Requisition | null>(null);
	const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);

	const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
		null,
	);
	const [isCandidateDialogOpen, setIsCandidateDialogOpen] = useState(false);

	const [selectedSubmitRequisition, setSelectedSubmitRequisition] =
		useState<Requisition | null>(null);
	const [isSelectionDialogOpen, setIsSelectionDialogOpen] = useState(false);
	const [submitCandidate, setSubmitCandidate] = useState<Candidate | null>(
		null,
	);
	const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

	const pageParam = Number(searchParams.get("vjbPage") ?? "1");
	const currentPage =
		Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
	const limitParam = Number(searchParams.get("vjbLimit") ?? "10");
	const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 10;

	const setCurrentPage = useCallback(
		(p: number) => {
			pushParams({ vjbPage: String(p) });
		},
		[pushParams],
	);

	const setLimit = useCallback(
		(l: number) => {
			pushParams({ vjbLimit: String(l), vjbPage: null });
		},
		[pushParams],
	);

	const listQuery = useVendorRequisitionsList({
		page: currentPage,
		limit,
		search: searchFromUrl.trim() || undefined,
	});

	const paginatedRequisitions = useMemo(() => {
		const rows = listQuery.data?.data ?? [];
		return rows.map(mapListItemToRequisition);
	}, [listQuery.data?.data]);

	const totalRequisitions = listQuery.data?.total ?? 0;
	const pageCount = listQuery.data?.totalPages ?? 1;

	const handleViewJobDetails = (requisition: Requisition) => {
		setSelectedRequisition(requisition);
		setIsJobDialogOpen(true);
	};

	const handleViewCandidate = (
		candidate: Candidate,
		requisition?: Requisition,
	) => {
		setSelectedCandidate(candidate);
		if (requisition) {
			setSelectedSubmitRequisition(requisition);
		}
		setIsCandidateDialogOpen(true);
	};

	const handleSubmitCandidate = (requisition: Requisition) => {
		setSelectedSubmitRequisition(requisition);
		setIsJobDialogOpen(false);
		setIsCandidateDialogOpen(false);
		setIsSelectionDialogOpen(true);
	};

	const handleSelectSubmitCandidate = (candidate: Candidate) => {
		setSubmitCandidate(candidate);
		setIsSelectionDialogOpen(false);
		setIsReviewDialogOpen(true);
	};

	const handleBackToSelection = () => {
		setIsReviewDialogOpen(false);
		setIsSelectionDialogOpen(true);
	};

	return {
		searchValue: localSearch,
		setSearchValue: handleSearchChange,

		selectedRequisition,
		isJobDialogOpen,
		setIsJobDialogOpen,

		selectedCandidate,
		isCandidateDialogOpen,
		setIsCandidateDialogOpen,

		selectedSubmitRequisition,
		isSelectionDialogOpen,
		setIsSelectionDialogOpen,
		submitCandidate,
		isReviewDialogOpen,
		setIsReviewDialogOpen,

		currentPage,
		setCurrentPage,
		limit,
		setLimit,

		handleViewJobDetails,
		handleViewCandidate,
		handleSubmitCandidate,
		handleSelectSubmitCandidate,
		handleBackToSelection,

		pageCount,
		paginatedRequisitions,
		totalRequisitions,

		listQuery,
	};
}
