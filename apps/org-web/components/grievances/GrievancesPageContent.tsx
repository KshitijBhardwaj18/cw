"use client";

import { Action, useAbility } from "@repo/casl";
import { ConfigPageEmptyState } from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { ConfigPagePagination } from "@repo/ui/general/ConfigPagePagination";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { SearchWithFilters } from "@repo/ui/shared/SearchWithFilters";
import { ClipboardList, Plus } from "lucide-react";
import { useState } from "react";
import { GRIEVANCES_PAGE_SIZE } from "@/constants/grievances";
import { useOrgContext } from "@/contexts/org-context";
import { useGrievanceListColumns } from "@/hooks/tables/use-grievance-list-columns";
import { useGrievancesPage } from "@/hooks/use-grievances-page";
import { GrievanceSummaryStatCards } from "./GrievanceSummaryStatCards";
import { LogGrievanceDialog } from "./LogGrievanceDialog";

export function GrievancesPageContent() {
	const ability = useAbility();
	const canLogGrievance = ability.can(Action.Create, "Grievance");

	const { id: orgId } = useOrgContext();
	const [logDialogOpen, setLogDialogOpen] = useState(false);

	const {
		search,
		setSearch,
		setStatusFilterFromSummary,
		activeSummaryKey,
		filtersExpanded,
		setFiltersExpanded,
		page,
		setPage,
		totalPages,
		summaryCounts,
		paginatedRows,
		totalFiltered,
		filterConfigs,
	} = useGrievancesPage(orgId);

	const columns = useGrievanceListColumns();

	const rangeStart =
		totalFiltered === 0 ? 0 : (page - 1) * GRIEVANCES_PAGE_SIZE + 1;
	const rangeEnd = (page - 1) * GRIEVANCES_PAGE_SIZE + paginatedRows.length;

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
				searchValue={search}
				onSearchChange={setSearch}
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
					hasSearch={false}
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
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<p className="text-muted-foreground text-sm">
							Showing {rangeStart}–{rangeEnd} of {totalFiltered} grievances
						</p>
						<ConfigPagePagination
							page={page}
							totalPages={totalPages}
							onPageChange={setPage}
						/>
					</div>
				</>
			)}

			<LogGrievanceDialog
				open={logDialogOpen}
				onOpenChange={setLogDialogOpen}
				orgId={orgId}
			/>
		</div>
	);
}
