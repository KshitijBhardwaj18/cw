"use client";

import type { OrganizationLocationType } from "@repo/shared";
import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useSearchWithFilters } from "@repo/ui/hooks/use-search-with-filters";
import { useCallback } from "react";
import {
	useInfiniteOrganizationLocations,
	useOrganizationDepartmentsQuery,
} from "@/queries/organizations.query";
import { OrganizationDepartmentsList } from "./OrganizationDepartmentsList";

const PAGE_SIZE = 8;
const DEPT_PARAMS = {
	PAGE: "deptPage",
	SEARCH: "deptSearch",
	LOCATION: "locationId",
} as const;

type OrganizationDepartmentsPageContentProps = {
	organizationId: string;
};

export function OrganizationDepartmentsPageContent({
	organizationId,
}: OrganizationDepartmentsPageContentProps) {
	const { page, setPage } = usePaginationControls({
		pageParamKey: DEPT_PARAMS.PAGE,
		defaultLimit: PAGE_SIZE,
	});

	const {
		searchValue: localSearch,
		handleSearchChange,
		searchFromUrl,
		values,
		filterConfigs,
	} = useSearchWithFilters({
		search: { paramKey: DEPT_PARAMS.SEARCH },
		pagination: { pageParamKey: DEPT_PARAMS.PAGE },
		filters: [
			{
				id: DEPT_PARAMS.LOCATION,
				label: "Location",
				type: "select",
				defaultValue: "",
			},
		],
	});

	const locationIdFromUrl = values[DEPT_PARAMS.LOCATION] || "";

	const hasActiveSearch = !!searchFromUrl.trim();

	const { data: departmentsResponse } = useOrganizationDepartmentsQuery(
		organizationId,
		page,
		PAGE_SIZE,
		searchFromUrl,
		locationIdFromUrl || undefined,
	);

	const {
		data: locationsData,
		hasNextPage: hasMoreLocations,
		isFetchingNextPage: isFetchingMoreLocations,
		fetchNextPage: fetchMoreLocations,
	} = useInfiniteOrganizationLocations(organizationId);

	const locations = (locationsData?.pages.flatMap((p) => p.data) ?? []).map(
		(l: OrganizationLocationType) => ({ id: l.id, name: l.name }),
	);

	const onLocationsScrollToBottom = useCallback(() => {
		if (hasMoreLocations && !isFetchingMoreLocations) {
			fetchMoreLocations();
		}
	}, [hasMoreLocations, isFetchingMoreLocations, fetchMoreLocations]);

	const onLocationFilterChange = filterConfigs[0]?.onValueChange;

	return (
		<OrganizationDepartmentsList
			organizationId={organizationId}
			departments={departmentsResponse?.data ?? []}
			locations={locations}
			total={departmentsResponse?.total ?? 0}
			totalPages={departmentsResponse?.totalPages ?? 1}
			page={page}
			search={localSearch}
			locationIdFilter={locationIdFromUrl}
			onSearchChange={handleSearchChange}
			hasActiveSearch={hasActiveSearch}
			onLocationsScrollToBottom={onLocationsScrollToBottom}
			onPageChange={setPage}
			onLocationFilterChange={onLocationFilterChange}
		/>
	);
}
