"use client";

import { Action, useAbility } from "@repo/casl";
import {
	ConfigPageEmptyState,
	ConfigPageErrorState,
} from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { MetricCard } from "@repo/ui/general/MetricCard";
import PaginationControls from "@repo/ui/general/PaginationControls";
import { SearchWithFilters } from "@repo/ui/shared/SearchWithFilters";
import {
	Briefcase,
	CircleDollarSign,
	Loader2,
	Send,
	Users,
} from "lucide-react";
import { useMemo } from "react";
import { useVendorJobsBoard } from "@/hooks/vendor/use-vendor-jobs-board";
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
		handleSelectSubmitCandidate,
		handleBackToSelection,
		pageCount,
		paginatedRequisitions,
		totalRequisitions,
		listQuery,
	} = useVendorJobsBoard();

	const ability = useAbility();
	const canSubmitCandidates = ability.can(Action.Create, "Submission");
	const canSaveJobs = ability.can(Action.Create, "VendorUserSavedRequisition");

	const metricsQuery = useVendorCandidatesMetrics();

	const pageMetrics = useMemo(() => {
		const rows = listQuery.data?.data ?? [];
		let openings = 0;
		let billSum = 0;
		let billN = 0;
		for (const r of rows) {
			openings += Math.max(0, r.numberOfPositions - r.positionsFilled);
			if (r.billRate != null && !Number.isNaN(r.billRate)) {
				billSum += r.billRate;
				billN += 1;
			}
		}
		const avgBill = billN > 0 ? `$${(billSum / billN).toFixed(2)}/hr` : "—";
		return { openings, avgBill };
	}, [listQuery.data?.data]);

	const isLoading = listQuery.isLoading;
	const isError = listQuery.isError;

	return (
		<div className="space-y-10">
			<ConfigPageHeader
				title="Jobs Board"
				total={totalRequisitions}
				itemLabel="job"
				itemLabelPlural="jobs"
				description="Browse active requisitions and submit qualified candidates"
			/>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<MetricCard
					title="Active Jobs"
					value={isLoading ? "…" : String(totalRequisitions)}
					icon={Briefcase}
					variant="primary"
				/>
				<MetricCard
					title="Openings (this page)"
					value={isLoading ? "…" : String(pageMetrics.openings)}
					icon={Send}
					variant="success"
				/>
				<MetricCard
					title="Avg bill rate (this page)"
					value={isLoading ? "…" : pageMetrics.avgBill}
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

			<SearchWithFilters
				searchPlaceholder="Search jobs by title, organization, location, or summary..."
				searchValue={searchValue}
				onSearchChange={setSearchValue}
				filtersExpanded={false}
				onFiltersExpandedChange={() => {}}
				filterConfigs={[]}
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
						hasSearch={searchValue.trim() !== ""}
						searchEmptyTitle="No jobs match your search"
						emptyTitle="No jobs yet"
						searchEmptyMessage="Try adjusting keywords or clear the search to see all assigned requisitions."
						emptyMessage="You have no assigned requisitions yet. When a client posts jobs, they will appear here."
						icon={Briefcase}
					/>
				)}

				{!isLoading && !isError && paginatedRequisitions.length > 0 && (
					<div className="space-y-4">
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
					pageSizeOptions={[5, 10, 15, 20]}
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
				onSubmitCandidate={handleSubmitCandidate}
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
