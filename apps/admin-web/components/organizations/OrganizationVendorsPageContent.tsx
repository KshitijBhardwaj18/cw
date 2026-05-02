"use client";

import { useConfigPageSearch } from "@repo/ui/hooks/use-config-page-search";
import { useOrganizationVendorsQuery } from "@/queries/organizations.query";
import { OrganizationVendorsList } from "./OrganizationVendorsList";

const PAGE_SIZE = 8;

type OrganizationVendorsPageContentProps = {
	organizationId: string;
};

export function OrganizationVendorsPageContent({
	organizationId,
}: OrganizationVendorsPageContentProps) {
	const {
		page,
		searchFromUrl,
		hasActiveSearch,
		localSearch,
		handleSearchChange,
	} = useConfigPageSearch();

	const { data: response } = useOrganizationVendorsQuery(
		organizationId,
		page,
		PAGE_SIZE,
		searchFromUrl,
	);

	return (
		<OrganizationVendorsList
			organizationId={organizationId}
			vendors={response.data}
			total={response.total}
			totalPages={response.totalPages}
			page={page}
			search={localSearch}
			onSearchChange={handleSearchChange}
			hasActiveSearch={hasActiveSearch}
		/>
	);
}
