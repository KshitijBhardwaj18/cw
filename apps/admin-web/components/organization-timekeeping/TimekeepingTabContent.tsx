"use client";

import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { ConfigPagePagination } from "@repo/ui/general/ConfigPagePagination";
import { MetricCard } from "@repo/ui/general/MetricCard";
import { ScrollableLineTabsRow } from "@repo/ui/general/ScrollableLineTabsRow";
import { ApproveTimeLogDialog } from "@repo/ui/general/timekeeping/dialogs/ApproveTimeLogDialog";
import { DisputeDialog } from "@repo/ui/general/timekeeping/dialogs/DisputeDialog";
import { LocationAccordionRow } from "@repo/ui/general/timekeeping/LocationAccordionRow";
import { cn } from "@repo/ui/lib/utils";
import { SearchWithFilters } from "@repo/ui/shared/SearchWithFilters";
import { AlertTriangle, FileUp, Smartphone, Timer } from "lucide-react";
import { TIMEKEEPING_STATUS_FILTER_OPTIONS } from "@/constants/timekeeping";
import type { TimekeepingMainTabState } from "@/hooks/organization-timekeeping/use-timekeeping-main-tab";
import type { ApprovalStatusFilter } from "@/types/timekeeping";

export function TimekeepingTabContent(props: TimekeepingMainTabState) {
	const {
		searchQuery,
		setSearchQuery,
		isFiltersExpanded,
		setIsFiltersExpanded,
		groupedStatusFilter,
		setGroupedStatusFilter,
		groupedPage,
		setGroupedPage,
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
	} = props;

	return (
		<div className="space-y-6">
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
				<Empty className="border-muted/50 py-12">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Timer className="size-5" />
						</EmptyMedia>
						<EmptyTitle>No time entries found</EmptyTitle>
						<EmptyDescription>
							Try adjusting your search or filters.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : (
				<div>
					{filteredLocations.map((location) => (
						<LocationAccordionRow
							key={location.id}
							location={location}
							onApproveLog={openApproveDialog}
							onDisputeLog={openDisputeDialog}
						/>
					))}
					<ConfigPagePagination
						page={groupedPage}
						totalPages={groupedTotalPages}
						onPageChange={setGroupedPage}
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
