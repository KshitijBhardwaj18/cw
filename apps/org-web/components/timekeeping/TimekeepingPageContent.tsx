"use client";

import {
	Action,
	filterReadableTabs,
	TIMEKEEPING_TAB_SUBJECTS,
	type TimekeepingTabSubjectKey,
	useAbility,
} from "@repo/casl";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@repo/ui/components/tabs";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { ScrollableLineTabsRow } from "@repo/ui/general/ScrollableLineTabsRow";
import { HolidaysTabContent } from "@repo/ui/general/timekeeping/HolidaysTabContent";
import { MissingTimeEntriesTabContent } from "@repo/ui/general/timekeeping/MissingTimeEntriesTabContent";
import { PayCodesTabContent } from "@repo/ui/general/timekeeping/PayCodesTabContent";
import { TimeReportsTabContent } from "@repo/ui/general/timekeeping/TimeReportsTabContent";
import type {
	MissingTimeHandlers,
	MissingTimeStatCard,
	MissingTimeState,
} from "@repo/ui/general/timekeeping/types";
import {
	AlertTriangle,
	Calendar,
	Clock,
	DollarSign,
	FileSearch,
	Landmark,
	Timer,
	Upload,
	Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useOrgContext } from "@/contexts/org-context";
import {
	TimekeepingProvider,
	useTimekeepingContext,
} from "@/contexts/timekeeping-context";
import { usePayCodeStats, usePayCodes } from "@/queries/billing.queries";
import {
	useDisputeStatusCounts,
	useHolidayStats,
	useHolidays,
	useMissingTimeStats,
	useTimekeepingPolicy,
	useUpdateTimekeepingPolicy,
} from "@/queries/timekeeping.queries";
import { DisputeLogTabContent } from "./DisputeLogTabContent";
import { InternalUploadDialog } from "./InternalUploadDialog";
import { TimeApprovalTabContent } from "./TimeApprovalTabContent";
import { TimekeepingTabContent } from "./TimekeepingTabContent";

const PAY_CODES_PAGE_SIZE = 20;
const HOLIDAYS_PAGE_SIZE = 20;

const TIMEKEEPING_TAB_ORDER = [
	"timekeeping",
	"time-approval",
	"dispute-log",
	"missing-time",
	"time-reports",
	"pay-codes",
	"holidays",
] as const satisfies readonly TimekeepingTabSubjectKey[];

