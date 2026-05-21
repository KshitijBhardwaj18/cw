"use client";

import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useOrganizationVendorsQuery } from "@/queries/organizations.query";
import { OrganizationVendorsList } from "./OrganizationVendorsList";

const PAGE_SIZE = 8;
const VND_PARAMS = {
	PAGE: "vndPage",
	SEARCH: "vndSearch",
} as const;

type OrganizationVendorsPageContentProps = {
	organizationId: string;
};

export function OrganizationVendorsPageContent({
	organizationId,
}: OrganizationVendorsPageContentProps) {
	const { page, setPage } = usePaginationControls({
		pageParamKey: VND_PARAMS.PAGE,
	});

	const { localSearch, handleSearchChange, searchFromUrl } = useDebouncedSearch(
		{
			paramKey: VND_PARAMS.SEARCH,
			pageParamKey: VND_PARAMS.PAGE,
		},
	);

	const hasActiveSearch = !!searchFromUrl.trim();

	const { data: response } = useOrganizationVendorsQuery(
		organizationId,
		page,
		PAGE_SIZE,
		searchFromUrl,
	);

	return (
		<OrganizationVendorsList
			organizationId={organizationId}
			vendors={response?.data ?? []}
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
