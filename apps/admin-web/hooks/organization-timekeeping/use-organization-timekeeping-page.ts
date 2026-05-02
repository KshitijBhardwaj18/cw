"use client";

import type { ConfigureMissingTimePolicyPayload } from "@repo/ui/general/timekeeping/dialogs/ConfigureMissingTimeDialog";
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
	Landmark,
	Users,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	usePayCodeStats,
	usePayCodes,
} from "@/queries/organization-billing.queries";
import {
	useHolidayStats,
	useHolidays,
	useMissingTimeStats,
	useTimekeepingPolicy,
	useUpdateTimekeepingPolicy,
} from "@/queries/organization-timekeeping.queries";
import { useDisputeLogTab } from "./use-dispute-log-tab";
import { useMissingTimeTab } from "./use-missing-time-tab";
import { useTimeReportsTab } from "./use-time-reports-tab";
import { useTimekeepingMainTab } from "./use-timekeeping-main-tab";
import { useTimekeepingSharedDisputes } from "./use-timekeeping-shared-disputes";
import { useTimekeepingUrlState } from "./use-timekeeping-url-state";

const PAY_CODES_PAGE_SIZE = 20;
const HOLIDAYS_PAGE_SIZE = 20;

export function useOrganizationTimekeepingPage(organizationId: string) {
	const [activeTab, setActiveTab] = useState("timekeeping");

	const urlState = useTimekeepingUrlState();
	const sharedDisputes = useTimekeepingSharedDisputes(organizationId);
	const timekeepingTab = useTimekeepingMainTab(
		organizationId,
		urlState,
		sharedDisputes,
	);
	const disputeLogTab = useDisputeLogTab(
		organizationId,
		urlState,
		sharedDisputes,
	);
	const missingTimeTab = useMissingTimeTab(organizationId, urlState);
	const timeReportsTab = useTimeReportsTab(organizationId, urlState);

	const { data: missingTimeStats } = useMissingTimeStats(organizationId);
	const { data: policy } = useTimekeepingPolicy(organizationId);
	const updatePolicy = useUpdateTimekeepingPolicy(organizationId);

	const { data: payCodeStats } = usePayCodeStats(organizationId);
	const [payCodePage, setPayCodePage] = useState(1);
	const { data: payCodesPage } = usePayCodes(organizationId, {
		page: payCodePage,
		limit: PAY_CODES_PAGE_SIZE,
	});

	const currentYear = new Date().getFullYear();
	const [holidayPage, setHolidayPage] = useState(1);
	const { data: holidayStats } = useHolidayStats(organizationId, currentYear);
	const { data: holidaysPage } = useHolidays(organizationId, {
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
		searchQuery: missingTimeTab.searchQuery,
		filteredEntries: missingTimeTab.missingTimeEntries,
		overdueCount: missingTimeTab.overdueCount,
		isFiltersExpanded: missingTimeTab.isFiltersExpanded,
		isConfigureOpen: missingTimeTab.isConfigureOpen,
		isReminderOpen: missingTimeTab.isReminderOpen,
		isViewOpen: missingTimeTab.isViewOpen,
		isBulkOpen: missingTimeTab.isBulkOpen,
		bulkTarget: missingTimeTab.bulkTarget,
		selectedWorker: missingTimeTab.selectedWorker,
	};

	const missingHandlers: MissingTimeHandlers = {
		setSearchQuery: missingTimeTab.setSearchQuery,
		setIsFiltersExpanded: missingTimeTab.setIsFiltersExpanded,
		setIsConfigureOpen: missingTimeTab.setIsConfigureOpen,
		setIsReminderOpen: missingTimeTab.setIsReminderOpen,
		setIsViewOpen: missingTimeTab.setIsViewOpen,
		setIsBulkOpen: missingTimeTab.setIsBulkOpen,
		handleViewWorker: missingTimeTab.handleViewWorker,
		handleSendReminder: missingTimeTab.handleSendReminder,
		handleBulkAction: missingTimeTab.handleBulkAction,
		handleExportReport: missingTimeTab.handleExportReport,
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

	const missingTimeConfigurePolicy = useMemo(
		() => ({
			submissionDeadlineDays:
				policy?.submissionDeadlineDays ?? effectiveDeadlineDays,
			reminderIntervalDays:
				policy?.reminderIntervalDays ?? effectiveReminderDays,
			autoCreateMissingCases: policy?.autoCreateMissingCases ?? true,
		}),
		[policy, effectiveDeadlineDays, effectiveReminderDays],
	);

	const onSaveConfigurePolicy = useCallback(
		(payload: ConfigureMissingTimePolicyPayload) => {
			updatePolicy.mutate(payload, {
				onSuccess: () => {
					toast.success("Submission policy saved.");
					missingTimeTab.setIsConfigureOpen(false);
				},
				onError: (err) =>
					toast.error(
						err instanceof Error ? err.message : "Failed to save policy",
					),
			});
		},
		[updatePolicy, missingTimeTab.setIsConfigureOpen],
	);

	return {
		activeTab,
		setActiveTab,
		timekeepingTab,
		disputeLogTab,
		missingTimeTab,
		timeReportsTab,
		missingStatCards,
		missingState,
		missingHandlers,
		effectiveDeadlineDays,
		effectiveReminderDays,
		missingTimeConfigurePolicy,
		onSaveConfigurePolicy,
		isSavingPolicy: updatePolicy.isPending,
		missingBulkAllCount: missingTimeStats?.total ?? 0,
		payCodeMetricCards,
		payCodeRows,
		payCodePage,
		setPayCodePage,
		payCodesTotalPages: payCodesPage?.totalPages ?? 1,
		holidayMetricCards,
		holidayRows,
		holidayPage,
		setHolidayPage,
		holidaysTotalPages: holidaysPage?.totalPages ?? 1,
		currentYear,
	};
}

export type OrganizationTimekeepingPageState = ReturnType<
	typeof useOrganizationTimekeepingPage
>;
