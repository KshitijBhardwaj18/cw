"use client";

import { ConfigPageEmptyState } from "@repo/ui/general/ConfigPageEmptyState";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { SearchWithFilters } from "@repo/ui/shared/SearchWithFilters";
import { useRouter } from "next/navigation";
import { CREDENTIAL_STAT_CARDS } from "@/constants/credentials";
import { useCredentialColumns } from "@/hooks/tables/use-credential-columns";
import { useCredentialFilters } from "@/hooks/use-credential-filters";
import { StatusStatCard } from "./StatusStatCard";

export const CredentialsTabContent = () => {
	const router = useRouter();

	const {
		localSearch,
		handleSearchChange,
		filtersExpanded,
		setFiltersExpanded,
		statusFilter,
		toggleStatusFilter,
		countsByStatus,
		credentialRows,
		totalCount,
		page,
		limit,
		setPage,
		setLimit,
		filterConfigs,
	} = useCredentialFilters();

	const { columns } = useCredentialColumns({
		onViewDetails: (item) => {
			const q = new URLSearchParams();
			if (item.complianceListItemId) {
				q.set("item", item.complianceListItemId);
			}
			const suffix = q.toString() ? `?${q.toString()}` : "";
			router.push(
				`/org/credentials/details/credential/${item.placementId}${suffix}`,
			);
		},
	});

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{CREDENTIAL_STAT_CARDS.map((card) => (
					<StatusStatCard
						key={card.key}
						card={card}
						count={countsByStatus[card.key]}
						isActive={statusFilter === card.key}
						onClick={() => toggleStatusFilter(card.key)}
					/>
				))}
			</div>

			<SearchWithFilters
				searchPlaceholder="Search by worker, credential, type, or job..."
				searchValue={localSearch}
				onSearchChange={handleSearchChange}
				filtersExpanded={filtersExpanded}
				onFiltersExpandedChange={setFiltersExpanded}
				filterConfigs={filterConfigs}
			/>

			<CustomTable
				data={credentialRows}
				columns={columns}
				enableSorting={false}
				paginationMode="server"
				totalCount={totalCount}
				currentPage={page}
				pageSize={limit}
				onPaginationChange={(p, l) => {
					setPage(p);
					if (l !== limit) setLimit(l);
				}}
				emptyState={
					<ConfigPageEmptyState
						hasSearch={localSearch.trim() !== ""}
						searchEmptyTitle="No credentials found"
						emptyTitle="No credentials found"
						searchEmptyMessage="Try adjusting your search or filters."
						emptyMessage="No compliance credentials in this view yet. Use search or the status cards to narrow the list."
					/>
				}
			/>
		</div>
	);
};
