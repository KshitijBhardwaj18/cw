"use client";

import type { OrganizationLocationType } from "@repo/shared";
import { useConfigPageSearch } from "@repo/ui/hooks/use-config-page-search";
import { useCallback } from "react";
import {
	useInfiniteOrganizationLocations,
	useOrganizationDepartmentsQuery,
} from "@/queries/organizations.query";
import { OrganizationDepartmentsList } from "./OrganizationDepartmentsList";

const PAGE_SIZE = 8;

type OrganizationDepartmentsPageContentProps = {
	organizationId: string;
};

export function OrganizationDepartmentsPageContent({
	organizationId,
}: OrganizationDepartmentsPageContentProps) {
	const {
		page,
		searchFromUrl,
		hasActiveSearch,
		localSearch,
		handleSearchChange,
		locationIdFromUrl,
	} = useConfigPageSearch();

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

	return (
		<OrganizationDepartmentsList
			organizationId={organizationId}
			departments={departmentsResponse.data}
			locations={locations}
			total={departmentsResponse.total}
			totalPages={departmentsResponse.totalPages}
			page={page}
			search={localSearch}
			locationIdFilter={locationIdFromUrl}
			onSearchChange={handleSearchChange}
			hasActiveSearch={hasActiveSearch}
			onLocationsScrollToBottom={onLocationsScrollToBottom}
		/>
	);
}
