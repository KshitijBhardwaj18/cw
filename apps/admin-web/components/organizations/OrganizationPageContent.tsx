"use client";

import { Action } from "@repo/casl";
import { getLabel } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import { ConfigPageEmptyState } from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { ConfigPagePagination } from "@repo/ui/general/ConfigPagePagination";
import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { ORGANIZATION_TYPE_OPTIONS } from "@/constants/organization";
import { useAuth } from "@/contexts";
import {
	useOrganizations,
	useOrganizationsGrouped,
} from "@/queries/organizations.query";
import { OrganizationCard } from "./OrganizationCard";

const ORGS_PER_GROUP = 4;
const PAGE_SIZE = 12;

export const ORG_PARAMS = {
	PAGE: "orgPage",
	SEARCH: "orgSearch",
} as const;

export function OrganizationPageContent() {
	const { ability } = useAuth();

	const { page, setPage } = usePaginationControls({
		pageParamKey: ORG_PARAMS.PAGE,
		defaultLimit: PAGE_SIZE,
	});

	const { localSearch, searchFromUrl, handleSearchChange, hasActiveSearch } =
		useDebouncedSearch({
			paramKey: ORG_PARAMS.SEARCH,
			pageParamKey: ORG_PARAMS.PAGE,
		});

	const { data: groupedData } = useOrganizationsGrouped(ORGS_PER_GROUP);
	const { data: paginatedData } = useOrganizations(
		page,
		PAGE_SIZE,
		undefined,
		hasActiveSearch ? searchFromUrl : undefined,
	);

	const canCreate = ability.can(Action.Create, "Organization");
	const canDelete = ability.can(Action.Delete, "Organization");

	const isSearchMode = hasActiveSearch;
	const groups = groupedData.groups;
	const totalGrouped = groups.reduce((sum, g) => sum + g.total, 0);
	const total = isSearchMode ? paginatedData.total : totalGrouped;
	const orgs = isSearchMode ? paginatedData.data : [];

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Organizations"
				total={total}
				itemLabel="organization"
				itemLabelPlural="organizations"
				countText={
					hasActiveSearch
						? `${total} item${total !== 1 ? "s" : ""} match${total !== 1 ? "" : "es"}`
						: `${total} ${total === 1 ? "organization" : "organizations"}`
				}
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
					emptyMessage="There are no organizations to show yet."
					searchEmptyMessage="There are no organizations that match your search."
				/>
			) : isSearchMode ? (
				<>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						{orgs.map((org) => (
							<OrganizationCard key={org.id} org={org} canDelete={canDelete} />
						))}
					</div>
					{paginatedData.totalPages > 1 && (
						<ConfigPagePagination
							page={page}
							totalPages={paginatedData.totalPages}
							onPageChange={setPage}
						/>
					)}
				</>
			) : (
				<div className="space-y-8">
					{groups.map(
						({ organizationType, data: orgsInGroup, total: groupTotal }) => {
							const typeLabel = getLabel(
								ORGANIZATION_TYPE_OPTIONS,
								organizationType,
							);
							const hasMore = groupTotal > ORGS_PER_GROUP;

							return (
								<section key={organizationType}>
									<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
										<h3 className="text-lg font-semibold">{typeLabel}</h3>
										{hasMore && (
											<Button variant="link" size="sm" asChild>
												<Link
													href={`/organizations/by-type/${organizationType}`}
													className="flex items-center gap-1"
												>
													View All
													<ChevronRight className="size-4" />
												</Link>
											</Button>
										)}
									</div>
									<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
										{orgsInGroup.map((org) => (
											<OrganizationCard
												key={org.id}
												org={org}
												canDelete={canDelete}
											/>
										))}
									</div>
								</section>
							);
						},
					)}
				</div>
			)}
		</div>
	);
}
