"use client";

import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { Banner } from "@repo/ui/general/Banner";
import { ConfigPagePagination } from "@repo/ui/general/ConfigPagePagination";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { MetricCard } from "@repo/ui/general/MetricCard";
import { Bell, Settings } from "lucide-react";
import { SearchWithFilters } from "../../shared/SearchWithFilters";
import { TIMEKEEPING_POLICY_DEFAULTS } from "./constants";
import { BulkReminderDialog } from "./dialogs/BulkReminderDialog";
import {
	ConfigureMissingTimeDialog,
	type ConfigureMissingTimePolicyPayload,
} from "./dialogs/ConfigureMissingTimeDialog";
import { SendReminderDialog } from "./dialogs/SendReminderDialog";
import { ViewMissingTimeWorkerDialog } from "./dialogs/ViewMissingTimeWorkerDialog";
import { useMissingTimeColumns } from "./hooks/use-missing-time-columns";
import type {
	MissingTimeHandlers,
	MissingTimeStatCard,
	MissingTimeState,
} from "./types";

export interface MissingTimeEntriesTabContentProps {
	statCards: MissingTimeStatCard[];
	state: MissingTimeState;
	handlers: MissingTimeHandlers;
	deadlineDays?: number;
	reminderIntervalDays?: number;
	configurePolicy?: ConfigureMissingTimePolicyPayload;
	onSaveConfigurePolicy?: (payload: ConfigureMissingTimePolicyPayload) => void;
	isSavingPolicy?: boolean;
	onConfirmReminder: (msg?: string) => void;
	onConfirmBulkReminder: (msg?: string) => void;
	pagination?: {
		page: number;
		totalPages: number;
		onPageChange: (page: number) => void;
	};
	bulkAllCount?: number;
	canManageMissingTime?: boolean;
}

export function MissingTimeEntriesTabContent({
	statCards,
	state,
	handlers,
	deadlineDays = TIMEKEEPING_POLICY_DEFAULTS.submissionDeadlineDays,
	reminderIntervalDays = TIMEKEEPING_POLICY_DEFAULTS.reminderIntervalDays,
	configurePolicy = {
		submissionDeadlineDays: TIMEKEEPING_POLICY_DEFAULTS.submissionDeadlineDays,
		reminderIntervalDays: TIMEKEEPING_POLICY_DEFAULTS.reminderIntervalDays,
		autoCreateMissingCases: true,
	},
	onSaveConfigurePolicy,
	isSavingPolicy,
	onConfirmReminder,
	onConfirmBulkReminder,
	pagination,
	bulkAllCount,
	canManageMissingTime = true,
}: MissingTimeEntriesTabContentProps) {
	const { columns } = useMissingTimeColumns({
		onView: handlers.handleViewWorker,
		onRemind: handlers.handleSendReminder,
		deadlineDays,
		enableRemind: canManageMissingTime,
	});

	const effectiveBulkAll = bulkAllCount ?? state.filteredEntries.length;

	return (
		<div className="space-y-8 pb-10">
			<Banner
				variant="info"
				icon={<Settings className="size-4" />}
				title="Submission Deadline Policy"
				description={
					<>
						Time entries must be submitted within{" "}
						<span className="text-primary font-semibold underline decoration-2 underline-offset-2">
							{deadlineDays} {deadlineDays === 1 ? "day" : "days"}
						</span>{" "}
						of shift completion.
					</>
				}
				footer={`Entries exceeding this deadline are marked as 'Overdue' and require immediate follow-up. Reminders fire every ${reminderIntervalDays} days.`}
				action={
					onSaveConfigurePolicy ? (
						<Button
							variant="outline"
							size="sm"
							className="rounded-lg border-primary/30 text-primary hover:bg-primary/5"
							onClick={() => handlers.setIsConfigureOpen(true)}
						>
							Configure
						</Button>
					) : undefined
				}
			/>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				{statCards.map((card) => (
					<MetricCard
						key={card.key}
						title={card.label}
						value={card.key === "overdue" ? state.overdueCount : card.value}
						icon={card.icon}
						subLabel={card.subLabel}
						variant={card.variant}
					/>
				))}
			</div>

			<SearchWithFilters
				searchPlaceholder="Search workers, locations or departments..."
				searchValue={state.searchQuery}
				onSearchChange={handlers.setSearchQuery}
				filtersExpanded={state.isFiltersExpanded}
				onFiltersExpandedChange={handlers.setIsFiltersExpanded}
				filterConfigs={[]}
			/>

			<Card>
				<CardHeader>
					<CardTitle className="text-lg">
						Workers with Missing Time Entries
					</CardTitle>
					<CardDescription>
						Active workers who have not submitted time for expected work dates
					</CardDescription>
				</CardHeader>
				<CardContent>
					<CustomTable
						data={state.filteredEntries}
						columns={columns}
						className="border-none rounded-none"
					/>
					{pagination && (
						<ConfigPagePagination
							page={pagination.page}
							totalPages={pagination.totalPages}
							onPageChange={pagination.onPageChange}
						/>
					)}
				</CardContent>
			</Card>

			<Card className="gap-2">
				<CardHeader>
					<CardTitle className="text-lg">Bulk Actions</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{canManageMissingTime ? (
						<Banner
							variant="info"
							size="sm"
							icon={<Bell className="size-4" />}
							title="Reminder Notifications"
							description="Send automated reminder emails to workers who have missing time entries."
						/>
					) : null}

					<div className="flex flex-wrap gap-3">
						{canManageMissingTime ? (
							<>
								<Button
									className="font-semibold"
									onClick={() => handlers.handleBulkAction("all")}
								>
									Send Reminders to All
								</Button>
								<Button
									variant="destructive"
									className="font-semibold"
									onClick={() => handlers.handleBulkAction("overdue")}
								>
									Send Reminders to Overdue ({state.overdueCount})
								</Button>
							</>
						) : null}
						<Button
							variant="outline"
							className="font-semibold"
							onClick={handlers.handleExportReport}
						>
							Export Report
						</Button>
					</div>
				</CardContent>
			</Card>

			{onSaveConfigurePolicy && (
				<ConfigureMissingTimeDialog
					open={state.isConfigureOpen}
					onOpenChange={handlers.setIsConfigureOpen}
					submissionDeadlineDays={configurePolicy.submissionDeadlineDays}
					reminderIntervalDays={configurePolicy.reminderIntervalDays}
					autoCreateMissingCases={configurePolicy.autoCreateMissingCases}
					onSave={onSaveConfigurePolicy}
					isSaving={isSavingPolicy}
				/>
			)}

			<SendReminderDialog
				worker={state.selectedWorker}
				open={state.isReminderOpen}
				onOpenChange={handlers.setIsReminderOpen}
				onConfirm={onConfirmReminder}
			/>

			<ViewMissingTimeWorkerDialog
				worker={state.selectedWorker}
				open={state.isViewOpen}
				onOpenChange={handlers.setIsViewOpen}
				onSendReminder={
					canManageMissingTime ? handlers.handleSendReminder : undefined
				}
			/>

			<BulkReminderDialog
				open={state.isBulkOpen}
				onOpenChange={handlers.setIsBulkOpen}
				targetType={state.bulkTarget}
				count={
					state.bulkTarget === "all" ? effectiveBulkAll : state.overdueCount
				}
				onConfirm={onConfirmBulkReminder}
			/>
		</div>
	);
}
