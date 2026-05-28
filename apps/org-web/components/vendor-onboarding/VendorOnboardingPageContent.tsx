"use client";

import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/skeleton";
import {
	ConfigPageEmptyState,
	ConfigPageErrorState,
} from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { MetricCard } from "@repo/ui/general/MetricCard";
import PaginationControls from "@repo/ui/general/PaginationControls";
import { AlertCircle, Calendar, CheckCircle2, Clock } from "lucide-react";
import { useVendorOnboarding } from "@/hooks/vendor/use-vendor-onboarding";
import { VendorOnboardingCandidateSection } from "./VendorOnboardingCandidateSection";

const WEEK_TABS: { value: "1" | "2" | "3" | "all"; label: string }[] = [
	{ value: "all", label: "All (21d)" },
	{ value: "1", label: "Week 1" },
	{ value: "2", label: "Week 2" },
	{ value: "3", label: "Week 3" },
];

export function VendorOnboardingPageContent() {
	const {
		metrics,
		isMetricsLoading,
		group,
		listQuery,
		totalRows,
		pageCount,
		page,
		setPage,
		limit,
		setLimit,
		pageSizeOptions,
		weekBucket,
		setWeekBucket,
		search,
		setSearch,
		sendOnboardingReminder,
		isReminderPending,
	} = useVendorOnboarding();

	return (
		<div className="space-y-10">
			<ConfigPageHeader
				title="Onboarding Tracker"
				description="Monitor placement compliance progress for upcoming starts (next 21 days)"
				total={metrics?.totalPlacements ?? 0}
				itemLabel="placement"
				itemLabelPlural="placements"
				search={{
					value: search,
					onChange: setSearch,
					placeholder: "Search by name, email, or job title...",
				}}
			/>

			{isMetricsLoading || !metrics ? (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-28 w-full rounded-lg" />
					))}
				</div>
			) : (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<MetricCard
						title={`Total starting (${metrics.windowDays}d)`}
						value={metrics.totalPlacements}
						icon={Calendar}
						variant="info"
					/>
					<MetricCard
						title="Cleared"
						value={metrics.cleared}
						icon={CheckCircle2}
						variant="success"
					/>
					<MetricCard
						title="In progress"
						value={metrics.inProgress}
						icon={Clock}
						variant="warning"
					/>
					<MetricCard
						title="Behind schedule"
						value={metrics.behindSchedule}
						icon={AlertCircle}
						variant="error"
					/>
				</div>
			)}

			<div className="flex flex-wrap gap-2">
				{WEEK_TABS.map((tab) => (
					<Button
						key={tab.value}
						type="button"
						variant={weekBucket === tab.value ? "default" : "outline"}
						size="sm"
						onClick={() => setWeekBucket(tab.value)}
					>
						{tab.label}
					</Button>
				))}
			</div>

			{listQuery.isError ? (
				<ConfigPageErrorState
					title="Could not load onboarding tracker"
					description="Try again or contact support."
					icon={AlertCircle}
				/>
			) : listQuery.isLoading || !group ? (
				<div className="space-y-3">
					<Skeleton className="h-40 w-full rounded-lg" />
				</div>
			) : group.candidates.length === 0 ? (
				<ConfigPageEmptyState
					hasSearch={false}
					emptyTitle="No placements in this window"
					emptyMessage="Try another week filter or clear search."
					icon={Calendar}
				/>
			) : (
				<>
					<VendorOnboardingCandidateSection
						key={`${weekBucket}-${page}`}
						group={group}
						onSendReminder={sendOnboardingReminder}
						isReminderPending={isReminderPending}
					/>
					<PaginationControls
						currentPage={page}
						pageCount={pageCount}
						goToPage={setPage}
						limit={limit}
						setLimit={setLimit}
						pageSizeOptions={pageSizeOptions}
						totalItems={totalRows}
						itemLabel="placement"
						itemLabelPlural="placements"
					/>
				</>
			)}
		</div>
	);
}

export default VendorOnboardingPageContent;
