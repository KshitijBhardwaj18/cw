"use client";

import { exportAsCSV } from "@repo/shared";
import type { MissingTimeEntry } from "@repo/ui/general/timekeeping/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	useBulkSendReminders,
	useMissingTime,
	useSendReminder,
	useTimekeepingPolicy,
} from "@/queries/organization-timekeeping.queries";
import type { MissingTimeCase } from "@/services/organization-timekeeping.types";
import { fmtDate } from "@/utils/format";
import type { TimekeepingUrlState } from "./use-timekeeping-url-state";
import { MISSING_TIME_LIST_PAGE_SIZE, WORKER_TYPE_LABEL } from "./utils";

export function useMissingTimeTab(
	organizationId: string,
	urlState: TimekeepingUrlState,
) {
	const orgId = organizationId;
	const {
		localSearch,
		searchFromUrl,
		handleSearchChange,
		isFiltersExpanded,
		setIsFiltersExpanded,
	} = urlState;

	const [missingTimePage, setMissingTimePage] = useState(1);

	// biome-ignore lint/correctness/useExhaustiveDependencies: reset list pages when debounced search changes
	useEffect(() => {
		setMissingTimePage(1);
	}, [searchFromUrl]);

	const { data: policy } = useTimekeepingPolicy(orgId);
	const deadline = policy?.submissionDeadlineDays ?? 3;

	const missingTimeQuery = useMissingTime(orgId, {
		search: searchFromUrl || undefined,
		page: missingTimePage,
		limit: MISSING_TIME_LIST_PAGE_SIZE,
	});

	const { mutate: mutateSendReminder } = useSendReminder(orgId);
	const { mutate: mutateBulkSendReminders } = useBulkSendReminders(orgId);

	const [isConfigureOpen, setIsConfigureOpen] = useState(false);
	const [isReminderOpen, setIsReminderOpen] = useState(false);
	const [isViewOpen, setIsViewOpen] = useState(false);
	const [isBulkOpen, setIsBulkOpen] = useState(false);
	const [bulkTarget, setBulkTarget] = useState<"all" | "overdue">("all");
	const [selectedWorker, setSelectedWorker] = useState<MissingTimeEntry | null>(
		null,
	);

	const toMissingTimeEntry = useCallback(
		(item: MissingTimeCase): MissingTimeEntry => {
			return {
				id: item.id,
				status: item.daysOverdue > deadline ? "Overdue" : "Pending",
				workerName: item.candidate?.user?.name ?? "Unknown",
				workerType:
					WORKER_TYPE_LABEL[item.candidate?.workforceType ?? ""] ?? "Contract",
				location: item.location?.name ?? "—",
				department: item.department?.name ?? "—",
				position: item.placement?.jobTitle ?? "",
				missingDates: [fmtDate(item.workDate)],
				lastSubmitted: item.lastRemindedAt
					? fmtDate(item.lastRemindedAt)
					: "Never",
				daysOverdue: item.daysOverdue,
			};
		},
		[deadline],
	);

	const groupMissingTimeEntries = useCallback(
		(cases: MissingTimeCase[]): MissingTimeEntry[] => {
			const grouped = new Map<
				string,
				{
					entry: MissingTimeEntry;
					lastRemindedAt: number | null;
				}
			>();

			for (const item of cases) {
				if (item.status === "RESOLVED" || item.status === "WAIVED") continue;

				const candidateId = item.candidate?.id;
				const placementId = item.placement?.id || "none";
				if (!candidateId) continue;

				const key = `${candidateId}-${placementId}`;
				const remindedAt = item.lastRemindedAt
					? new Date(item.lastRemindedAt).getTime()
					: null;
				const existing = grouped.get(key);

				if (!existing) {
					grouped.set(key, {
						entry: toMissingTimeEntry(item),
						lastRemindedAt: remindedAt,
					});
					continue;
				}

				existing.entry.missingDates.push(fmtDate(item.workDate));

				if (
					remindedAt !== null &&
					(existing.lastRemindedAt === null ||
						remindedAt > existing.lastRemindedAt)
				) {
					existing.lastRemindedAt = remindedAt;
					existing.entry.lastSubmitted = fmtDate(item.lastRemindedAt);
				}

				if (item.daysOverdue > existing.entry.daysOverdue) {
					existing.entry.daysOverdue = item.daysOverdue;
					existing.entry.status =
						existing.entry.daysOverdue > deadline ? "Overdue" : "Pending";
				}
			}

			return Array.from(grouped.values()).map(({ entry }) => entry);
		},
		[toMissingTimeEntry, deadline],
	);

	const missingTimeEntries = useMemo<MissingTimeEntry[]>(
		() => groupMissingTimeEntries(missingTimeQuery.data?.data ?? []),
		[missingTimeQuery.data, groupMissingTimeEntries],
	);

	const overdueCount = useMemo(() => {
		const allCases = missingTimeQuery.data?.data ?? [];
		return allCases.filter((c) => c.daysOverdue > deadline).length;
	}, [missingTimeQuery.data, deadline]);

	const missingTimeTotalPages = missingTimeQuery.data?.totalPages ?? 1;

	const handleViewWorker = useCallback((worker: MissingTimeEntry) => {
		setSelectedWorker(worker);
		setIsViewOpen(true);
	}, []);

	const handleSendReminder = useCallback((worker: MissingTimeEntry) => {
		setSelectedWorker(worker);
		setIsReminderOpen(true);
	}, []);

	const handleBulkAction = useCallback((target: "all" | "overdue") => {
		setBulkTarget(target);
		setIsBulkOpen(true);
	}, []);

	const confirmReminder = useCallback(
		(msg?: string) => {
			if (!selectedWorker) return;
			mutateSendReminder(
				{ caseId: selectedWorker.id, message: msg },
				{
					onSuccess: () => {
						setIsReminderOpen(false);
						toast.success(`Reminder sent to ${selectedWorker.workerName}.`);
					},
					onError: (err) =>
						toast.error(
							err instanceof Error ? err.message : "Failed to send reminder",
						),
				},
			);
		},
		[selectedWorker, mutateSendReminder],
	);

	const confirmBulkReminder = useCallback(
		(msg?: string) => {
			mutateBulkSendReminders(
				{ target: bulkTarget, message: msg },
				{
					onSuccess: (data) => {
						setIsBulkOpen(false);
						toast.success(`Reminders sent to ${data.count} workers.`);
					},
					onError: (err) =>
						toast.error(
							err instanceof Error ? err.message : "Failed to send reminders",
						),
				},
			);
		},
		[bulkTarget, mutateBulkSendReminders],
	);

	const handleExportReport = useCallback(() => {
		const data = missingTimeEntries.map((e) => ({
			"Worker Name": e.workerName,
			"Worker Type": e.workerType,
			Location: e.location,
			Department: e.department,
			Position: e.position,
			"Missing Dates": e.missingDates.join(", "),
			"Days Overdue": e.daysOverdue,
			Status: e.status,
		}));
		exportAsCSV(
			data,
			`missing_time_report_${new Date().toISOString().split("T")[0]}`,
		);
	}, [missingTimeEntries]);

	return {
		searchQuery: localSearch,
		setSearchQuery: handleSearchChange,
		isFiltersExpanded,
		setIsFiltersExpanded,
		missingTimeEntries,
		overdueCount,
		isConfigureOpen,
		setIsConfigureOpen,
		isReminderOpen,
		setIsReminderOpen,
		isViewOpen,
		setIsViewOpen,
		isBulkOpen,
		setIsBulkOpen,
		bulkTarget,
		selectedWorker,
		handleViewWorker,
		handleSendReminder,
		handleBulkAction,
		confirmReminder,
		confirmBulkReminder,
		handleExportReport,
		missingTimePage,
		setMissingTimePage,
		missingTimeTotalPages,
	};
}

export type MissingTimeTabState = ReturnType<typeof useMissingTimeTab>;
