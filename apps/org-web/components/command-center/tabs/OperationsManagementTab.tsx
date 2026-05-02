"use client";

import { Button } from "@repo/ui/components/button";
import { Separator } from "@repo/ui/components/separator";
import { ConfigPageEmptyState } from "@repo/ui/general/ConfigPageEmptyState";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { FileText, UsersRound } from "lucide-react";
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
		limit,
		handleFilterChange,
		handlePaginationChange,
		clearFilter,
	} = useOperationsManagementFilters();

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
				<div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
					{REQUISITION_PERFORMANCE_STAT_CARDS.map((card) => (
						<OperationsFilterStatCard
							key={card.key}
							card={card}
							count={requisitionCountsByFilter[card.key]}
							isActive={activeFilterKey === card.key}
							onClick={() => handleFilterChange(card.key)}
						/>
					))}
				</div>
			</div>

			<div className="space-y-3">
				<p className="flex items-center gap-2 text-lg font-semibold">
					<UsersRound className="text-primary size-4" />
					Candidate Processing Issues
				</p>
				<div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
					{CANDIDATE_PROCESSING_ISSUE_STAT_CARDS.map((card) => (
						<OperationsFilterStatCard
							key={card.key}
							card={card}
							count={candidateCountsByFilter[card.key]}
							isActive={activeFilterKey === card.key}
							onClick={() => handleFilterChange(card.key)}
						/>
					))}
				</div>
			</div>

			<Separator />

			<div className="space-y-4">
				{hasActiveFilter && activeFilterMeta ? (
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
								enablePagination
								paginationMode="server"
								totalCount={rowsTotal}
								currentPage={page}
								pageSize={limit}
								onPaginationChange={handlePaginationChange}
							/>
						) : (
							<CustomTable
								key={`${activeFilterKey}-${page}-${limit}`}
								data={candidateRows}
								columns={candidateColumns}
								enableSorting={false}
								enablePagination
								paginationMode="server"
								totalCount={rowsTotal}
								currentPage={page}
								pageSize={limit}
								onPaginationChange={handlePaginationChange}
							/>
						)}
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
