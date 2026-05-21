"use client";

import { Action, useAbility } from "@repo/casl";
import { Button } from "@repo/ui/components/button";
import {
	ConfigPageEmptyState,
	ConfigPageErrorState,
} from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { ConfigPagePagination } from "@repo/ui/general/ConfigPagePagination";
import LoadingScreen from "@repo/ui/general/LoadingScreen";
import { SearchWithFilters } from "@repo/ui/shared/SearchWithFilters";
import { AlertCircle, Briefcase, CircleCheck, Plus } from "lucide-react";
import Link from "next/link";
import { AccessBlockedState } from "@/components/general/AccessBlockedState";
import { useJobsPage } from "@/hooks/use-jobs-page";
import { JobCard } from "./JobCard";

export function JobsPageContent() {
	const ability = useAbility();
	const canCreateJob = ability.can(Action.Create, "Requisition");
	const canViewJob = ability.can(Action.Read, "Requisition");
	const canEditJob = ability.can(Action.Update, "Requisition");
	const canReadApprovals = ability.can(Action.Read, "RequisitionApprovals");

	const {
		canListJobs,
		jobs,
		totalCount,
		page,
		totalPages,
		setPage,
		hasActiveFilters,
		isLoading,
		isError,
		listErrorMessage,
		refetchJobs,
		localSearch,
		handleSearchChange,
		filtersExpanded,
		setFiltersExpanded,
		filterConfigs,
		handleCreate,
		handleView,
		handleEdit,
	} = useJobsPage();

	const showFatalListError = isError && !isLoading && jobs.length === 0;

	if (!canListJobs) {
		return (
			<div className="space-y-6">
				<ConfigPageHeader
					title="Jobs"
					total={0}
					itemLabel="job"
					itemLabelPlural="jobs"
				/>
				<AccessBlockedState
					title="No access to jobs list"
					description="You do not have permission to browse jobs for this organization."
					footer={
						canReadApprovals ? (
							<Button type="button" asChild>
								<Link href="/org/jobs/job-approvals">Open job approvals</Link>
							</Button>
						) : undefined
					}
				/>
			</div>
		);
	}

	const headerActions = [
		...(canReadApprovals
			? [
					{
						key: "approvals",
						icon: <CircleCheck className="size-4" />,
						label: "Approvals",
						href: "/org/jobs/job-approvals",
						variant: "outline" as const,
					},
				]
			: []),
		...(canCreateJob
			? [
					{
						key: "create-job",
						icon: <Plus className="size-4" />,
						label: "Create Job",
						onClick: handleCreate,
					},
				]
			: []),
	];

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Jobs"
				total={totalCount}
				itemLabel="job"
				itemLabelPlural="jobs"
				countText={
					isLoading
						? "Loading jobs…"
						: showFatalListError
							? "Could not load jobs"
							: hasActiveFilters
								? `Showing ${jobs.length} of ${totalCount} job${totalCount !== 1 ? "s" : ""}`
								: `${totalCount} job${totalCount !== 1 ? "s" : ""}`
				}
				actions={headerActions}
			/>

			<p className="text-muted-foreground -mt-2 text-sm">
				Manage job requisitions created from templates.
			</p>

			<SearchWithFilters
				searchPlaceholder="Search jobs by title, manager, shift, or location..."
				searchValue={localSearch}
				onSearchChange={handleSearchChange}
				filtersExpanded={filtersExpanded}
				onFiltersExpandedChange={setFiltersExpanded}
				filterConfigs={filterConfigs}
			/>

			<div className="space-y-4">
				{showFatalListError ? (
					<ConfigPageErrorState
						title="Could not load jobs"
						description={listErrorMessage}
						icon={AlertCircle}
						action={
							<Button
								type="button"
								size="sm"
								onClick={() => void refetchJobs()}
							>
								Try again
							</Button>
						}
					/>
				) : isLoading ? (
					<div className="flex h-64 flex-col items-center justify-center gap-4">
						<LoadingScreen message="Loading jobs…" />
					</div>
				) : jobs.length === 0 ? (
					<ConfigPageEmptyState
						hasSearch={hasActiveFilters}
						searchEmptyTitle="No jobs match your filters"
						emptyTitle="No jobs yet"
						searchEmptyMessage="Try adjusting search or filters, or create a new job."
						emptyMessage={
							canCreateJob
								? "Create a job from a requisition template to get started."
								: "No jobs have been posted yet."
						}
						icon={Briefcase}
						action={
							!hasActiveFilters && canCreateJob ? (
								<Button variant="outline" size="sm" onClick={handleCreate}>
									<Plus className="size-4" data-icon="inline-start" />
									Create Job
								</Button>
							) : null
						}
					/>
				) : (
					<>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
							{jobs.map((job) => (
								<JobCard
									key={job.id}
									job={job}
									showView={canViewJob}
									showEdit={canEditJob}
									onView={handleView}
									onEdit={handleEdit}
								/>
							))}
						</div>
						<ConfigPagePagination
							page={page}
							totalPages={totalPages}
							onPageChange={setPage}
						/>
					</>
				)}
			</div>
		</div>
	);
}
