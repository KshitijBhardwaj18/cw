"use client";

import { useConfigPageSearch } from "@repo/ui/hooks/use-config-page-search";
import { useOrganizationLocationsQuery } from "@/queries/organizations.query";
import { OrganizationLocationsList } from "./OrganizationLocationsList";

const PAGE_SIZE = 8;

type OrganizationLocationsPageContentProps = {
	organizationId: string;
};

export function OrganizationLocationsPageContent({
	organizationId,
}: OrganizationLocationsPageContentProps) {
	const {
		page,
		searchFromUrl,
		hasActiveSearch,
		localSearch,
		handleSearchChange,
	} = useConfigPageSearch();

	const { data: response } = useOrganizationLocationsQuery(
		organizationId,
		page,
		PAGE_SIZE,
		searchFromUrl,
	);

	return (
		<OrganizationLocationsList
			organizationId={organizationId}
			locations={response.data}
			total={response.total}
			totalPages={response.totalPages}
			page={page}
			search={localSearch}
			onSearchChange={handleSearchChange}
			hasActiveSearch={hasActiveSearch}
		/>
	);
}
