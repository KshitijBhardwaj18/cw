"use client";

import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useSearchWithFilters } from "@repo/ui/hooks/use-search-with-filters";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import { useShiftTemplateLocations } from "@/queries/shift-templates.queries";
import { useOrgLinkedOccupationSpecialties } from "@/queries/talent-community.queries";
import { useVendorRequisitionsList } from "@/queries/vendor-requisitions.queries";
import type { Candidate, Requisition } from "@/types/vendor-jobs-board";
import { mapListItemToRequisition } from "@/utils/vendor-job-board-mapper";

export const VJB_PARAMS = {
	PAGE: "vjbPage",
	LIMIT: "vjbLimit",
	SEARCH: "vjbSearch",
	TAB: "vjbTab",
	SPECIALTY: "vjbSpecialty",
	LOCATION: "vjbLocation",
} as const;

export const VENDOR_JOBS_BOARD_TABS = ["all", "saved"] as const;
export type VendorJobsBoardTab = (typeof VENDOR_JOBS_BOARD_TABS)[number];

export const VJB_CANDIDATE_SELECTION_PARAMS = {
	PAGE: "vjbCandSelPage",
	LIMIT: "vjbCandSelLimit",
	SEARCH: "vjbCandSelSearch",
} as const;

export function useVendorJobsBoard() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const rawTab = searchParams.get(VJB_PARAMS.TAB);
	const tab: VendorJobsBoardTab = VENDOR_JOBS_BOARD_TABS.includes(
		rawTab as VendorJobsBoardTab,
	)
		? (rawTab as VendorJobsBoardTab)
		: "all";

	const setTab = useCallback(
		(next: VendorJobsBoardTab) => {
			const params = new URLSearchParams(searchParams.toString());
			if (next === "all") {
				params.delete(VJB_PARAMS.TAB);
			} else {
				params.set(VJB_PARAMS.TAB, next);
			}
			params.delete(VJB_PARAMS.PAGE);
			const qs = params.toString();
			router.replace(qs ? `?${qs}` : "?");
		},
		[router, searchParams],
	);

	const {
		page: currentPage,
		setPage: setCurrentPage,
		limit,
		setLimit,
	} = usePaginationControls({
		pageParamKey: VJB_PARAMS.PAGE,
		limitParamKey: VJB_PARAMS.LIMIT,
		defaultLimit: 5,
	});

	const { localSearch, searchFromUrl, handleSearchChange } = useDebouncedSearch(
		{
			wait: 350,
			paramKey: VJB_PARAMS.SEARCH,
			pageParamKey: VJB_PARAMS.PAGE,
		},
	);

	const specialtiesQuery = useOrgLinkedOccupationSpecialties();
	const locationsQuery = useShiftTemplateLocations();

	const {
		values,
		filterConfigs: hookFilterConfigs,
		onFilterChange,
	} = useSearchWithFilters({
		pagination: { pageParamKey: VJB_PARAMS.PAGE },
		search: { paramKey: VJB_PARAMS.SEARCH },
		filters: [
			{
				id: VJB_PARAMS.SPECIALTY,
				label: "Specialty",
				type: "select",
				defaultValue: "all",
				placeholder: "All specialties",
				options: [
					{ value: "all", label: "All specialties" },
					...(specialtiesQuery.data ?? []).map((s) => ({
						value: s.id,
						label: s.name,
					})),
				],
			},
			{
				id: VJB_PARAMS.LOCATION,
				label: "Location",
				type: "select",
				defaultValue: "all",
				placeholder: "All locations",
				options: [
					{ value: "all", label: "All locations" },
					...(locationsQuery.data ?? []).map((l) => ({
						value: l.id,
						label: l.name,
					})),
				],
			},
		],
	});

	const specialtyFilter = values[VJB_PARAMS.SPECIALTY] || "all";
	const locationFilter = values[VJB_PARAMS.LOCATION] || "all";
	const [filtersExpanded, setFiltersExpanded] = useState(false);

	const setSpecialtyFilter = useCallback(
		(v: string) => onFilterChange({ [VJB_PARAMS.SPECIALTY]: v || "all" }),
		[onFilterChange],
	);
	const setLocationFilter = useCallback(
		(v: string) => onFilterChange({ [VJB_PARAMS.LOCATION]: v || "all" }),
		[onFilterChange],
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

	const { fmtShortDate } = useUserTimezone();

	const listQuery = useVendorRequisitionsList({
		page: currentPage,
		limit,
		search: searchFromUrl.trim() || undefined,
		savedOnly: tab === "saved" ? true : undefined,
		...(specialtyFilter !== "all" ? { specialtyId: specialtyFilter } : {}),
		...(locationFilter !== "all" ? { locationId: locationFilter } : {}),
	});

	const allCountQuery = useVendorRequisitionsList({ page: 1, limit: 1 });
	const savedCountQuery = useVendorRequisitionsList({
		page: 1,
		limit: 1,
		savedOnly: true,
	});

	const paginatedRequisitions = useMemo(() => {
		const rows = listQuery.data?.data ?? [];
		return rows.map((r) => mapListItemToRequisition(r, fmtShortDate));
	}, [listQuery.data?.data, fmtShortDate]);

	const totalRequisitions = listQuery.data?.total ?? 0;
	const pageCount = listQuery.data?.totalPages ?? 1;
	const totalOpenings = listQuery.data?.totalOpenings ?? 0;
	const averageBillRate = listQuery.data?.averageBillRate ?? null;

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

	const handleDetailSubmitCandidate = (
		requisition: Requisition,
		candidate: Candidate,
	) => {
		setSelectedSubmitRequisition(requisition);
		setSubmitCandidate(candidate);
		setIsJobDialogOpen(false);
		setIsCandidateDialogOpen(false);
		setIsSelectionDialogOpen(false);
		setIsReviewDialogOpen(true);
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

	const filterConfigs = useMemo(
		() =>
			hookFilterConfigs.map((cfg) => {
				if (cfg.id === VJB_PARAMS.SPECIALTY) {
					return { ...cfg, onValueChange: setSpecialtyFilter };
				}
				if (cfg.id === VJB_PARAMS.LOCATION) {
					return { ...cfg, onValueChange: setLocationFilter };
				}
				return cfg;
			}),
		[hookFilterConfigs, setSpecialtyFilter, setLocationFilter],
	);

	return {
		searchValue: localSearch,
		setSearchValue: handleSearchChange,

		filterConfigs,
		filtersExpanded,
		setFiltersExpanded,

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
		handleDetailSubmitCandidate,
		handleSelectSubmitCandidate,
		handleBackToSelection,

		pageCount,
		paginatedRequisitions,
		totalRequisitions,
		totalOpenings,
		averageBillRate,

		tab,
		setTab,
		allCount: allCountQuery.data?.total ?? 0,
		savedCount: savedCountQuery.data?.total ?? 0,

		listQuery,
	};
}
