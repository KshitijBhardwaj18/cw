"use client";

import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useSearchWithFilters } from "@repo/ui/hooks/use-search-with-filters";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import {
	buildContractTypeOptions,
	buildLocationOptions,
	buildShiftTypeOptions,
	buildSpecialtyOptions,
	CANDIDATE_JOB_SEARCH_DEFAULT_LIMIT,
	CANDIDATE_JOB_SEARCH_PAGE_SIZE_OPTIONS,
	CANDIDATE_MATCHES_SHIFT_TYPE_ORDER,
	CANDIDATE_MATCHES_TABS,
	type CandidateMatchesTab,
	CONTRACT_TYPE_LABELS,
	CANDIDATE_MATCHES_URL_KEYS as U,
} from "@/constants/candidate/matches-and-job-search";
import { useCandidateMatches } from "@/queries/candidate-matches.queries";
import { useCandidateOccupationSpecialties } from "@/queries/candidate-org-occupations.queries";
import { useOrganizationLocationsForOnboarding } from "@/queries/organizations.queries";
import { useCandidateOrganizationId } from "./use-candidate-organization-id";

export function useMatchesAndJobSearchPage() {
	const { organizationId, occupationId } = useCandidateOrganizationId();
	const router = useRouter();
	const searchParams = useSearchParams();
	const rawTab = searchParams.get(U.tab);
	const tab: CandidateMatchesTab = CANDIDATE_MATCHES_TABS.includes(
		rawTab as CandidateMatchesTab,
	)
		? (rawTab as CandidateMatchesTab)
		: "all";

	const setTab = useCallback(
		(next: CandidateMatchesTab) => {
			const params = new URLSearchParams(searchParams.toString());
			if (next === "all") {
				params.delete(U.tab);
			} else {
				params.set(U.tab, next);
			}
			params.delete(U.page);
			const qs = params.toString();
			router.replace(qs ? `?${qs}` : "?");
		},
		[router, searchParams],
	);

	const { page, limit, setPage, setLimit } = usePaginationControls({
		pageParamKey: U.page,
		limitParamKey: U.limit,
		defaultLimit: CANDIDATE_JOB_SEARCH_DEFAULT_LIMIT,
		pageSizeOptions: CANDIDATE_JOB_SEARCH_PAGE_SIZE_OPTIONS,
	});

	const {
		searchValue: localSearch,
		searchFromUrl,
		handleSearchChange,
		values,
		onFilterChange,
	} = useSearchWithFilters({
		pagination: { pageParamKey: U.page },
		search: { paramKey: U.search },
		filters: [
			{
				id: U.specialty,
				label: "Specialty",
				type: "select",
				defaultValue: "all",
			},
			{
				id: U.location,
				label: "Location",
				type: "select",
				defaultValue: "all",
			},
			{
				id: U.shiftType,
				label: "Shift type",
				type: "select",
				defaultValue: "all",
			},
			{
				id: U.contractType,
				label: "Contract type",
				type: "select",
				defaultValue: "all",
			},
		],
	});

	const specialtyId = values[U.specialty] || "all";
	const locationId = values[U.location] || "all";
	const shiftType = values[U.shiftType] || "all";
	const contractType = values[U.contractType] || "all";

	const [filtersExpanded, setFiltersExpanded] = useState(false);

	const locationsQuery = useOrganizationLocationsForOnboarding();

	const specialtiesQuery = useCandidateOccupationSpecialties(occupationId, {
		enabled: Boolean(organizationId),
	});

	const queryParams = useMemo(
		() => ({
			page,
			limit,
			search: searchFromUrl.trim() || undefined,
			specialtyId: specialtyId !== "all" ? specialtyId : undefined,
			locationId: locationId !== "all" ? locationId : undefined,
			shiftType: shiftType !== "all" ? shiftType : undefined,
			contractType: contractType !== "all" ? contractType : undefined,
			savedOnly: tab === "saved" ? true : undefined,
		}),
		[
			page,
			limit,
			searchFromUrl,
			specialtyId,
			locationId,
			shiftType,
			contractType,
			tab,
		],
	);

	const matchesQuery = useCandidateMatches(queryParams, {
		enabled: Boolean(organizationId),
	});

	const savedCountQuery = useCandidateMatches(
		{ savedOnly: true, page: 1, limit: 1 },
		{ enabled: Boolean(organizationId) },
	);
	const allCountQuery = useCandidateMatches(
		{ page: 1, limit: 1 },
		{ enabled: Boolean(organizationId) },
	);

	const handleSpecialtyChange = useCallback(
		(v: string) => {
			onFilterChange(U.specialty, v || "all");
		},
		[onFilterChange],
	);

	const handleLocationChange = useCallback(
		(v: string) => {
			onFilterChange(U.location, v || "all");
		},
		[onFilterChange],
	);

	const handleShiftTypeChange = useCallback(
		(v: string) => {
			onFilterChange(U.shiftType, v || "all");
		},
		[onFilterChange],
	);

	const handleContractTypeChange = useCallback(
		(v: string) => {
			onFilterChange(U.contractType, v || "all");
		},
		[onFilterChange],
	);

	const filterConfigs = useMemo(() => {
		const locations = locationsQuery.data?.data ?? [];
		const specialties = (specialtiesQuery.data ?? []).map((s) => ({
			id: s.specialtyId,
			name: s.name,
		}));
		const shiftTypeOptions = [...CANDIDATE_MATCHES_SHIFT_TYPE_ORDER];
		const contractTypeOptions = Object.keys(CONTRACT_TYPE_LABELS);

		return [
			{
				id: "specialty",
				label: "Specialty",
				value: specialtyId,
				onValueChange: handleSpecialtyChange,
				placeholder: "All Specialties",
				options: [
					{ value: "all", label: "All Specialties" },
					...buildSpecialtyOptions(specialties),
				],
			},
			{
				id: "location",
				label: "Location",
				value: locationId,
				onValueChange: handleLocationChange,
				placeholder: "All Locations",
				options: [
					{ value: "all", label: "All Locations" },
					...buildLocationOptions(
						locations.map((l) => ({
							id: l.id,
							name: l.name,
							city: l.city ?? "",
							state: l.state ?? "",
						})),
					),
				],
			},
			{
				id: "shiftType",
				label: "Shift type",
				value: shiftType,
				onValueChange: handleShiftTypeChange,
				placeholder: "All Shift Types",
				options: [
					{ value: "all", label: "All Shift Types" },
					...buildShiftTypeOptions(shiftTypeOptions),
				],
			},
			{
				id: "contractType",
				label: "Contract type",
				value: contractType,
				onValueChange: handleContractTypeChange,
				placeholder: "All Contract Types",
				options: [
					{ value: "all", label: "All Contract Types" },
					...buildContractTypeOptions(contractTypeOptions),
				],
			},
		];
	}, [
		locationsQuery.data,
		specialtiesQuery.data,
		specialtyId,
		locationId,
		shiftType,
		contractType,
		handleSpecialtyChange,
		handleLocationChange,
		handleShiftTypeChange,
		handleContractTypeChange,
	]);

	return {
		organizationId,
		search: localSearch,
		onSearchChange: handleSearchChange,
		filtersExpanded,
		setFiltersExpanded,
		page,
		setPage,
		limit,
		setLimit,
		pageSizeOptions: CANDIDATE_JOB_SEARCH_PAGE_SIZE_OPTIONS,
		tab,
		setTab,
		totalPages: matchesQuery.data?.totalPages ?? 1,
		paginatedJobs: matchesQuery.data?.items ?? [],
		totalFiltered: matchesQuery.data?.total ?? 0,
		allCount: allCountQuery.data?.total ?? 0,
		savedCount: savedCountQuery.data?.total ?? 0,
		filterConfigs,
		isLoading: matchesQuery.isPending,
		isError: matchesQuery.isError,
	};
}
