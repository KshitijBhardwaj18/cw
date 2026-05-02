"use client";

import { Skeleton } from "@repo/ui/components/skeleton";
import {
	ConfigPageEmptyState,
	ConfigPageErrorState,
} from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { ConfigPagePagination } from "@repo/ui/general/ConfigPagePagination";
import { SearchWithFilters } from "@repo/ui/shared/SearchWithFilters";
import { Briefcase } from "lucide-react";
import { useMatchesAndJobSearchPage } from "@/hooks/candidate/use-matches-and-job-search-page";
import { CandidateJobMatchCard } from "./CandidateJobMatchCard";

function JobCardSkeleton() {
	return (
		<div className="rounded-lg border bg-card p-5 shadow-sm space-y-4">
			<Skeleton className="h-6 w-20" />
			<div className="space-y-2">
				<Skeleton className="h-5 w-3/4" />
				<Skeleton className="h-4 w-1/2" />
			</div>
			<div className="space-y-2">
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-2/3" />
			</div>
			<Skeleton className="h-9 w-full" />
		</div>
	);
}

export function MatchesAndJobSearchPageContent() {
	const {
		organizationId,
		search,
		onSearchChange,
		filtersExpanded,
		setFiltersExpanded,
		page,
		setPage,
		totalPages,
		paginatedJobs,
		totalFiltered,
		filterConfigs,
		isLoading,
		isError,
	} = useMatchesAndJobSearchPage();

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Browse Jobs"
				total={totalFiltered}
				itemLabel="job"
				itemLabelPlural="jobs"
				description="Find and apply to positions that match your skills."
			/>

			<SearchWithFilters
				searchPlaceholder="Search jobs..."
				searchValue={search}
				onSearchChange={onSearchChange}
				filtersExpanded={filtersExpanded}
				onFiltersExpandedChange={setFiltersExpanded}
				filterConfigs={filterConfigs}
			/>

			{!isLoading && (
				<p className="text-muted-foreground -mt-2 text-sm">
					{totalFiltered === 1 ? "1 job found" : `${totalFiltered} jobs found`}
				</p>
			)}

			{isLoading ? (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 6 }).map((_, i) => (
						<JobCardSkeleton key={i} />
					))}
				</div>
			) : isError ? (
				<ConfigPageErrorState
					title="Failed to load jobs"
					description="Something went wrong. Please try again later."
				/>
			) : totalFiltered === 0 ? (
				<ConfigPageEmptyState
					hasSearch={false}
					emptyTitle="No jobs found"
					emptyMessage="No jobs match your filters. Try adjusting your search or filters."
					icon={Briefcase}
				/>
			) : (
				<>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{paginatedJobs.map((job) => (
							<CandidateJobMatchCard
								key={job.id}
								job={job}
								organizationId={organizationId}
							/>
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
