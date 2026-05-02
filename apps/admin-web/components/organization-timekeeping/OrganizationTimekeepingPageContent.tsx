"use client";

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
import {
	AlertTriangle,
	Calendar,
	DollarSign,
	FileSearch,
	Timer,
} from "lucide-react";
import { useOrganizationTimekeepingPage } from "@/hooks/organization-timekeeping/use-organization-timekeeping-page";
import { DisputeLogTabContent } from "./DisputeLogTabContent";
import { TimekeepingTabContent } from "./TimekeepingTabContent";

interface PageContentProps {
	organizationId: string;
}

export default function OrganizationTimekeepingPageContent({
	organizationId,
}: PageContentProps) {
	const page = useOrganizationTimekeepingPage(organizationId);

	return (
		<div className="min-w-0 space-y-6">
			<ConfigPageHeader
				title="Timekeeping"
				total={page.timekeepingTab.timekeepingStats.totalEntries}
				itemLabel="entry"
				itemLabelPlural="entries"
				description="Track, review, and approve worker time entries across all organization locations"
			/>

			<Tabs
				value={page.activeTab}
				onValueChange={page.setActiveTab}
				className="w-full flex-col space-y-6"
			>
				<ScrollableLineTabsRow>
					<TabsList
						variant="line"
						className="inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-0 rounded-none border-0 bg-transparent p-0"
					>
						<TabsTrigger value="timekeeping" className="flex-none py-3 px-4">
							<Timer className="size-4" />
							Timekeeping
						</TabsTrigger>

						<TabsTrigger value="dispute-log" className="flex-none py-3 px-4">
							<AlertTriangle className="size-4" />
							Dispute Log
						</TabsTrigger>

						<TabsTrigger value="missing-time" className="flex-none py-3 px-4">
							<FileSearch className="size-4" />
							Missing Time Entries
						</TabsTrigger>

						<TabsTrigger value="time-reports" className="flex-none py-3 px-4">
							<FileSearch className="size-4" />
							Time Reports
						</TabsTrigger>

						<TabsTrigger value="pay-codes" className="flex-none py-3 px-4">
							<DollarSign className="size-4" />
							Pay Codes
						</TabsTrigger>

						<TabsTrigger value="holidays" className="flex-none py-3 px-4">
							<Calendar className="size-4" />
							Holidays
						</TabsTrigger>
					</TabsList>
				</ScrollableLineTabsRow>

				<TabsContent value="timekeeping">
					<TimekeepingTabContent {...page.timekeepingTab} />
				</TabsContent>

				<TabsContent value="dispute-log">
					<DisputeLogTabContent {...page.disputeLogTab} />
				</TabsContent>

				<TabsContent value="missing-time">
					<MissingTimeEntriesTabContent
						statCards={page.missingStatCards}
						state={page.missingState}
						handlers={page.missingHandlers}
						deadlineDays={page.effectiveDeadlineDays}
						reminderIntervalDays={page.effectiveReminderDays}
						configurePolicy={page.missingTimeConfigurePolicy}
						onSaveConfigurePolicy={page.onSaveConfigurePolicy}
						isSavingPolicy={page.isSavingPolicy}
						onConfirmReminder={page.missingTimeTab.confirmReminder}
						onConfirmBulkReminder={page.missingTimeTab.confirmBulkReminder}
						pagination={{
							page: page.missingTimeTab.missingTimePage,
							totalPages: page.missingTimeTab.missingTimeTotalPages,
							onPageChange: page.missingTimeTab.setMissingTimePage,
						}}
						bulkAllCount={page.missingBulkAllCount}
					/>
				</TabsContent>

				<TabsContent value="time-reports">
					<TimeReportsTabContent
						state={{
							groupBy: page.timeReportsTab.groupBy,
							groupedData: page.timeReportsTab.groupedReportData,
						}}
						handlers={{
							setGroupBy: page.timeReportsTab.setGroupBy,
							handleExport: page.timeReportsTab.handleExportTimeReports,
						}}
						pagination={{
							page: page.timeReportsTab.reportPage,
							totalPages: page.timeReportsTab.reportTotalPages,
							onPageChange: page.timeReportsTab.setReportPage,
						}}
					/>
				</TabsContent>

				<TabsContent value="pay-codes">
					<PayCodesTabContent
						metricCards={page.payCodeMetricCards}
						rows={page.payCodeRows}
						page={page.payCodePage}
						totalPages={page.payCodesTotalPages}
						onPageChange={page.setPayCodePage}
					/>
				</TabsContent>

				<TabsContent value="holidays">
					<HolidaysTabContent
						year={page.currentYear}
						metricCards={page.holidayMetricCards}
						holidays={page.holidayRows}
						page={page.holidayPage}
						totalPages={page.holidaysTotalPages}
						onPageChange={page.setHolidayPage}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}
