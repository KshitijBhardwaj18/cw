"use client";

import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { useUrlQueryState } from "@repo/ui/hooks/use-url-query-state";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import {
	buildContractTypeOptions,
	buildLocationOptions,
	buildShiftTypeOptions,
	buildSpecialtyOptions,
	CANDIDATE_JOB_SEARCH_PAGE_SIZE,
	CONTRACT_TYPE_LABELS,
	SHIFT_TYPE_LABELS,
	CANDIDATE_MATCHES_URL_KEYS as U,
} from "@/constants/candidate/matches-and-job-search";
import { useCandidateMatches } from "@/queries/candidate-matches.queries";
import { useOrganizationLocationsForOnboarding } from "@/queries/organizations.queries";
import { useSpecialtiesForOccupation } from "@/queries/talent-community.queries";
import { useCandidateOrganizationId } from "./use-candidate-organization-id";

export function useMatchesAndJobSearchPage() {
	const { organizationId, occupationId } = useCandidateOrganizationId();
	const searchParams = useSearchParams();
	const { pushParams } = useUrlQueryState();

	const { localSearch, searchFromUrl, handleSearchChange } = useDebouncedSearch(
		{
			paramKey: U.search,
			pageParamKey: U.page,
		},
	);

	const pageParam = Number(searchParams.get(U.page) ?? "1");
	const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

	const specialtyId = searchParams.get(U.specialty) ?? "all";
	const locationId = searchParams.get(U.location) ?? "all";
	const shiftType = searchParams.get(U.shiftType) ?? "all";
	const contractType = searchParams.get(U.contractType) ?? "all";

	const [filtersExpanded, setFiltersExpanded] = useState(true);

	const locationsQuery = useOrganizationLocationsForOnboarding(
		organizationId ?? undefined,
	);
	const specialtiesQuery = useSpecialtiesForOccupation(
		organizationId ?? "",
		occupationId,
	);

	const queryParams = useMemo(
		() => ({
			page,
			limit: CANDIDATE_JOB_SEARCH_PAGE_SIZE,
			search: searchFromUrl.trim() || undefined,
			specialtyId: specialtyId !== "all" ? specialtyId : undefined,
			locationId: locationId !== "all" ? locationId : undefined,
			shiftType: shiftType !== "all" ? shiftType : undefined,
			contractType: contractType !== "all" ? contractType : undefined,
		}),
		[page, searchFromUrl, specialtyId, locationId, shiftType, contractType],
	);

	const matchesQuery = useCandidateMatches(queryParams, {
		enabled: Boolean(organizationId),
	});

	const setPage = useCallback(
		(p: number) => {
			pushParams({ [U.page]: String(p) });
		},
		[pushParams],
	);

	const handleSpecialtyChange = useCallback(
		(value: string) => {
			const clear = !value || value === "all";
			pushParams({
				[U.specialty]: clear ? null : value,
				[U.page]: null,
			});
		},
		[pushParams],
	);

	const handleLocationChange = useCallback(
		(value: string) => {
			const clear = !value || value === "all";
			pushParams({
				[U.location]: clear ? null : value,
				[U.page]: null,
			});
		},
		[pushParams],
	);

	const handleShiftTypeChange = useCallback(
		(value: string) => {
			const clear = !value || value === "all";
			pushParams({
				[U.shiftType]: clear ? null : value,
				[U.page]: null,
			});
		},
		[pushParams],
	);

	const handleContractTypeChange = useCallback(
		(value: string) => {
			const clear = !value || value === "all";
			pushParams({
				[U.contractType]: clear ? null : value,
				[U.page]: null,
			});
		},
		[pushParams],
	);

	const filterConfigs = useMemo(() => {
		const locations = locationsQuery.data?.data ?? [];
		const specialties = specialtiesQuery.data ?? [];
		const shiftTypeOptions = Object.keys(SHIFT_TYPE_LABELS);
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
		totalPages: matchesQuery.data?.totalPages ?? 1,
		paginatedJobs: matchesQuery.data?.items ?? [],
		totalFiltered: matchesQuery.data?.total ?? 0,
		filterConfigs,
		isLoading: matchesQuery.isPending,
		isError: matchesQuery.isError,
	};
}
