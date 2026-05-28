"use client";

import { Action, useAbility } from "@repo/casl";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { ConfigPageEmptyState } from "@repo/ui/general/ConfigPageEmptyState";
import { MetricCard } from "@repo/ui/general/MetricCard";
import PaginationControls from "@repo/ui/general/PaginationControls";
import { ScrollableLineTabsRow } from "@repo/ui/general/ScrollableLineTabsRow";
import { ApproveTimeLogDialog } from "@repo/ui/general/timekeeping/dialogs/ApproveTimeLogDialog";
import { DisputeDialog } from "@repo/ui/general/timekeeping/dialogs/DisputeDialog";
import { LocationAccordionRow } from "@repo/ui/general/timekeeping/LocationAccordionRow";
import { cn } from "@repo/ui/lib/utils";
import { SearchWithFilters } from "@repo/ui/shared/SearchWithFilters";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, FileUp, Smartphone, Timer } from "lucide-react";
import { TIMEKEEPING_STATUS_FILTER_OPTIONS } from "@/constants/timekeeping";
import { useTimekeepingContext } from "@/contexts/timekeeping-context";
import type { ApprovalStatusFilter } from "@/types/timekeeping";

export function TimekeepingTabContent() {
	const ability = useAbility();
	const canMutateTimesheet = ability.can(Action.Update, "Timesheet");

	const {
		searchQuery,
		setSearchQuery,
		isFiltersExpanded,
		setIsFiltersExpanded,
		groupedStatusFilter,
		setGroupedStatusFilter,
		groupedPage,
		setGroupedPage,
		groupedLimit,
		setGroupedLimit,
		groupedPageSizeOptions,
		groupedTotalCount,
		groupedTotalPages,
		isDisputeDialogOpen,
		setIsDisputeDialogOpen,
		selectedDisputeLog,
		selectedDisputeWorker,
		isApproveDialogOpen,
		setIsApproveDialogOpen,
		selectedApproveLog,
		selectedApproveWorker,
		filteredLocations,
		locationStatusCounts,
		timekeepingStats,
		openDisputeDialog,
		openApproveDialog,
		submitDispute,
		confirmApproval,
		filterConfigs,
	} = useTimekeepingContext();

	const lastRefreshedLabel = timekeepingStats.lastRefreshedAt
		? `Stats last refreshed ${formatDistanceToNow(
				new Date(timekeepingStats.lastRefreshedAt),
				{ addSuffix: true },
			)}`
		: "Stats awaiting first refresh";

	return (
		<div className="space-y-6">
			<p className="text-muted-foreground text-xs">{lastRefreshedLabel}</p>
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
				<MetricCard
					title="Total Entries"
					value={timekeepingStats.totalEntries}
					subLabel="All time logs"
					icon={Timer}
					variant="primary"
				/>
				<MetricCard
					title="File Uploads"
					value={timekeepingStats.fileUploads}
					subLabel="Via file/integration"
					icon={FileUp}
					variant="info"
				/>
				<MetricCard
					title="Mobile App"
					value={timekeepingStats.mobileApps}
					subLabel="Via mobile clock-in"
					icon={Smartphone}
					variant="default"
					className="[&_.text-2xl]:text-violet-600 [&_svg]:text-violet-600"
				/>
				<MetricCard
					title="Total Hours"
					value={timekeepingStats.totalHours}
					subLabel="This period"
					icon={Timer}
					variant="default"
				/>
				<MetricCard
					title="Open Disputes"
					value={timekeepingStats.openDisputes}
					subLabel="Requires action"
					icon={AlertTriangle}
					variant="destructive"
				/>
			</div>

			<SearchWithFilters
				searchPlaceholder="Search by worker, location, or department..."
				searchValue={searchQuery}
				onSearchChange={setSearchQuery}
				filtersExpanded={isFiltersExpanded}
				onFiltersExpandedChange={setIsFiltersExpanded}
				filterConfigs={filterConfigs}
			/>

			<Tabs
				value={groupedStatusFilter}
				onValueChange={(v) => {
					setGroupedStatusFilter(v as ApprovalStatusFilter);
					setGroupedPage(1);
				}}
				className="min-w-0"
			>
				<ScrollableLineTabsRow>
					<TabsList
						variant="line"
						className="inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-0 rounded-none border-0 bg-transparent p-0"
					>
						{TIMEKEEPING_STATUS_FILTER_OPTIONS.map((option) => {
							const isActive = groupedStatusFilter === option.key;
							return (
								<TabsTrigger
									key={option.key}
									value={option.key}
									className="flex-none py-3 px-4"
								>
									{option.label}
									<span
										className={cn(
											"ml-1.5 inline-flex size-5 items-center justify-center rounded-full text-xs font-semibold",
											isActive
												? "bg-primary text-primary-foreground"
												: "bg-muted text-muted-foreground",
										)}
									>
										{locationStatusCounts[option.key]}
									</span>
								</TabsTrigger>
							);
						})}
					</TabsList>
				</ScrollableLineTabsRow>
			</Tabs>

			{filteredLocations.length === 0 ? (
				<ConfigPageEmptyState
					hasSearch={false}
					emptyTitle="No time entries found"
					emptyMessage="Try adjusting your search or filters."
					icon={Timer}
				/>
			) : (
				<div>
					{filteredLocations.map((location) => (
						<LocationAccordionRow
							key={location.id}
							location={location}
							onApproveLog={openApproveDialog}
							onDisputeLog={openDisputeDialog}
							approvalActionsEnabled={canMutateTimesheet}
						/>
					))}
					<PaginationControls
						currentPage={groupedPage}
						pageCount={groupedTotalPages}
						goToPage={setGroupedPage}
						limit={groupedLimit}
						setLimit={setGroupedLimit}
						pageSizeOptions={groupedPageSizeOptions}
						totalItems={groupedTotalCount}
						itemLabel="location"
						itemLabelPlural="locations"
					/>
				</div>
			)}

			<DisputeDialog
				isOpen={isDisputeDialogOpen}
				onClose={() => setIsDisputeDialogOpen(false)}
				onSubmit={submitDispute}
				log={selectedDisputeLog}
				worker={selectedDisputeWorker}
			/>
			<ApproveTimeLogDialog
				isOpen={isApproveDialogOpen}
				onClose={() => setIsApproveDialogOpen(false)}
				onConfirm={confirmApproval}
				log={selectedApproveLog}
				worker={selectedApproveWorker}
			/>
		</div>
	);
}
