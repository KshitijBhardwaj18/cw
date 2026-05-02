"use client";

import { Action, useAbility } from "@repo/casl";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/skeleton";
import { ConfigPageErrorState } from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { MetricCard } from "@repo/ui/general/MetricCard";
import PaginationControls from "@repo/ui/general/PaginationControls";
import { AlertCircle, Calendar, CheckCircle2, Clock } from "lucide-react";
import { useVendorTimekeeping } from "@/hooks/vendor/use-vendor-timekeeping";
import { TimekeepingEditDialog } from "./TimekeepingEditDialog";

export default function VendorTimekeepingPageContent() {
	const ability = useAbility();
	const canEditTimesheets = ability.can(Action.Update, "Timesheet");

	const {
		columns,
		editEntry,
		isEditDialogOpen,
		handleSaveEdit,
		closeEditDialog,
		metrics,
		isMetricsLoading,
		entries,
		payCodeOptions,
		totalEntries,
		pageCount,
		page,
		setPage,
		limit,
		setLimit,
		pageSizeOptions,
		search,
		setSearch,
		isEntriesLoading,
		isEntriesError,
		handleSubmitAllPending,
		isSubmitting,
	} = useVendorTimekeeping({ allowEditActions: canEditTimesheets });

	return (
		<div className="space-y-10">
			<ConfigPageHeader
				title="Timekeeping & Shifts"
				description="Monitor candidate shifts and edit timecards before final submission"
				total={totalEntries}
				itemLabel="shift"
				itemLabelPlural="shifts"
				search={{
					value: search,
					onChange: setSearch,
					placeholder: "Search by candidate name…",
				}}
			/>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{isMetricsLoading || !metrics ? (
					Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-28 w-full rounded-lg" />
					))
				) : (
					<>
						<MetricCard
							title="Total Shifts"
							value={metrics.totalShifts}
							icon={Calendar}
							variant="primary"
						/>
						<MetricCard
							title="Pending Review"
							value={metrics.pendingReview}
							icon={Clock}
							variant="warning"
						/>
						<MetricCard
							title="Errors / disputes"
							value={metrics.errors}
							icon={AlertCircle}
							variant="error"
						/>
						<MetricCard
							title="Total Hours"
							value={metrics.totalHours.toFixed(1)}
							icon={CheckCircle2}
							variant="success"
						/>
					</>
				)}
			</div>

			<div className="space-y-6">
				{isEntriesLoading ? (
					<div className="space-y-3">
						<Skeleton className="h-10 w-full rounded-lg" />
						<Skeleton className="h-64 w-full rounded-lg" />
					</div>
				) : isEntriesError ? (
					<ConfigPageErrorState
						className="py-16"
						title="Failed to load time entries"
						description="Please try again."
						icon={AlertCircle}
					/>
				) : (
					<>
						<CustomTable columns={columns} data={entries} />
						{totalEntries > 0 && (
							<PaginationControls
								currentPage={page}
								pageCount={pageCount}
								goToPage={setPage}
								limit={limit}
								setLimit={setLimit}
								pageSizeOptions={pageSizeOptions}
							/>
						)}
					</>
				)}

				{canEditTimesheets ? (
					<div className="mt-4 flex items-center justify-end gap-3">
						<Button
							type="button"
							onClick={handleSubmitAllPending}
							disabled={isSubmitting || isEntriesLoading}
						>
							{isSubmitting ? "Submitting…" : "Submit all drafts"}
						</Button>
					</div>
				) : null}
			</div>

			<TimekeepingEditDialog
				isOpen={isEditDialogOpen}
				onClose={closeEditDialog}
				onSave={handleSaveEdit}
				entry={editEntry}
				payCodeOptions={payCodeOptions}
			/>
		</div>
	);
}
