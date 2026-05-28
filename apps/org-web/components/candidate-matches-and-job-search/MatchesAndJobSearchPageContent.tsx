"use client";

import { Skeleton } from "@repo/ui/components/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import {
	ConfigPageEmptyState,
	ConfigPageErrorState,
} from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import PaginationControls from "@repo/ui/general/PaginationControls";
import { ScrollableLineTabsRow } from "@repo/ui/general/ScrollableLineTabsRow";
import { SearchWithFilters } from "@repo/ui/shared/SearchWithFilters";
import { Bookmark, Briefcase } from "lucide-react";
import {
	CANDIDATE_MATCHES_TABS,
	type CandidateMatchesTab,
} from "@/constants/candidate/matches-and-job-search";
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
		limit,
		setLimit,
		pageSizeOptions,
		tab,
		setTab,
		totalPages,
		paginatedJobs,
		totalFiltered,
		allCount,
		savedCount,
		filterConfigs,
		isLoading,
		isError,
	} = useMatchesAndJobSearchPage();

	const isSavedTab = tab === "saved";
	const tabCounts: Record<CandidateMatchesTab, number> = {
		all: allCount,
		saved: savedCount,
	};
	const tabLabels: Record<CandidateMatchesTab, string> = {
		all: "All Jobs",
		saved: "Saved",
	};
	const tabIcons: Record<CandidateMatchesTab, typeof Briefcase> = {
		all: Briefcase,
		saved: Bookmark,
	};

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Browse Jobs"
				total={totalFiltered}
				itemLabel="job"
				itemLabelPlural="jobs"
				description="Find and apply to positions that match your skills."
			/>

			<Tabs
				value={tab}
				onValueChange={(value) => setTab(value as CandidateMatchesTab)}
				className="w-full flex-col space-y-6"
			>
				<ScrollableLineTabsRow>
					<TabsList
						variant="line"
						className="inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-0 rounded-none border-0 bg-transparent p-0"
					>
						{CANDIDATE_MATCHES_TABS.map((id) => {
							const Icon = tabIcons[id];
							return (
								<TabsTrigger
									key={id}
									value={id}
									className="flex-none gap-2 px-4 py-3"
								>
									<Icon className="size-4" />
									{tabLabels[id]} ({tabCounts[id]})
								</TabsTrigger>
							);
						})}
					</TabsList>
				</ScrollableLineTabsRow>
			</Tabs>

			<SearchWithFilters
				searchPlaceholder="Search jobs..."
				searchValue={search}
				onSearchChange={onSearchChange}
				filtersExpanded={filtersExpanded}
				onFiltersExpandedChange={setFiltersExpanded}
				filterConfigs={filterConfigs}
			/>

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
					emptyTitle={isSavedTab ? "No saved jobs yet" : "No jobs found"}
					emptyMessage={
						isSavedTab
							? "Tap the heart on a job card to save it. Saved jobs will appear here."
							: "No jobs match your filters. Try adjusting your search or filters."
					}
					icon={isSavedTab ? Bookmark : Briefcase}
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
					<PaginationControls
						currentPage={page}
						pageCount={totalPages}
						goToPage={setPage}
						limit={limit}
						setLimit={setLimit}
						pageSizeOptions={pageSizeOptions}
						totalItems={totalFiltered}
						itemLabel="job"
						itemLabelPlural="jobs"
					/>
				</>
			)}
		</div>
	);
}
