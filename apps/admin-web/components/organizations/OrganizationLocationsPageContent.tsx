"use client";

import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useOrganizationLocationsQuery } from "@/queries/organizations.query";
import { OrganizationLocationsList } from "./OrganizationLocationsList";

const PAGE_SIZE = 8;
const LOC_PARAMS = {
	PAGE: "locPage",
	SEARCH: "locSearch",
} as const;

type OrganizationLocationsPageContentProps = {
	organizationId: string;
};

export function OrganizationLocationsPageContent({
	organizationId,
}: OrganizationLocationsPageContentProps) {
	const { page, setPage } = usePaginationControls({
		pageParamKey: LOC_PARAMS.PAGE,
		defaultLimit: PAGE_SIZE,
	});

	const { localSearch, handleSearchChange, searchFromUrl } = useDebouncedSearch(
		{
			paramKey: LOC_PARAMS.SEARCH,
			pageParamKey: LOC_PARAMS.PAGE,
		},
	);

	const hasActiveSearch = !!searchFromUrl.trim();

	const { data: response } = useOrganizationLocationsQuery(
		organizationId,
		page,
		PAGE_SIZE,
		searchFromUrl,
	);

	return (
		<OrganizationLocationsList
			organizationId={organizationId}
			locations={response?.data ?? []}
			total={response?.total ?? 0}
			totalPages={response?.totalPages ?? 1}
			page={page}
			search={localSearch}
			onSearchChange={handleSearchChange}
			hasActiveSearch={hasActiveSearch}
			onPageChange={setPage}
		/>
	);
}
