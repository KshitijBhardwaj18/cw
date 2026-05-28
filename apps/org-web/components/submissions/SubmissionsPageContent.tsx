"use client";

import { Action, subjectInstance, useAbility } from "@repo/casl";
import {
	ConfigPageEmptyState,
	ConfigPageErrorState,
} from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { CustomTable } from "@repo/ui/general/CustomTable";
import PaginationControls from "@repo/ui/general/PaginationControls";
import { SearchWithFilters } from "@repo/ui/shared/SearchWithFilters";
import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { AccessBlockedState } from "@/components/general/AccessBlockedState";
import {
	SUBMISSION_STAGE_TABS,
	type SubmissionStageKey,
} from "@/constants/submissions";
import { useSubmissionListColumns } from "@/hooks/tables/use-submission-list-columns";
import { useSubmissionsPage } from "@/hooks/use-submissions-page";
import { SubmissionAgingStatCards } from "./SubmissionAgingStatCards";
import { SubmissionStageTabs } from "./SubmissionStageTabs";
import { SubmissionsPageLoading } from "./SubmissionsPageLoading";

export function SubmissionsPageContent() {
	const router = useRouter();
	const ability = useAbility();

	const allowedStages = useMemo<SubmissionStageKey[]>(
		() =>
			SUBMISSION_STAGE_TABS.filter(({ stage }) =>
				ability.can(Action.List, subjectInstance("Submission", { stage })),
			).map(({ stage }) => stage),
		[ability],
	);

	const {
		activeStage,
		handleStageChange,
		agingFilter,
		setAgingFilter,
		search,
		setSearch,
		filtersExpanded,
		setFiltersExpanded,
		rows,
		filterConfigs,
		stageCounts,
		agingCounts,
		totalCount,
		currentPage,
		totalPages,
		pageSize,
		pageSizeOptions,
		setPage,
		setLimit,
		isLoading,
		isError,
		listErrorMessage,
	} = useSubmissionsPage({ allowedStages });

	const columns = useSubmissionListColumns();

	if (allowedStages.length === 0 || !activeStage) {
		return (
			<div className="space-y-6">
				<ConfigPageHeader
					title="Submissions Management"
					total={0}
					itemLabel="submission"
					itemLabelPlural="submissions"
					description="Track candidates through the submission lifecycle with aging-based workflows"
				/>
				<AccessBlockedState description="You do not have permission to view any submission stages for this organization." />
			</div>
		);
	}

	const showFatalListError = isError && !isLoading;

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Submissions Management"
				total={totalCount}
				itemLabel="submission"
				itemLabelPlural="submissions"
				description="Track candidates through the submission lifecycle with aging-based workflows"
				countText={
					isLoading
						? "Loading submissions…"
						: showFatalListError
							? listErrorMessage
							: `${totalCount} in this stage & filters`
				}
			/>

			<SubmissionStageTabs
				activeStage={activeStage}
				allowedStages={allowedStages}
				stageCounts={stageCounts}
				onStageChange={handleStageChange}
			/>

			<SubmissionAgingStatCards
				agingFilter={agingFilter}
				agingCounts={agingCounts}
				onAgingFilterChange={setAgingFilter}
			/>

			<SearchWithFilters
				searchPlaceholder="Search by candidate name, occupation, specialty, job title, or vendor..."
				searchValue={search}
				onSearchChange={setSearch}
				filtersExpanded={filtersExpanded}
				onFiltersExpandedChange={setFiltersExpanded}
				filterConfigs={filterConfigs}
			/>

			{isLoading ? (
				<SubmissionsPageLoading />
			) : showFatalListError ? (
				<ConfigPageErrorState
					className="rounded-xl border border-dashed py-16"
					title="Could not load submissions"
					description={listErrorMessage}
				/>
			) : rows.length === 0 ? (
				<ConfigPageEmptyState
					hasSearch={false}
					emptyTitle="No submissions in this view"
					emptyMessage="Try another stage, aging filter, or adjust search and filters."
					icon={FileText}
				/>
			) : (
				<>
					<CustomTable
						data={rows}
						columns={columns}
						enableSorting
						enablePagination={false}
						emptyState={null}
						onRowClick={(row) => router.push(`/org/submissions/${row.id}`)}
					/>
					<PaginationControls
						currentPage={currentPage}
						pageCount={totalPages}
						goToPage={setPage}
						limit={pageSize}
						setLimit={setLimit}
						pageSizeOptions={pageSizeOptions}
						totalItems={totalCount}
						itemLabel="submission"
						itemLabelPlural="submissions"
					/>
				</>
			)}
		</div>
	);
}
