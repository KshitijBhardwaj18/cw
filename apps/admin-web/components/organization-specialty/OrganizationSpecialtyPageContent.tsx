"use client";

import { ConfigPageEmptyState } from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { ConfigPagePagination } from "@repo/ui/general/ConfigPagePagination";
import { useConfigPageSearch } from "@repo/ui/hooks/use-config-page-search";
import { useRouter } from "next/navigation";
import { useOrganizationSpecialtiesPaginated } from "@/queries/organization-specialties.query";
import { OrganizationSpecialtiesTableWrapper } from "./OrganizationSpecialtiesTableWrapper";

const PAGE_SIZE = 10;

interface OrganizationSpecialtyPageContentProps {
	organizationId: string;
}

export default function OrganizationSpecialtyPageContent({
	organizationId,
}: OrganizationSpecialtyPageContentProps) {
	const router = useRouter();

	const {
		page,
		searchFromUrl,
		hasActiveSearch,
		localSearch,
		handleSearchChange,
		buildSearchParams,
	} = useConfigPageSearch();

	const { data: paginated } = useOrganizationSpecialtiesPaginated(
		organizationId,
		page,
		PAGE_SIZE,
		searchFromUrl,
	);
	const { data: items, total, totalPages } = paginated;

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Specialties"
				total={total}
				itemLabel="specialty"
				itemLabelPlural="specialties"
				countText={
					hasActiveSearch
						? `${total} item${total !== 1 ? "s" : ""} match${total !== 1 ? "" : "es"}`
						: `${total} ${total === 1 ? "specialty" : "specialties"} linked to organization occupations`
				}
				actions={[]}
				search={{
					value: localSearch,
					onChange: handleSearchChange,
					placeholder: "Search specialties...",
				}}
			/>

			{total === 0 ? (
				<ConfigPageEmptyState
					hasSearch={hasActiveSearch}
					emptyTitle="No specialties linked."
					emptyMessage="Link specialties to organization occupations via the Occupations page."
					searchEmptyMessage="No specialties match your search."
				/>
			) : (
				<>
					<OrganizationSpecialtiesTableWrapper
						data={items}
						organizationId={organizationId}
					/>

					{totalPages > 1 && (
						<ConfigPagePagination
							page={page}
							totalPages={totalPages}
							onPageChange={(p) => router.push(buildSearchParams({ page: p }))}
						/>
					)}
				</>
			)}
		</div>
	);
}
