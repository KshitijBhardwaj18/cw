"use client";

import { Skeleton } from "@repo/ui/components/skeleton";
import {
	ConfigPageEmptyState,
	ConfigPageErrorState,
} from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { CustomTable } from "@repo/ui/general/CustomTable";
import PaginationControls from "@repo/ui/general/PaginationControls";
import { SearchWithFilters } from "@repo/ui/shared/SearchWithFilters";
import { Wallet } from "lucide-react";
import { useVendorDocumentWallets } from "@/hooks/vendor/use-vendor-document-wallets";
import { DocumentWalletsMetricCards } from "./DocumentWalletsMetricCards";

export function DocumentWalletsPageContent() {
	const {
		columns,
		metrics,
		isMetricsLoading,
		rows,
		totalRows,
		pageCount,
		page,
		setPage,
		search,
		setSearch,
		filterConfigs,
		filtersExpanded,
		setFiltersExpanded,
		limit,
		setLimit,
		pageSizeOptions,
		isListLoading,
		isListError,
	} = useVendorDocumentWallets();

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Document Wallets"
				total={totalRows}
				itemLabel="candidate"
				itemLabelPlural="candidates"
				description="Manage compliance documents for all candidates"
			/>

			{isMetricsLoading || !metrics ? (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-28 w-full rounded-lg" />
					))}
				</div>
			) : (
				<DocumentWalletsMetricCards stats={metrics} />
			)}

			<SearchWithFilters
				searchPlaceholder="Search by name, specialty, or email..."
				searchValue={search}
				onSearchChange={setSearch}
				filtersExpanded={filtersExpanded}
				onFiltersExpandedChange={setFiltersExpanded}
				filterConfigs={filterConfigs}
			/>

			{isListError ? (
				<ConfigPageErrorState
					title="Could not load document wallets"
					description="Try again or contact support."
					icon={Wallet}
				/>
			) : isListLoading ? (
				<div className="space-y-3">
					<Skeleton className="h-48 w-full rounded-lg" />
				</div>
			) : totalRows === 0 ? (
				<ConfigPageEmptyState
					hasSearch={false}
					emptyTitle="No candidates in this view"
					emptyMessage="Try clearing search or check back later."
					icon={Wallet}
				/>
			) : (
				<>
					<CustomTable
						data={rows}
						columns={columns}
						enableSorting
						enablePagination={false}
						emptyState={null}
					/>
					<PaginationControls
						currentPage={page}
						pageCount={pageCount}
						goToPage={setPage}
						limit={limit}
						setLimit={setLimit}
						pageSizeOptions={pageSizeOptions}
						totalItems={totalRows}
						itemLabel="candidate"
						itemLabelPlural="candidates"
					/>
				</>
			)}
		</div>
	);
}

export default DocumentWalletsPageContent;
