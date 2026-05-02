"use client";

import { Skeleton } from "@repo/ui/components/skeleton";
import {
	ConfigPageEmptyState,
	ConfigPageErrorState,
} from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { ConfigPagePagination } from "@repo/ui/general/ConfigPagePagination";
import { CustomTable } from "@repo/ui/general/CustomTable";
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
		limit,
		isListLoading,
		isListError,
	} = useVendorDocumentWallets();

	const rangeStart = totalRows === 0 ? 0 : (page - 1) * limit + 1;
	const rangeEnd = totalRows === 0 ? 0 : Math.min(page * limit, totalRows);

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Document Wallets"
				total={totalRows}
				itemLabel="candidate"
				itemLabelPlural="candidates"
				description="Manage compliance documents for all candidates"
				search={{
					value: search,
					onChange: setSearch,
					placeholder: "Search by name, specialty, or email...",
				}}
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
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<p className="text-muted-foreground text-sm">
							Showing {rangeStart}–{rangeEnd} of {totalRows} candidates
						</p>
						<ConfigPagePagination
							page={page}
							totalPages={pageCount}
							onPageChange={setPage}
						/>
					</div>
				</>
			)}
		</div>
	);
}

export default DocumentWalletsPageContent;
