"use client";

import { Action, useAbility } from "@repo/casl";
import { formatUsdPerHour } from "@repo/shared";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import {
	ConfigPageEmptyState,
	ConfigPageErrorState,
} from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { MetricCard } from "@repo/ui/general/MetricCard";
import PaginationControls from "@repo/ui/general/PaginationControls";
import { ScrollableLineTabsRow } from "@repo/ui/general/ScrollableLineTabsRow";
import { SearchWithFilters } from "@repo/ui/shared/SearchWithFilters";
import {
	Bookmark,
	Briefcase,
	CircleDollarSign,
	Loader2,
	Send,
	Users,
} from "lucide-react";
import {
	useVendorJobsBoard,
	VENDOR_JOBS_BOARD_TABS,
	type VendorJobsBoardTab,
} from "@/hooks/vendor/use-vendor-jobs-board";
import { useVendorCandidatesMetrics } from "@/queries/vendor-candidates.queries";
import { CandidateDetailDialog } from "./CandidateDetailDialog";
import { CandidateSelectionDialog } from "./CandidateSelectionDialog";
import { JobDetailDialog } from "./JobDetailDialog";
import { RequisitionCard } from "./RequisitionCard";
import { ReviewSubmitDialog } from "./ReviewSubmitDialog";

function VendorJobBoardPageContent() {
	const {
		searchValue,
		setSearchValue,
		filterConfigs,
		filtersExpanded,
		setFiltersExpanded,
		selectedRequisition,
		isJobDialogOpen,
		setIsJobDialogOpen,
		selectedCandidate,
		isCandidateDialogOpen,
		setIsCandidateDialogOpen,
		selectedSubmitRequisition,
		isSelectionDialogOpen,
		setIsSelectionDialogOpen,
		submitCandidate,
		isReviewDialogOpen,
		setIsReviewDialogOpen,
		currentPage,
		setCurrentPage,
		limit,
		setLimit,
		handleViewJobDetails,
		handleViewCandidate,
		handleSubmitCandidate,
		handleDetailSubmitCandidate,
		handleSelectSubmitCandidate,
		handleBackToSelection,
		pageCount,
		paginatedRequisitions,
		totalRequisitions,
		totalOpenings,
		averageBillRate,
		tab,
		setTab,
		allCount,
		savedCount,
		listQuery,
	} = useVendorJobsBoard();

	const isSavedTab = tab === "saved";
	const tabCounts: Record<VendorJobsBoardTab, number> = {
		all: allCount,
		saved: savedCount,
	};
	const tabLabels: Record<VendorJobsBoardTab, string> = {
		all: "All Jobs",
		saved: "Saved",
	};
	const tabIcons: Record<VendorJobsBoardTab, typeof Briefcase> = {
		all: Briefcase,
		saved: Bookmark,
	};

	const ability = useAbility();
	const canSubmitCandidates = ability.can(Action.Create, "Submission");
	const canSaveJobs = ability.can(Action.Create, "VendorUserSavedRequisition");

	const metricsQuery = useVendorCandidatesMetrics();

	const isLoading = listQuery.isLoading;
	const isError = listQuery.isError;
	const avgBillLabel =
		averageBillRate != null ? formatUsdPerHour(averageBillRate) : "—";

	return (
		<div className="space-y-10">
			<ConfigPageHeader
				title="Jobs Board"
				total={totalRequisitions}
				itemLabel="job"
				itemLabelPlural="jobs"
				description="Browse active requisitions and submit qualified candidates"
			/>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				<MetricCard
					title="Active Jobs"
					value={isLoading ? "…" : String(totalRequisitions)}
					icon={Briefcase}
					variant="primary"
				/>
				<MetricCard
					title="Open Positions"
					value={isLoading ? "…" : String(totalOpenings)}
					icon={Send}
					variant="success"
				/>
				<MetricCard
					title="Avg Bill Rate"
					value={isLoading ? "…" : avgBillLabel}
					icon={CircleDollarSign}
					variant="warning"
				/>
				<MetricCard
					title="Your candidates"
					value={
						metricsQuery.isLoading
							? "…"
							: String(metricsQuery.data?.totalCandidates ?? "—")
					}
					icon={Users}
					variant="info"
				/>
			</div>

			<Tabs
				value={tab}
				onValueChange={(value) => setTab(value as VendorJobsBoardTab)}
				className="w-full flex-col space-y-6"
			>
				<ScrollableLineTabsRow>
					<TabsList
						variant="line"
						className="inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-0 rounded-none border-0 bg-transparent p-0"
					>
						{VENDOR_JOBS_BOARD_TABS.map((id) => {
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
				searchPlaceholder="Search jobs by title, organization, location, or summary..."
				searchValue={searchValue}
				onSearchChange={setSearchValue}
				filtersExpanded={filtersExpanded}
				onFiltersExpandedChange={setFiltersExpanded}
				filterConfigs={filterConfigs}
			/>

			<div className="space-y-6">
				{isLoading && (
					<div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
						<Loader2 className="size-5 animate-spin" />
						Loading jobs…
					</div>
				)}

				{isError && (
					<ConfigPageErrorState
						title="Could not load jobs"
						description={
							listQuery.error instanceof Error
								? listQuery.error.message
								: "Something went wrong."
						}
					/>
				)}

				{!isLoading && !isError && paginatedRequisitions.length === 0 && (
					<ConfigPageEmptyState
						hasSearch={searchValue.trim() !== "" && !isSavedTab}
						searchEmptyTitle="No jobs match your search"
						emptyTitle={isSavedTab ? "No saved jobs yet" : "No jobs yet"}
						searchEmptyMessage="Try adjusting keywords or clear the search to see all assigned requisitions."
						emptyMessage={
							isSavedTab
								? "Save jobs from the detail view and they will appear here for quick access."
								: "You have no assigned requisitions yet. When a client posts jobs, they will appear here."
						}
						icon={isSavedTab ? Bookmark : Briefcase}
					/>
				)}

				{!isLoading && !isError && paginatedRequisitions.length > 0 && (
					<div className="min-w-0 space-y-4">
						{paginatedRequisitions.map((req) => (
							<RequisitionCard
								key={req.id}
								requisitionId={req.id}
								requisition={req}
								onViewDetails={() => handleViewJobDetails(req)}
								onViewCandidate={(candidate) =>
									handleViewCandidate(candidate, req)
								}
								onSubmitCandidate={() => handleSubmitCandidate(req)}
								showSubmitCandidate={canSubmitCandidates}
							/>
						))}
					</div>
				)}

				<PaginationControls
					currentPage={currentPage}
					pageCount={pageCount}
					goToPage={setCurrentPage}
					limit={limit}
					setLimit={setLimit}
					pageSizeOptions={[5, 10, 20, 50]}
					totalItems={totalRequisitions}
					itemLabel="job"
					itemLabelPlural="jobs"
				/>
			</div>

			<JobDetailDialog
				requisition={selectedRequisition}
				open={isJobDialogOpen}
				onOpenChange={setIsJobDialogOpen}
				onViewCandidate={(candidate) =>
					handleViewCandidate(candidate, selectedRequisition || undefined)
				}
				onSubmitCandidate={handleSubmitCandidate}
				showSubmitCandidate={canSubmitCandidates}
				showSaveJob={canSaveJobs}
			/>

			<CandidateDetailDialog
				candidate={selectedCandidate}
				requisition={selectedSubmitRequisition}
				open={isCandidateDialogOpen}
				onOpenChange={setIsCandidateDialogOpen}
				onSubmitCandidate={(requisition) =>
					selectedCandidate &&
					handleDetailSubmitCandidate(requisition, selectedCandidate)
				}
				showSubmitCandidate={canSubmitCandidates}
			/>

			<CandidateSelectionDialog
				requisition={selectedSubmitRequisition}
				open={isSelectionDialogOpen}
				onOpenChange={setIsSelectionDialogOpen}
				onSelectCandidate={handleSelectSubmitCandidate}
			/>

			<ReviewSubmitDialog
				key={submitCandidate?.id}
				requisition={selectedSubmitRequisition}
				candidate={submitCandidate}
				open={isReviewDialogOpen}
				onOpenChange={setIsReviewDialogOpen}
				onBack={handleBackToSelection}
			/>
		</div>
	);
}

export default VendorJobBoardPageContent;