function TimekeepingPageInner() {
	const ability = useAbility();
	const canUploadTimesheets = ability.can(Action.Create, "Timesheet");
	const canManageMissingTime = ability.can(Action.Update, "MissingTimeCase");

	const allowedTabs = useMemo(
		() =>
			filterReadableTabs(
				ability,
				TIMEKEEPING_TAB_ORDER,
				TIMEKEEPING_TAB_SUBJECTS,
			),
		[ability],
	);
	const visibleTabs = useMemo(() => new Set(allowedTabs), [allowedTabs]);

	const { id: orgId } = useOrgContext();
	const { data: disputeCounts } = useDisputeStatusCounts(orgId);
	const openDisputeCount = disputeCounts?.open ?? 0;
	const totalDisputes =
		(disputeCounts?.open ?? 0) +
		(disputeCounts?.resolved ?? 0) +
		(disputeCounts?.rejected ?? 0);

	const [activeTab, setActiveTab] = useState<TimekeepingTabSubjectKey>(
		allowedTabs[0] ?? "timekeeping",
	);
	const [uploadOpen, setUploadOpen] = useState(false);

	const ctx = useTimekeepingContext();

	const { data: missingTimeStats } = useMissingTimeStats(orgId);
	const { data: policy } = useTimekeepingPolicy(orgId);
	const updatePolicy = useUpdateTimekeepingPolicy(orgId);

	const { data: payCodeStats } = usePayCodeStats(orgId);
	const [payCodePage, setPayCodePage] = useState(1);
	const { data: payCodesPage } = usePayCodes(orgId, {
		page: payCodePage,
		limit: PAY_CODES_PAGE_SIZE,
	});

	const currentYear = new Date().getFullYear();
	const [holidayPage, setHolidayPage] = useState(1);
	const { data: holidayStats } = useHolidayStats(orgId, currentYear);
	const { data: holidaysPage } = useHolidays(orgId, {
		year: currentYear,
		page: holidayPage,
		limit: HOLIDAYS_PAGE_SIZE,
	});

	const effectiveDeadlineDays = policy?.submissionDeadlineDays ?? 3;
	const effectiveReminderDays = policy?.reminderIntervalDays ?? 2;

	const missingStatCards = useMemo((): MissingTimeStatCard[] => {
		return [
			{
				key: "workers",
				label: "Total Missing",
				value: missingTimeStats?.total ?? 0,
				subLabel: "Active open cases",
				icon: Users,
				variant: "warning",
			},
			{
				key: "days",
				label: "Resolved",
				value: missingTimeStats?.resolved ?? 0,
				subLabel: "Submitted or waived",
				icon: Clock,
				variant: "success",
			},
			{
				key: "overdue",
				label: "Overdue",
				value: missingTimeStats?.overdue ?? 0,
				subLabel: "Needs follow-up",
				icon: AlertTriangle,
				variant: "error",
			},
		];
	}, [missingTimeStats]);

	const missingState: MissingTimeState = {
		searchQuery: ctx.searchQuery,
		filteredEntries: ctx.missingTimeEntries,
		overdueCount: ctx.overdueCount,
		isFiltersExpanded: ctx.isFiltersExpanded,
		isConfigureOpen: ctx.isConfigureOpen,
		isReminderOpen: ctx.isReminderOpen,
		isViewOpen: ctx.isViewOpen,
		isBulkOpen: ctx.isBulkOpen,
		bulkTarget: ctx.bulkTarget,
		selectedWorker: ctx.selectedWorker,
	};

	const missingHandlers: MissingTimeHandlers = {
		setSearchQuery: ctx.setSearchQuery,
		setIsFiltersExpanded: ctx.setIsFiltersExpanded,
		setIsConfigureOpen: ctx.setIsConfigureOpen,
		setIsReminderOpen: ctx.setIsReminderOpen,
		setIsViewOpen: ctx.setIsViewOpen,
		setIsBulkOpen: ctx.setIsBulkOpen,
		handleViewWorker: ctx.handleViewWorker,
		handleSendReminder: ctx.handleSendReminder,
		handleBulkAction: ctx.handleBulkAction,
		handleExportReport: ctx.handleExportReport,
	};

	const payCodeMetricCards = useMemo(() => {
		return [
			{
				key: "total-pay-codes",
				label: "Total Pay Codes",
				value: payCodeStats?.total ?? 0,
				icon: DollarSign,
				variant: "primary" as const,
			},
			{
				key: "active-codes",
				label: "Active Codes",
				value: payCodeStats?.active ?? 0,
				icon: Clock,
				variant: "success" as const,
			},
			{
				key: "categories",
				label: "Categories",
				value: payCodeStats?.categories ?? 0,
				icon: Landmark,
				variant: "info" as const,
			},
		];
	}, [payCodeStats]);

	const payCodeRows = useMemo(() => {
		const rows = payCodesPage?.data ?? [];
		return rows.map((r) => ({
			category: r.category,
			code: r.code,
			description: r.description,
			multiplier: r.multiplier,
		}));
	}, [payCodesPage?.data]);

	const holidayMetricCards = useMemo(() => {
		return [
			{
				key: "total-holidays",
				label: "Total Holidays",
				value: holidayStats?.total ?? 0,
				icon: Calendar,
				variant: "primary" as const,
			},
			{
				key: "federal-holidays",
				label: "Federal Holidays",
				value: holidayStats?.federal ?? 0,
				icon: Landmark,
				variant: "info" as const,
			},
			{
				key: "organization",
				label: "Organization Holidays",
				value: holidayStats?.organization ?? 0,
				icon: Calendar,
				variant: "success" as const,
			},
		];
	}, [holidayStats]);

	const holidayRows = useMemo(() => {
		return (holidaysPage?.data ?? []).map((h) => ({
			id: h.id,
			name: h.name,
			observedOn: h.observedOn,
			holidayType: h.holidayType,
			type: h.holidayType ?? "Holiday",
		}));
	}, [holidaysPage?.data]);

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Timekeeping"
				total={totalDisputes}
				itemLabel="dispute"
				itemLabelPlural="disputes"
				description="Track, review, and approve worker time entries across all locations"
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

			<Tabs
				value={activeTab}
				onValueChange={(value) =>
					setActiveTab(value as TimekeepingTabSubjectKey)
				}
				className="w-full flex-col space-y-6"
			>
				<ScrollableLineTabsRow>
					<TabsList
						variant="line"
						className="inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-0 rounded-none border-0 bg-transparent p-0"
					>
						{visibleTabs.has("timekeeping") && (
							<TabsTrigger value="timekeeping" className="flex-none py-3 px-4">
								<Timer className="size-4" />
								Timekeeping
							</TabsTrigger>
						)}

						{visibleTabs.has("time-approval") && (
							<TabsTrigger
								value="time-approval"
								className="flex-none py-3 px-4"
							>
								<Clock className="size-4" />
								Time Approval
							</TabsTrigger>
						)}

						{visibleTabs.has("dispute-log") && (
							<TabsTrigger
								value="dispute-log"
								className="relative flex-none py-3 px-4"
							>
								<AlertTriangle className="size-4" />
								Dispute Log
								{openDisputeCount > 0 && (
									<span className="bg-destructive text-destructive-foreground inline-flex size-4 items-center justify-center rounded-full text-xs font-semibold">
										{openDisputeCount}
									</span>
								)}
							</TabsTrigger>
						)}

						{visibleTabs.has("missing-time") && (
							<TabsTrigger value="missing-time" className="flex-none py-3 px-4">
								<FileSearch className="size-4" />
								Missing Time Entries
							</TabsTrigger>
						)}

						{visibleTabs.has("time-reports") && (
							<TabsTrigger value="time-reports" className="flex-none py-3 px-4">
								<FileSearch className="size-4" />
								Time Reports
							</TabsTrigger>
						)}

						{visibleTabs.has("pay-codes") && (
							<TabsTrigger value="pay-codes" className="flex-none py-3 px-4">
								<DollarSign className="size-4" />
								Pay Codes
							</TabsTrigger>
						)}

						{visibleTabs.has("holidays") && (
							<TabsTrigger value="holidays" className="flex-none py-3 px-4">
								<Calendar className="size-4" />
								Holidays
							</TabsTrigger>
						)}
					</TabsList>
				</ScrollableLineTabsRow>

				{visibleTabs.has("timekeeping") && (
					<TabsContent value="timekeeping">
						<TimekeepingTabContent />
					</TabsContent>
				)}

				{visibleTabs.has("time-approval") && (
					<TabsContent value="time-approval">
						<TimeApprovalTabContent />
					</TabsContent>
				)}

				{visibleTabs.has("dispute-log") && (
					<TabsContent value="dispute-log">
						<DisputeLogTabContent />
					</TabsContent>
				)}

				{visibleTabs.has("missing-time") && (
					<TabsContent value="missing-time">
						<MissingTimeEntriesTabContent
							statCards={missingStatCards}
							state={missingState}
							handlers={missingHandlers}
							deadlineDays={effectiveDeadlineDays}
							reminderIntervalDays={effectiveReminderDays}
							canManageMissingTime={canManageMissingTime}
							configurePolicy={{
								submissionDeadlineDays:
									policy?.submissionDeadlineDays ?? effectiveDeadlineDays,
								reminderIntervalDays:
									policy?.reminderIntervalDays ?? effectiveReminderDays,
								autoCreateMissingCases: policy?.autoCreateMissingCases ?? true,
							}}
							onSaveConfigurePolicy={
								canManageMissingTime
									? (payload) => {
											updatePolicy.mutate(payload, {
												onSuccess: () => {
													toast.success("Submission policy saved.");
													ctx.setIsConfigureOpen(false);
												},
												onError: (err) =>
													toast.error(
														err instanceof Error
															? err.message
															: "Failed to save policy",
													),
											});
										}
									: undefined
							}
							isSavingPolicy={updatePolicy.isPending}
							onConfirmReminder={ctx.confirmReminder}
							onConfirmBulkReminder={ctx.confirmBulkReminder}
							pagination={{
								page: ctx.missingTimePage,
								totalPages: ctx.missingTimeTotalPages,
								onPageChange: ctx.setMissingTimePage,
							}}
							bulkAllCount={missingTimeStats?.total ?? 0}
						/>
					</TabsContent>
				)}

				{visibleTabs.has("time-reports") && (
					<TabsContent value="time-reports">
						<TimeReportsTabContent
							state={{
								groupBy: ctx.groupBy,
								groupedData: ctx.groupedReportData,
							}}
							handlers={{
								setGroupBy: ctx.setGroupBy,
								handleExport: ctx.handleExportTimeReports,
							}}
							pagination={{
								page: ctx.reportPage,
								totalPages: ctx.reportTotalPages,
								onPageChange: ctx.setReportPage,
							}}
						/>
					</TabsContent>
				)}

				{visibleTabs.has("pay-codes") && (
					<TabsContent value="pay-codes">
						<PayCodesTabContent
							metricCards={payCodeMetricCards}
							rows={payCodeRows}
							page={payCodePage}
							totalPages={payCodesPage?.totalPages ?? 1}
							onPageChange={setPayCodePage}
						/>
					</TabsContent>
				)}

				{visibleTabs.has("holidays") && (
					<TabsContent value="holidays">
						<HolidaysTabContent
							year={currentYear}
							metricCards={holidayMetricCards}
							holidays={holidayRows}
							page={holidayPage}
							totalPages={holidaysPage?.totalPages ?? 1}
							onPageChange={setHolidayPage}
						/>
					</TabsContent>
				)}
			</Tabs>

			<InternalUploadDialog
				isOpen={uploadOpen}
				onClose={() => setUploadOpen(false)}
				orgId={orgId}
			/>
		</div>
	);
}

export default function TimekeepingPageContent() {
	return (
		<TimekeepingProvider>
			<TimekeepingPageInner />
		</TimekeepingProvider>
	);
}
