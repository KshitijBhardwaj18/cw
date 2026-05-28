"use client";

import { Button } from "@repo/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { CustomTable } from "@repo/ui/general/CustomTable";
import LoadingScreen from "@repo/ui/general/LoadingScreen";
import PaginationControls from "@repo/ui/general/PaginationControls";
import { SearchWithFilters } from "@repo/ui/shared/SearchWithFilters";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { HIRING_FUNNEL_SUMMARY_CARDS } from "@/constants/command-center.hiring-funnel.configs";
import { useHiringFunnelJobListingColumns } from "@/hooks/tables/use-hiring-funnel-job-listing-columns";
import { useHiringFunnel } from "@/hooks/use-hiring-funnel";
import type { HiringFunnelJobListingItem } from "@/types/command-center";
import { HiringFunnelSummaryCard } from "./HiringFunnelSummaryCard";
import { HiringPipelineVisualization } from "./HiringPipelineVisualization";

export const HiringFunnelTab = () => {
	const router = useRouter();
	const {
		summaryByKey,
		localSearch,
		filtersExpanded,
		setFiltersExpanded,
		handleSearchChange,
		jobListings,
		filterConfigs,
		isLoading,
		isError,
		listErrorMessage,
		refetchJobs,
		total,
		page,
		totalPages,
		setPage,
		limit,
		setLimit,
		pageSizeOptions,
	} = useHiringFunnel();
	const { columns } = useHiringFunnelJobListingColumns();

	const handleRowClick = (row: HiringFunnelJobListingItem) => {
		router.push(`/org/jobs/${row.id}`);
	};

	const showFatalListError = isError && !isLoading && jobListings.length === 0;

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Hiring Funnel"
				description="Cross-job submission pipeline and conversion tracking"
				total={total}
				itemLabel="job"
				itemLabelPlural="jobs"
			/>

			<div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
				{HIRING_FUNNEL_SUMMARY_CARDS.map((card) => (
					<HiringFunnelSummaryCard
						key={card.key}
						card={card}
						summaryByKey={summaryByKey}
					/>
				))}
			</div>

			<HiringPipelineVisualization summaryByKey={summaryByKey} />

			<div className="space-y-3">
				<div className="flex items-center justify-between gap-3">
					<p className="text-lg font-semibold">Job Listings ({total})</p>
				</div>

				<SearchWithFilters
					searchPlaceholder="Search by job title, location, or department..."
					searchValue={localSearch}
					onSearchChange={handleSearchChange}
					filtersExpanded={filtersExpanded}
					onFiltersExpandedChange={setFiltersExpanded}
					filterConfigs={filterConfigs}
				/>

				{showFatalListError ? (
					<Empty className="border-muted/50 py-12">
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<AlertCircle className="size-5" />
							</EmptyMedia>
							<EmptyTitle>Could not load job pipeline</EmptyTitle>
							<EmptyDescription>{listErrorMessage}</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button
								type="button"
								size="sm"
								onClick={() => void refetchJobs()}
							>
								Try again
							</Button>
						</EmptyContent>
					</Empty>
				) : isLoading ? (
					<div className="flex h-64 flex-col items-center justify-center gap-4">
						<LoadingScreen message="Loading job pipeline…" />
					</div>
				) : (
					<>
						<CustomTable
							data={jobListings}
							columns={columns}
							enableSorting={false}
							onRowClick={handleRowClick}
						/>
						<PaginationControls
							currentPage={page}
							pageCount={totalPages}
							goToPage={setPage}
							limit={limit}
							setLimit={setLimit}
							pageSizeOptions={pageSizeOptions}
							totalItems={total}
							itemLabel="job"
							itemLabelPlural="jobs"
						/>
					</>
				)}
			</div>
		</div>
	);
};
