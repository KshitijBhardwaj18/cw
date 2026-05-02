"use client";

import { Timer } from "lucide-react";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "../../components/empty";
import { Tabs, TabsList, TabsTrigger } from "../../components/tabs";
import { cn } from "../../lib/utils";
import { SearchWithFilters } from "../../shared/SearchWithFilters";
import { MetricCard } from "../MetricCard";
import { ScrollableLineTabsRow } from "../ScrollableLineTabsRow";
import { ApproveTimeLogDialog } from "./dialogs/ApproveTimeLogDialog";
import { DisputeDialog } from "./dialogs/DisputeDialog";
import { LocationAccordionRow } from "./LocationAccordionRow";
import type {
	ApprovalStatusFilter,
	DataSourceFilter,
	TimekeepingHandlers,
	TimekeepingStatCard,
	TimekeepingState,
	TimeLog,
	WorkerTimekeeping,
} from "./types";

interface TimekeepingTabContentProps {
	statCards: TimekeepingStatCard[];
	dataSourceOptions: { value: string; label: string }[];
	statusFilterOptions: { key: ApprovalStatusFilter; label: string }[];
	state: TimekeepingState;
	handlers: TimekeepingHandlers;
	dialogs: {
		dispute: {
			isOpen: boolean;
			setIsOpen: (o: boolean) => void;
			log: TimeLog | null;
			worker: WorkerTimekeeping | null;
		};
		approve: {
			isOpen: boolean;
			setIsOpen: (o: boolean) => void;
			log: TimeLog | null;
			worker: WorkerTimekeeping | null;
		};
	};
	submitDispute: (reason: string) => void;
	confirmApproval: () => void;
}

export function TimekeepingTabContent({
	statCards,
	dataSourceOptions,
	statusFilterOptions,
	state,
	handlers,
	dialogs,
	submitDispute,
	confirmApproval,
}: TimekeepingTabContentProps) {
	const statValueMap: Record<string, number | string> = {
		total: state.stats.totalEntries,
		file: state.stats.fileUploads,
		mobile: state.stats.mobileApps,
		hours: state.stats.totalHours,
		disputes: state.stats.openDisputes,
	};

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
				{statCards.map((card) => (
					<MetricCard
						key={card.key}
						title={card.label}
						value={statValueMap[card.key] ?? card.value}
						icon={card.icon}
						subLabel={card.subLabel}
						variant={card.variant}
					/>
				))}
			</div>

			<SearchWithFilters
				searchPlaceholder="Search by worker, location, or department..."
				searchValue={state.searchQuery}
				onSearchChange={handlers.setSearchQuery}
				filtersExpanded={state.isFiltersExpanded}
				onFiltersExpandedChange={handlers.setIsFiltersExpanded}
				filterConfigs={[
					{
						id: "timekeeping-filter-source",
						label: "Data Source",
						value: state.dataSourceFilter,
						onValueChange: (v) =>
							handlers.setDataSourceFilter(v as DataSourceFilter),
						placeholder: "All Sources",
						options: dataSourceOptions,
					},
				]}
			/>

			<Tabs
				value={state.statusFilter}
				onValueChange={(v) =>
					handlers.setStatusFilter(v as ApprovalStatusFilter)
				}
				className="min-w-0"
			>
				<ScrollableLineTabsRow>
					<TabsList
						variant="line"
						className="inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-0 rounded-none border-0 bg-transparent p-0"
					>
						{statusFilterOptions.map((option) => {
							const isActive = state.statusFilter === option.key;
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
										{state.locationStatusCounts[option.key] || 0}
									</span>
								</TabsTrigger>
							);
						})}
					</TabsList>
				</ScrollableLineTabsRow>
			</Tabs>

			{state.filteredLocations.length === 0 ? (
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
					{state.filteredLocations.map((location) => (
						<LocationAccordionRow
							key={location.id}
							location={location}
							onApproveLog={handlers.openApproveDialog}
							onDisputeLog={handlers.openDisputeDialog}
						/>
					))}
				</div>
			)}

			<DisputeDialog
				isOpen={dialogs.dispute.isOpen}
				onClose={() => dialogs.dispute.setIsOpen(false)}
				onSubmit={submitDispute}
				log={dialogs.dispute.log}
				worker={dialogs.dispute.worker}
			/>
			<ApproveTimeLogDialog
				isOpen={dialogs.approve.isOpen}
				onClose={() => dialogs.approve.setIsOpen(false)}
				onConfirm={confirmApproval}
				log={dialogs.approve.log}
				worker={dialogs.approve.worker}
			/>
		</div>
	);
}
