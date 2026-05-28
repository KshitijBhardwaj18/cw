"use client";

import { Action } from "@repo/casl";
import { getLabel, OrganizationType } from "@repo/shared";
import { ConfigPageEmptyState } from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { ConfigPagePagination } from "@repo/ui/general/ConfigPagePagination";
import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { Plus } from "lucide-react";
import { useMemo } from "react";
import { ORGANIZATION_TYPE_OPTIONS } from "@/constants/organization";
import { useAuth } from "@/contexts";
import { useOrganizations } from "@/queries/organizations.query";
import { OrganizationCard } from "./OrganizationCard";

const PAGE_SIZE = 8;

export const ORG_BY_TYPE_PARAMS = {
	PAGE: "orgTPage",
	SEARCH: "orgTSearch",
} as const;

type OrganizationsByTypePageContentProps = {
	organizationType: string;
};

const VALID_TYPES = Object.values(OrganizationType);

export function OrganizationsByTypePageContent({
	organizationType,
}: Readonly<OrganizationsByTypePageContentProps>) {
	const { ability } = useAuth();

	const { page, setPage } = usePaginationControls({
		pageParamKey: ORG_BY_TYPE_PARAMS.PAGE,
		defaultLimit: PAGE_SIZE,
	});

	const { localSearch, searchFromUrl, handleSearchChange, hasActiveSearch } =
		useDebouncedSearch({
			paramKey: ORG_BY_TYPE_PARAMS.SEARCH,
			pageParamKey: ORG_BY_TYPE_PARAMS.PAGE,
		});

	const isValidType = VALID_TYPES.includes(
		organizationType as OrganizationType,
	);

	const { data: response } = useOrganizations(
		page,
		PAGE_SIZE,
		isValidType ? (organizationType as OrganizationType) : undefined,
		hasActiveSearch ? searchFromUrl : undefined,
	);

	const organizations = response.data;
	const total = response.total;
	const totalPages = response.totalPages;
	const typeLabel = useMemo(
		() => getLabel(ORGANIZATION_TYPE_OPTIONS, organizationType),
		[organizationType],
	);

	const canCreate = ability.can(Action.Create, "Organization");
	const canDelete = ability.can(Action.Delete, "Organization");

	if (!isValidType) {
		return (
			<div className="space-y-6">
				<ConfigPageHeader
					title="Organizations"
					total={0}
					itemLabel="organization"
					itemLabelPlural="organizations"
					description={`Invalid organization type: ${organizationType}`}
					backLink={{ href: "/organizations", label: "Back to Org Listing" }}
				/>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title={typeLabel}
				total={total}
				itemLabel="organization"
				itemLabelPlural="organizations"
				countText={
					hasActiveSearch
						? `${total} item${total !== 1 ? "s" : ""} match${total !== 1 ? "" : "es"}`
						: `${total} ${total === 1 ? "organization" : "organizations"}`
				}
				backLink={{ href: "/organizations", label: "Back to Org Listing" }}
				actions={
					canCreate
						? [
								{
									key: "add",
									icon: <Plus data-icon="inline-start" />,
									label: "Add Organization",
									className: "font-semibold",
									href: "/organizations/new",
								},
							]
						: []
				}
				search={{
					value: localSearch,
					onChange: handleSearchChange,
					placeholder: "Search organizations...",
				}}
			/>

			{total === 0 ? (
				<ConfigPageEmptyState
					hasSearch={hasActiveSearch}
					emptyTitle="No organizations found"
					emptyMessage="There are no organizations in this category."
					searchEmptyMessage="There are no organizations that match your search."
				/>
			) : (
				<>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						{organizations.map((org) => (
							<OrganizationCard key={org.id} org={org} canDelete={canDelete} />
						))}
					</div>

					{totalPages > 1 && (
						<ConfigPagePagination
							page={page}
							totalPages={totalPages}
							onPageChange={setPage}
						/>
					)}
				</>
			)}
		</div>
	);
}
