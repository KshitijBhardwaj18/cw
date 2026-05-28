"use client";

import { Action, useAbility } from "@repo/casl";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/skeleton";
import { ConfigPageErrorState } from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { MetricCard } from "@repo/ui/general/MetricCard";
import PaginationControls from "@repo/ui/general/PaginationControls";
import { SearchWithFilters } from "@repo/ui/shared/SearchWithFilters";
import {
	AlertCircle,
	Calendar,
	CheckCircle2,
	Clock,
	FileEdit,
	Loader2,
	Send,
	Upload,
} from "lucide-react";
import { useState } from "react";
import { useVendorTimekeeping } from "@/hooks/vendor/use-vendor-timekeeping";
import { TimekeepingEditDialog } from "./TimekeepingEditDialog";
import { VendorInternalUploadDialog } from "./VendorInternalUploadDialog";

export default function VendorTimekeepingPageContent() {
	const ability = useAbility();
	const canEditTimesheets = ability.can(Action.Update, "Timesheet");
	const canUploadTimesheets = ability.can(Action.Create, "Timesheet");
	const [uploadOpen, setUploadOpen] = useState(false);

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
		pageDraftCount,
		filterConfigs,
		filtersExpanded,
		setFiltersExpanded,
	} = useVendorTimekeeping({ allowEditActions: canEditTimesheets });

	return (
		<div className="space-y-10">
			<ConfigPageHeader
				title="Timekeeping & Shifts"
				description="Monitor candidate shifts and edit timecards before final submission"
				total={totalEntries}
				itemLabel="shift"
				itemLabelPlural="shifts"
				actions={
					canUploadTimesheets
						? [
								{
									key: "internal-upload",
									icon: <Upload data-icon="inline-start" />,
									label: "Internal Upload",
									className: "shrink-0",
									onClick: () => setUploadOpen(true),
								},
							]
						: []
				}
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

			<SearchWithFilters
				searchPlaceholder="Search by candidate name…"
				searchValue={search}
				onSearchChange={setSearch}
				filtersExpanded={filtersExpanded}
				onFiltersExpandedChange={setFiltersExpanded}
				filterConfigs={filterConfigs}
			/>

			{canEditTimesheets && pageDraftCount > 0 && !isEntriesLoading ? (
				<div className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-amber-900/40 dark:bg-amber-950/20">
					<div className="flex items-start gap-3">
						<FileEdit
							className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400"
							aria-hidden
						/>
						<div className="flex flex-col">
							<p className="text-sm font-medium text-amber-900 dark:text-amber-100">
								{pageDraftCount} draft{pageDraftCount === 1 ? "" : "s"} on this
								page
							</p>
							<p className="text-xs text-amber-800/80 dark:text-amber-200/70">
								Submit to mark these timecards final and ready for approval.
							</p>
						</div>
					</div>
					<Button
						type="button"
						size="sm"
						className="shrink-0 self-start sm:self-auto"
						onClick={handleSubmitAllPending}
						disabled={isSubmitting}
					>
						{isSubmitting ? (
							<>
								<Loader2 className="size-4 animate-spin" />
								Submitting…
							</>
						) : (
							<>
								<Send className="size-4" />
								Submit {pageDraftCount} draft
								{pageDraftCount === 1 ? "" : "s"}
							</>
						)}
					</Button>
				</div>
			) : null}

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
								totalItems={totalEntries}
								itemLabel="entry"
								itemLabelPlural="entries"
							/>
						)}
					</>
				)}
			</div>

			<TimekeepingEditDialog
				isOpen={isEditDialogOpen}
				onClose={closeEditDialog}
				onSave={handleSaveEdit}
				entry={editEntry}
				payCodeOptions={payCodeOptions}
			/>

			<VendorInternalUploadDialog
				isOpen={uploadOpen}
				onClose={() => setUploadOpen(false)}
			/>
		</div>
	);
}
