"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../../components/card";
import { CustomTable } from "../../general/CustomTable";
import { MetricCard } from "../../general/MetricCard";
import { SearchWithFilters } from "../../shared/SearchWithFilters";
import { ApproveTimeLogDialog } from "./dialogs/ApproveTimeLogDialog";
import { DisputeDetailsDialog } from "./dialogs/DisputeDetailsDialog";
import { DisputeDialog } from "./dialogs/DisputeDialog";
import { useDisputeLogColumns } from "./hooks/use-dispute-log-columns";
import type {
	DisputeHandlers,
	DisputeLogEntry,
	DisputeStatCard,
	DisputeState,
	DisputeStatusFilter,
	TimeLog,
	WorkerTimekeeping,
} from "./types";

interface DisputeLogTabContentProps {
	statCards: DisputeStatCard[];
	statusOptions: { value: string; label: string }[];
	state: DisputeState;
	handlers: DisputeHandlers;
	dialogs: {
		detail: {
			isOpen: boolean;
			setIsOpen: (o: boolean) => void;
			log: DisputeLogEntry | null;
		};
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

export function DisputeLogTabContent({
	statCards,
	statusOptions,
	state,
	handlers,
	dialogs,
	submitDispute,
	confirmApproval,
}: DisputeLogTabContentProps) {
	const { columns } = useDisputeLogColumns({
		onResolve: handlers.handleResolve,
		onReject: handlers.handleReject,
		onView: handlers.openDetailDialog,
	});

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
				{statCards.map((card) => (
					<MetricCard
						key={card.key}
						title={card.label}
						value={state.statusCounts[card.key] ?? 0}
						icon={card.icon}
						subLabel={card.subLabel}
						variant={card.variant}
					/>
				))}
			</div>

			<SearchWithFilters
				searchPlaceholder="Search workers, ID or reason..."
				searchValue={state.searchQuery}
				onSearchChange={handlers.setSearchQuery}
				filtersExpanded={state.isFiltersExpanded}
				onFiltersExpandedChange={handlers.setIsFiltersExpanded}
				filterConfigs={[
					{
						id: "ds-status",
						label: "Status",
						value: state.statusFilter,
						onValueChange: (val: string) =>
							handlers.setStatusFilter(val as DisputeStatusFilter),
						options: statusOptions,
					},
				]}
			/>

			<Card>
				<CardHeader>
					<CardTitle className="text-lg">All Disputes</CardTitle>
					<CardDescription>
						Complete history of time entry disputes and their resolutions
					</CardDescription>
				</CardHeader>
				<CardContent>
					<CustomTable
						data={state.filteredLogs}
						columns={columns}
						className="rounded-none border-0"
					/>
				</CardContent>
			</Card>

			<ApproveTimeLogDialog
				isOpen={dialogs.approve.isOpen}
				onClose={() => dialogs.approve.setIsOpen(false)}
				onConfirm={confirmApproval}
				log={dialogs.approve.log}
				worker={dialogs.approve.worker}
				mode="dispute-resolution"
			/>

			<DisputeDetailsDialog
				isOpen={dialogs.detail.isOpen}
				onClose={() => dialogs.detail.setIsOpen(false)}
				dispute={dialogs.detail.log}
			/>

			<DisputeDialog
				isOpen={dialogs.dispute.isOpen}
				onClose={() => dialogs.dispute.setIsOpen(false)}
				onSubmit={submitDispute}
				log={dialogs.dispute.log}
				worker={dialogs.dispute.worker}
			/>
		</div>
	);
}
