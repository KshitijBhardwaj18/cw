"use client";

import { Action, useAbility } from "@repo/casl";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { ConfigPagePagination } from "@repo/ui/general/ConfigPagePagination";
import { MetricCard } from "@repo/ui/general/MetricCard";
import { ScrollableLineTabsRow } from "@repo/ui/general/ScrollableLineTabsRow";
import { ApproveTimeLogDialog } from "@repo/ui/general/timekeeping/dialogs/ApproveTimeLogDialog";
import { DisputeDialog } from "@repo/ui/general/timekeeping/dialogs/DisputeDialog";
import type { ApprovalStatusFilter } from "@repo/ui/general/timekeeping/types";
import { cn } from "@repo/ui/lib/utils";
import { AlertTriangle, Check, Clock } from "lucide-react";
import { TIMEKEEPING_STATUS_FILTER_OPTIONS } from "@/constants/timekeeping";
import { useTimekeepingContext } from "@/contexts/timekeeping-context";
import { TimeApprovalCard } from "./TimeApprovalCard";

export function TimeApprovalTabContent() {
	const ability = useAbility();
	const canMutateTimesheet = ability.can(Action.Update, "Timesheet");

	const {
		approvalStatusFilter,
		setApprovalStatusFilter,
		approvalStatusCounts,
		isApproveDialogOpen,
		setIsApproveDialogOpen,
		selectedApproveLog,
		selectedApproveWorker,
		isDisputeDialogOpen,
		setIsDisputeDialogOpen,
		selectedDisputeLog,
		selectedDisputeWorker,
		handleApprovalCardApprove,
		handleApprovalCardDispute,
		confirmApproval,
		submitDispute,
		currentPage,
		setCurrentPage,
		totalPages,
		paginatedApprovalEntries,
	} = useTimekeepingContext();

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-3 gap-3">
				<MetricCard
					title="Pending"
					value={approvalStatusCounts.PENDING}
					subLabel="Awaiting review"
					icon={Clock}
					variant="warning"
				/>
				<MetricCard
					title="Approved"
					value={approvalStatusCounts.APPROVED}
					subLabel="Processed"
					icon={Check}
					variant="success"
				/>
				<MetricCard
					title="Disputed"
					value={approvalStatusCounts.DISPUTED}
					subLabel="Needs resolution"
					icon={AlertTriangle}
					variant="destructive"
				/>
			</div>

			<Tabs
				value={approvalStatusFilter}
				onValueChange={(v) => {
					setApprovalStatusFilter(v as ApprovalStatusFilter);
					setCurrentPage(1);
				}}
			>
				<ScrollableLineTabsRow>
					<TabsList
						variant="line"
						className="inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-0 rounded-none border-0 bg-transparent p-0"
					>
						{TIMEKEEPING_STATUS_FILTER_OPTIONS.map((option) => {
							const isActive = approvalStatusFilter === option.key;
							return (
								<TabsTrigger
									key={option.key}
									value={option.key}
									className="flex-none py-3 px-4"
								>
									{option.label}
									<span
										className={cn(
											"ml-1.5 inline-flex size-5 items-center justify-center rounded-full text-xs font-semibold transition-colors",
											isActive
												? "bg-primary text-primary-foreground"
												: "bg-muted text-muted-foreground",
										)}
									>
										{approvalStatusCounts[option.key] ?? 0}
									</span>
								</TabsTrigger>
							);
						})}
					</TabsList>
				</ScrollableLineTabsRow>
			</Tabs>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{paginatedApprovalEntries.map((entry) => (
					<TimeApprovalCard
						key={entry.id}
						entry={entry}
						onApprove={handleApprovalCardApprove}
						onDispute={handleApprovalCardDispute}
						canMutateTimesheet={canMutateTimesheet}
					/>
				))}
			</div>

			{totalPages > 1 && (
				<ConfigPagePagination
					page={currentPage}
					totalPages={totalPages}
					onPageChange={setCurrentPage}
				/>
			)}

			<ApproveTimeLogDialog
				isOpen={isApproveDialogOpen}
				onClose={() => setIsApproveDialogOpen(false)}
				onConfirm={confirmApproval}
				log={selectedApproveLog}
				worker={selectedApproveWorker}
			/>

			<DisputeDialog
				isOpen={isDisputeDialogOpen}
				onClose={() => setIsDisputeDialogOpen(false)}
				onSubmit={submitDispute}
				log={selectedDisputeLog}
				worker={selectedDisputeWorker}
			/>
		</div>
	);
}
