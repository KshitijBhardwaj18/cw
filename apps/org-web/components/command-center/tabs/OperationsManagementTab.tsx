"use client";

import { Button } from "@repo/ui/components/button";
import { Separator } from "@repo/ui/components/separator";
import { ConfigPageEmptyState } from "@repo/ui/general/ConfigPageEmptyState";
import { CustomTable } from "@repo/ui/general/CustomTable";
import PaginationControls from "@repo/ui/general/PaginationControls";
import { FileText, SlidersHorizontal, UsersRound } from "lucide-react";
import { useState } from "react";
import {
	CANDIDATE_PROCESSING_ISSUE_STAT_CARDS,
	REQUISITION_PERFORMANCE_STAT_CARDS,
} from "@/constants/command-center";
import { useCandidateProcessingIssueColumns } from "@/hooks/candidate/tables/use-candidate-processing-issue-columns";
import { useRequisitionPerformanceColumns } from "@/hooks/tables/use-requisition-performance-columns";
import { useOperationsManagementFilters } from "@/hooks/use-operations-management-filters";
import type { RequisitionPerformanceTableItem } from "@/types/command-center";
import { ComplianceItemDetailDialog } from "./ComplianceItemDetailDialog";
import { OperationsFilterStatCard } from "./OperationsFilterStatCard";

export const OperationsManagementTab = () => {
	const [selectedRequisition, setSelectedRequisition] =
		useState<RequisitionPerformanceTableItem | null>(null);

	const {
		activeFilterKey,
		hasActiveFilter,
		activeCategory,
		activeFilterMeta,
		requisitionCountsByFilter,
		candidateCountsByFilter,
		requisitionRows,
		candidateRows,
		rowsTotal,
		page,
		setPage,
		limit,
		setLimit,
		pageSizeOptions,
		requisitionCardDescriptions,
		candidateCardDescriptions,
		requisitionCardActive,
		candidateCardActive,
		isLoading,
		handleFilterChange,
		clearFilter,
	} = useOperationsManagementFilters();

	const visibleRequisitionCards = REQUISITION_PERFORMANCE_STAT_CARDS.filter(
		(card) => requisitionCardActive?.[card.key] === true,
	);
	const visibleCandidateCards = CANDIDATE_PROCESSING_ISSUE_STAT_CARDS.filter(
		(card) => candidateCardActive?.[card.key] === true,
	);
	const noCardsConfigured =
		visibleRequisitionCards.length === 0 && visibleCandidateCards.length === 0;

	const pageCount = Math.ceil(rowsTotal / limit) || 1;
	const itemLabel =
		activeCategory === "requisition-performance" ? "requisition" : "candidate";
	const itemLabelPlural =
		activeCategory === "requisition-performance"
			? "requisitions"
			: "candidates";

	const { columns: requisitionColumns } = useRequisitionPerformanceColumns({
		onViewDetails: (row) => {
			setSelectedRequisition(row);
		},
	});

	const { columns: candidateColumns } = useCandidateProcessingIssueColumns();

	return (
		<div className="space-y-6">
			<div className="space-y-1.5">
				<h3 className="text-xl font-semibold">Operations Management</h3>
				<p className="text-muted-foreground text-sm">
					Monitor requisition performance and operational risk through
					interactive metrics
				</p>
			</div>

			<div className="space-y-3">
				<p className="flex items-center gap-2 text-lg font-semibold">
					<FileText className="text-primary size-4" />
					Requisition Performance
				</p>
				{visibleRequisitionCards.length > 0 ? (
					<div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
						{visibleRequisitionCards.map((card) => (
							<OperationsFilterStatCard
								key={card.key}
								card={{
									...card,
									description:
										requisitionCardDescriptions?.[card.key] ?? card.description,
								}}
								count={requisitionCountsByFilter[card.key]}
								isActive={activeFilterKey === card.key}
								onClick={() => handleFilterChange(card.key)}
							/>
						))}
					</div>
				) : isLoading ? null : (
					<div className="flex items-start gap-3 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm">
						<SlidersHorizontal
							className="mt-0.5 size-4 shrink-0 text-muted-foreground"
							aria-hidden
						/>
						<div className="flex flex-col gap-0.5">
							<p className="font-medium text-foreground">
								Requisition attention rules are not enabled
							</p>
							<p className="text-muted-foreground">
								Ask your admin to configure and enable these rules to see slow
								time-to-fill, no-submissions, and low-submissions metrics here.
							</p>
						</div>
					</div>
				)}
			</div>

			<div className="space-y-3">
				<p className="flex items-center gap-2 text-lg font-semibold">
					<UsersRound className="text-primary size-4" />
					Candidate Processing Issues
				</p>
				{visibleCandidateCards.length > 0 ? (
					<div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
						{visibleCandidateCards.map((card) => (
							<OperationsFilterStatCard
								key={card.key}
								card={{
									...card,
									description:
										candidateCardDescriptions?.[card.key] ?? card.description,
								}}
								count={candidateCountsByFilter[card.key]}
								isActive={activeFilterKey === card.key}
								onClick={() => handleFilterChange(card.key)}
							/>
						))}
					</div>
				) : isLoading ? null : (
					<div className="flex items-start gap-3 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm">
						<SlidersHorizontal
							className="mt-0.5 size-4 shrink-0 text-muted-foreground"
							aria-hidden
						/>
						<div className="flex flex-col gap-0.5">
							<p className="font-medium text-foreground">
								Candidate aging rules are not enabled
							</p>
							<p className="text-muted-foreground">
								Ask your admin to configure and enable the aging rules to see
								overdue submissions, aging stages, and onboarding delays here.
							</p>
						</div>
					</div>
				)}
			</div>

			{!noCardsConfigured && <Separator />}

			<div className="space-y-4">
				{noCardsConfigured ? null : hasActiveFilter && activeFilterMeta ? (
					<>
						<div className="flex flex-wrap items-start justify-between gap-3">
							<div>
								<p className="flex items-center gap-1.5 text-lg font-semibold">
									{activeFilterMeta.heading}
								</p>
								<p className="text-muted-foreground text-sm">
									{activeFilterMeta.description}
								</p>
							</div>
							<Button variant="outline" onClick={clearFilter}>
								Clear Filter
							</Button>
						</div>

						{activeCategory === "requisition-performance" ? (
							<CustomTable
								key={`${activeFilterKey}-${page}-${limit}`}
								data={requisitionRows}
								columns={requisitionColumns}
								enableSorting={false}
								enablePagination={false}
							/>
						) : (
							<CustomTable
								key={`${activeFilterKey}-${page}-${limit}`}
								data={candidateRows}
								columns={candidateColumns}
								enableSorting={false}
								enablePagination={false}
							/>
						)}
						<PaginationControls
							currentPage={page}
							pageCount={pageCount}
							goToPage={setPage}
							limit={limit}
							setLimit={setLimit}
							pageSizeOptions={pageSizeOptions}
							totalItems={rowsTotal}
							itemLabel={itemLabel}
							itemLabelPlural={itemLabelPlural}
						/>
					</>
				) : (
					<ConfigPageEmptyState
						className="py-16"
						hasSearch={false}
						emptyTitle="Select a metric above to view related requisitions"
						emptyMessage="Click any metric tile to drill down into specific operational issues."
					/>
				)}
			</div>
			<ComplianceItemDetailDialog
				item={selectedRequisition}
				isOpen={!!selectedRequisition}
				onClose={() => setSelectedRequisition(null)}
			/>
		</div>
	);
};
