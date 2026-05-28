"use client";

import { Action, useAbility } from "@repo/casl";
import { ConfigPageEmptyState } from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { CustomTable } from "@repo/ui/general/CustomTable";
import PaginationControls from "@repo/ui/general/PaginationControls";
import { SearchWithFilters } from "@repo/ui/shared/SearchWithFilters";
import { ClipboardList, Plus } from "lucide-react";
import { useState } from "react";
import { useGrievanceListColumns } from "@/hooks/tables/use-grievance-list-columns";
import { useGrievancesPage } from "@/hooks/use-grievances-page";
import { GrievanceSummaryStatCards } from "./GrievanceSummaryStatCards";
import { LogGrievanceDialog } from "./LogGrievanceDialog";

export function GrievancesPageContent() {
	const ability = useAbility();
	const canLogGrievance = ability.can(Action.Create, "Grievance");
	const [logDialogOpen, setLogDialogOpen] = useState(false);

	const {
		localSearch,
		handleSearchChange,
		setStatusFilterFromSummary,
		activeSummaryKey,
		filtersExpanded,
		setFiltersExpanded,
		page,
		setPage,
		limit,
		setLimit,
		pageSizeOptions,
		totalPages,
		summaryCounts,
		paginatedRows,
		totalFiltered,
		filterConfigs,
	} = useGrievancesPage();

	const columns = useGrievanceListColumns();

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Grievances"
				total={totalFiltered}
				itemLabel="grievance"
				itemLabelPlural="grievances"
				description="View and manage all logged grievances"
				actions={
					canLogGrievance
						? [
								{
									key: "log",
									label: "Log Grievance",
									icon: <Plus className="size-4" data-icon="inline-start" />,
									onClick: () => setLogDialogOpen(true),
								},
							]
						: []
				}
			/>

			<SearchWithFilters
				searchPlaceholder="Search by worker name or ID..."
				searchValue={localSearch}
				onSearchChange={handleSearchChange}
				filtersExpanded={filtersExpanded}
				onFiltersExpandedChange={setFiltersExpanded}
				filterConfigs={filterConfigs}
			/>

			<GrievanceSummaryStatCards
				counts={summaryCounts}
				activeKey={activeSummaryKey}
				onFilterChange={setStatusFilterFromSummary}
			/>

			{totalFiltered === 0 ? (
				<ConfigPageEmptyState
					hasSearch={localSearch.trim() !== ""}
					emptyTitle="No grievances in this view"
					emptyMessage="Try clearing search or filters, or log a new grievance."
					icon={ClipboardList}
				/>
			) : (
				<>
					<CustomTable
						data={paginatedRows}
						columns={columns}
						enableSorting
						enablePagination={false}
						emptyState={null}
					/>
					<PaginationControls
						currentPage={page}
						pageCount={totalPages}
						goToPage={setPage}
						limit={limit}
						setLimit={setLimit}
						pageSizeOptions={pageSizeOptions}
						totalItems={totalFiltered}
						itemLabel="grievance"
						itemLabelPlural="grievances"
					/>
				</>
			)}

			<LogGrievanceDialog
				open={logDialogOpen}
				onOpenChange={setLogDialogOpen}
			/>
		</div>
	);
}
