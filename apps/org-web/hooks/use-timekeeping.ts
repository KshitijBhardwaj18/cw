"use client";

import { exportAsCSV, formatDateRange } from "@repo/shared";
import type {
	ApprovalStatusFilter,
	DataSourceFilter,
	DisputeLogEntry,
	DisputeStatus,
	LocationTimekeeping,
	MissingTimeEntry,
	TimeApprovalEntry,
	TimeLog,
	TimeReportGroupByOption,
	WorkerTimekeeping,
} from "@repo/ui/general/timekeeping/types";
import {
	flattenReportEntries,
	groupReportEntries,
} from "@repo/ui/general/timekeeping/utils";
import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { useUrlQueryState } from "@repo/ui/hooks/use-url-query-state";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	DATA_SOURCE_OPTIONS,
	TIMEKEEPING_POLICY_DEFAULTS,
} from "@/constants/timekeeping";
import { useOrgContext } from "@/contexts/org-context";
import {
	useBulkSendReminders,
	useCreateDispute,
	useDisputeStatusCounts,
	useDisputes,
	useEntries,
	useEntriesGrouped,
	useEntryStatusCounts,
	useMissingTime,
	useMissingTimeStats,
	useRejectDispute,
	useResolveDispute,
	useSendReminder,
	useTimekeepingPolicy,
	useTimekeepingStats,
	useUpdateEntryStatus,
} from "@/queries/timekeeping.queries";
import type {
	DisputeItem,
	LocationGrouped,
	MissingTimeCase,
	TimeEntryLog,
} from "@/services/timekeeping.service";
import { TimekeepingService } from "@/services/timekeeping.service";
import { fmtDate } from "@/utils/format";

function workDateToIso(workDate: string | null | undefined): string {
	if (!workDate) return "";
	try {
		const d = new Date(workDate);
		if (Number.isNaN(d.getTime())) return "";
		return d.toISOString().slice(0, 10);
	} catch {
		return "";
	}
}

function getDaysSince(iso: string | null | undefined): number {
	if (!iso) return 0;
	const diff = Date.now() - new Date(iso).getTime();
	return Math.floor(diff / 86_400_000);
}

function deriveWorkerStatus(
	logs: TimeEntryLog[],
): "PENDING" | "APPROVED" | "DISPUTED" {
	if (logs.some((l) => l.status === "DISPUTED")) return "DISPUTED";
	if (logs.some((l) => l.status === "PENDING")) return "PENDING";
	return "APPROVED";
}

function deriveWorkerSource(
	logs: TimeEntryLog[],
): "FILE_UPLOAD" | "MOBILE_APP" {
	return logs.some((l) => l.dataSource === "MOBILE_APP")
		? "MOBILE_APP"
		: "FILE_UPLOAD";
}

function toTimeLog(entry: TimeEntryLog): TimeLog {
	const openDisputeDescription =
		entry.status === "DISPUTED"
			? (entry.disputes?.[0]?.description ?? null)
			: null;
	const noteForDisplay =
		entry.status === "DISPUTED"
			? (openDisputeDescription ?? entry.notes ?? null)
			: (entry.notes ?? null);

	const day = workDateToIso(entry.workDate);

	return {
		id: entry.id,
		startDate: day,
		endDate: day,
		payCode: (entry.payCode?.code ?? "REG") as TimeLog["payCode"],
		startTime: entry.clockIn ?? "—",
		endTime: entry.clockOut ?? "—",
		totalHours: entry.hours ?? entry.regularHours + entry.overtimeHours,
		note: noteForDisplay,
		status: entry.status as "PENDING" | "APPROVED" | "DISPUTED",
		approvalSource: (entry.approvalSource as "Auto" | "Manual") ?? undefined,
		source: entry.dataSource === "MOBILE_APP" ? "MOBILE_APP" : "FILE_UPLOAD",
	};
}

type RawWorker = LocationGrouped["departments"][number]["workers"][number];

function toWorkerTimekeeping(worker: RawWorker): WorkerTimekeeping {
	const logs = worker.timeLogs.map(toTimeLog);
	return {
		id: worker.id,
		name: worker.name,
		position: worker.position,
		source: deriveWorkerSource(worker.timeLogs),
		status: deriveWorkerStatus(worker.timeLogs),
		regularHours: worker.regularHours,
		overtimeHours: worker.overtimeHours,
		totalHours: worker.totalHours,
		timeLogs: logs,
	};
}

function toLocationTimekeeping(loc: LocationGrouped): LocationTimekeeping {
	return {
		id: loc.id,
		name: loc.name,
		entryCount: loc.entryCount,
		totalHours: loc.totalHours,
		departments: loc.departments.map((dept) => ({
			id: dept.id,
			name: dept.name,
			workerCount: dept.workerCount,
			totalHours: dept.totalHours,
			workers: dept.workers.map(toWorkerTimekeeping),
		})),
	};
}

function toTimeApprovalEntry(entry: TimeEntryLog): TimeApprovalEntry {
	const pendingDays = getDaysSince(entry.workDate);
	const openDisputeDescription =
		entry.status === "DISPUTED"
			? (entry.disputes?.[0]?.description ?? null)
			: null;
	const noteForDisplay =
		entry.status === "DISPUTED"
			? (openDisputeDescription ?? entry.notes ?? null)
			: (entry.notes ?? null);

	const day = workDateToIso(entry.workDate);

	return {
		id: entry.id,
		workerName: entry.candidate.user.name ?? "Unknown",
		position: entry.placement?.jobTitle ?? "",
		startDate: day,
		endDate: day,
		regularHours: entry.regularHours,
		overtimeHours: entry.overtimeHours,
		totalHours: entry.hours ?? entry.regularHours + entry.overtimeHours,
		status: entry.status as "PENDING" | "APPROVED" | "DISPUTED",
		startTime: entry.clockIn ?? "—",
		endTime: entry.clockOut ?? "—",
		payCode: (entry.payCode?.code ?? "REG") as TimeApprovalEntry["payCode"],
		source: entry.dataSource === "MOBILE_APP" ? "MOBILE_APP" : "FILE_UPLOAD",
		note: noteForDisplay,
		pendingDays,
		isAutoApproved:
			pendingDays >= TIMEKEEPING_POLICY_DEFAULTS.autoApproveAfterDays &&
			entry.approvalSource === "Auto",
	};
}

function toDisputeLogEntry(item: DisputeItem): DisputeLogEntry {
	let status: DisputeStatus = "Open";
	if (item.resolutionCategory === "REJECTED") status = "Rejected";
	else if (item.resolution !== null) status = "Resolved";

	const workDateIso = item.timesheetEntry?.workDate
		? workDateToIso(item.timesheetEntry.workDate)
		: "";

	return {
		id: item.id,
		workerName: item.timesheet.candidate.user.name ?? "Unknown",
		position: item.timesheetEntry?.placement?.jobTitle ?? "",
		date: workDateIso || fmtDate(item.timesheetEntry?.workDate),
		startTime: item.timesheetEntry?.clockIn ?? "—",
		endTime: item.timesheetEntry?.clockOut ?? "—",
		payCode: item.timesheetEntry?.payCode?.code ?? "",
		hours: item.timesheetEntry?.hours ?? 0,
		source:
			item.timesheetEntry?.dataSource === "MOBILE_APP"
				? "MOBILE_APP"
				: "FILE_UPLOAD",
		disputeReason: item.description,
		supportingDocuments: item.supportingDocuments ?? [],
		resolution: item.resolution ?? undefined,
		submittedBy: {
			name: item.raisedBy?.name ?? "Unknown",
			role: item.raisedBy?.role ?? "",
			timestamp: fmtDate(item.raisedAt),
		},
		resolvedAt: item.resolvedAt ? fmtDate(item.resolvedAt) : undefined,
		status,
	};
}

const WORKER_TYPE_LABEL: Record<string, "Contract" | "Per Diem" | "Travel"> = {
	CONTRACT: "Contract",
	PER_DIEM: "Per Diem",
	TRAVEL: "Travel",
	EXTERNAL_VENDOR_LTO: "Contract",
	EXTERNAL_VENDOR_PER_DIEM: "Per Diem",
	INTERNAL_PRN: "Per Diem",
	INTERNAL_FULL_TIME: "Contract",
	INTERNAL_PART_TIME: "Contract",
	EXTERNAL_EOR: "Travel",
	EXTERNAL_1099: "Travel",
	SELF: "Contract",
	INTERNAL_FLOAT_POOL: "Contract",
	INTERNAL_VOLUNTEER: "Contract",
};

const APPROVAL_PAGE_SIZE = 6;
const GROUPED_PAGE_SIZE = 20;
const DISPUTE_LIST_PAGE_SIZE = 10;
const LIST_PAGE_SIZE = 20;
const REPORT_PAGE_SIZE = 20;

export function useTimekeeping() {
	const { id: orgId } = useOrgContext();
	const searchParams = useSearchParams();
	const { pushParams } = useUrlQueryState();
	const { localSearch, searchFromUrl, handleSearchChange } = useDebouncedSearch(
		{ paramKey: "otkSearch", pageParamKey: null },
	);

	const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
	const dataSourceFilter: DataSourceFilter = useMemo(() => {
		const d = searchParams.get("ds");
		if (d === "FILE_UPLOAD" || d === "MOBILE_APP") return d;
		return "ALL";
	}, [searchParams]);
	const groupedStatusFilter: ApprovalStatusFilter = useMemo(() => {
		const g = searchParams.get("gs");
		if (
			g === "ALL" ||
			g === "PENDING" ||
			g === "APPROVED" ||
			g === "DISPUTED" ||
			g === "REJECTED"
		) {
			return g;
		}
		return "PENDING";
	}, [searchParams]);
	const approvalStatusFilter: ApprovalStatusFilter = useMemo(() => {
		const a = searchParams.get("apst");
		if (
			a === "ALL" ||
			a === "PENDING" ||
			a === "APPROVED" ||
			a === "DISPUTED" ||
			a === "REJECTED"
		) {
			return a;
		}
		return "PENDING";
	}, [searchParams]);

	const setDataSourceFilter = useCallback(
		(v: DataSourceFilter) => {
			pushParams({ ds: v === "ALL" ? null : v });
		},
		[pushParams],
	);

	const setGroupedStatusFilter = useCallback(
		(v: ApprovalStatusFilter) => {
			if (v === "PENDING") {
				pushParams({ gs: null });
			} else {
				pushParams({ gs: v });
			}
		},
		[pushParams],
	);

	const setApprovalStatusFilter = useCallback(
		(v: ApprovalStatusFilter) => {
			if (v === "PENDING") {
				pushParams({ apst: null });
			} else {
				pushParams({ apst: v });
			}
		},
		[pushParams],
	);

	const [groupBy, setGroupBy] = useState<TimeReportGroupByOption>("department");

	const [isDisputeDialogOpen, setIsDisputeDialogOpen] = useState(false);
	const [selectedDisputeLog, setSelectedDisputeLog] = useState<TimeLog | null>(
		null,
	);
	const [selectedDisputeWorker, setSelectedDisputeWorker] =
		useState<WorkerTimekeeping | null>(null);

	const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
	const [selectedApproveLog, setSelectedApproveLog] = useState<TimeLog | null>(
		null,
	);
	const [selectedApproveWorker, setSelectedApproveWorker] =
		useState<WorkerTimekeeping | null>(null);

	const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
	const [selectedDetailLog, setSelectedDetailLog] =
		useState<DisputeLogEntry | null>(null);

	const [isRejectDisputeDialogOpen, setIsRejectDisputeDialogOpen] =
		useState(false);
	const [selectedRejectDispute, setSelectedRejectDispute] =
		useState<DisputeLogEntry | null>(null);

	const [currentPage, setCurrentPage] = useState(1);
	const [groupedPage, setGroupedPage] = useState(1);
	const [reportPage, setReportPage] = useState(1);
	const [disputePage, setDisputePage] = useState(1);
	const [missingTimePage, setMissingTimePage] = useState(1);

	const [isConfigureOpen, setIsConfigureOpen] = useState(false);
	const [isReminderOpen, setIsReminderOpen] = useState(false);
	const [isViewOpen, setIsViewOpen] = useState(false);
	const [isBulkOpen, setIsBulkOpen] = useState(false);
	const [bulkTarget, setBulkTarget] = useState<"all" | "overdue">("all");
	const [selectedWorker, setSelectedWorker] = useState<MissingTimeEntry | null>(
		null,
	);

	const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
	const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(
		null,
	);

	const entryCountFilters = useMemo(
		() => ({
			search: searchFromUrl || undefined,
			dataSource: dataSourceFilter === "ALL" ? undefined : dataSourceFilter,
		}),
		[searchFromUrl, dataSourceFilter],
	);

	const groupedQuery = useEntriesGrouped(orgId, {
		dataSource: dataSourceFilter === "ALL" ? undefined : dataSourceFilter,
		status: groupedStatusFilter === "ALL" ? undefined : groupedStatusFilter,
		search: searchFromUrl || undefined,
		page: groupedPage,
		limit: GROUPED_PAGE_SIZE,
	});

	const reportsQuery = useEntriesGrouped(orgId, {
		dataSource: dataSourceFilter === "ALL" ? undefined : dataSourceFilter,
		search: searchFromUrl || undefined,
		page: reportPage,
		limit: REPORT_PAGE_SIZE,
	});

	const approvalEntriesQuery = useEntries(orgId, {
		status: approvalStatusFilter === "ALL" ? undefined : approvalStatusFilter,
		search: searchFromUrl || undefined,
		page: currentPage,
		limit: APPROVAL_PAGE_SIZE,
	});

	const disputesQuery = useDisputes(orgId, {
		search: searchFromUrl || undefined,
		page: disputePage,
		limit: DISPUTE_LIST_PAGE_SIZE,
	});
	const missingTimeQuery = useMissingTime(orgId, {
		search: searchFromUrl || undefined,
		page: missingTimePage,
		limit: LIST_PAGE_SIZE,
	});

	const { data: policy } = useTimekeepingPolicy(orgId);
	const deadline = policy?.submissionDeadlineDays ?? 3;

	const toMissingTimeEntry = useCallback(
		(item: MissingTimeCase): MissingTimeEntry => {
			return {
				id: item.id,
				status: item.daysOverdue > deadline ? "Overdue" : "Pending",
				workerName: item.candidate.user.name ?? "Unknown",
				workerType:
					WORKER_TYPE_LABEL[item.candidate.workforceType ?? ""] ?? "Contract",
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

	const statsQuery = useTimekeepingStats(orgId);
	const entryCountsQuery = useEntryStatusCounts(orgId, entryCountFilters);
	const disputeCountsQuery = useDisputeStatusCounts(orgId);
	const missingTimeStatsQuery = useMissingTimeStats(orgId);

	useEffect(() => {
		setGroupedPage(1);
		void searchFromUrl;
		void dataSourceFilter;
		void groupedStatusFilter;
	}, [searchFromUrl, dataSourceFilter, groupedStatusFilter]);

	useEffect(() => {
		setReportPage(1);
		void searchFromUrl;
		void dataSourceFilter;
	}, [searchFromUrl, dataSourceFilter]);

	useEffect(() => {
		setCurrentPage(1);
		void searchFromUrl;
		void approvalStatusFilter;
	}, [searchFromUrl, approvalStatusFilter]);

	useEffect(() => {
		setDisputePage(1);
		void searchFromUrl;
	}, [searchFromUrl]);

	useEffect(() => {
		setMissingTimePage(1);
		void searchFromUrl;
	}, [searchFromUrl]);

	const { mutate: mutateUpdateStatus } = useUpdateEntryStatus(orgId);
	const { mutate: mutateCreateDispute } = useCreateDispute(orgId);
	const { mutate: mutateResolveDispute } = useResolveDispute(orgId);
	const { mutate: mutateRejectDispute } = useRejectDispute(orgId);
	const { mutate: mutateSendReminder } = useSendReminder(orgId);
	const { mutate: mutateBulkSendReminders } = useBulkSendReminders(orgId);

	const filteredLocations = useMemo<LocationTimekeeping[]>(
		() => (groupedQuery.data?.data ?? []).map(toLocationTimekeeping),
		[groupedQuery.data],
	);

	const groupedTotalPages = groupedQuery.data?.totalPages ?? 1;
	const disputeTotalPages = disputesQuery.data?.totalPages ?? 1;
	const missingTimeTotalPages = missingTimeQuery.data?.totalPages ?? 1;

	const locationStatusCounts = useMemo<
		Record<ApprovalStatusFilter, number>
	>(() => {
		const c = entryCountsQuery.data ?? {};
		const p = c.PENDING ?? 0;
		const a = c.APPROVED ?? 0;
		const d = c.DISPUTED ?? 0;
		return {
			ALL: p + a + d,
			PENDING: p,
			APPROVED: a,
			DISPUTED: d,
			REJECTED: c.REJECTED ?? 0,
		};
	}, [entryCountsQuery.data]);

	const approvalStatusCounts = locationStatusCounts;

	const disputeStatusCounts = useMemo(() => {
		const d = disputeCountsQuery.data ?? { open: 0, resolved: 0, rejected: 0 };
		return { open: d.open, resolved: d.resolved, rejected: d.rejected };
	}, [disputeCountsQuery.data]);

	const timekeepingStats = useMemo(() => {
		const s = statsQuery.data;
		return {
			totalEntries: s?.totalEntries ?? 0,
			fileUploads: s?.fileUploads ?? 0,
			mobileApps: s?.mobileApps ?? 0,
			totalHours: s?.totalHours ?? 0,
			openDisputes: s?.openDisputes ?? 0,
		};
	}, [statsQuery.data]);

	const filteredApprovalEntries = useMemo<TimeApprovalEntry[]>(
		() => (approvalEntriesQuery.data?.data ?? []).map(toTimeApprovalEntry),
		[approvalEntriesQuery.data],
	);

	const paginatedApprovalEntries = filteredApprovalEntries;
	const totalPages = approvalEntriesQuery.data?.totalPages ?? 1;

	const filteredDisputeLogs = useMemo<DisputeLogEntry[]>(
		() => (disputesQuery.data?.data ?? []).map(toDisputeLogEntry),
		[disputesQuery.data],
	);

	const missingTimeEntries = useMemo<MissingTimeEntry[]>(
		() => groupMissingTimeEntries(missingTimeQuery.data?.data ?? []),
		[missingTimeQuery.data, groupMissingTimeEntries],
	);

	const overdueCount = missingTimeStatsQuery.data?.overdue ?? 0;

	const reportLocations = useMemo<LocationTimekeeping[]>(
		() => (reportsQuery.data?.data ?? []).map(toLocationTimekeeping),
		[reportsQuery.data],
	);
	const reportTotalPages = reportsQuery.data?.totalPages ?? 1;

	const reportEntries = useMemo(
		() => flattenReportEntries(reportLocations),
		[reportLocations],
	);
	const groupedReportData = useMemo(
		() => groupReportEntries(reportEntries, groupBy),
		[reportEntries, groupBy],
	);

	const openDisputeDialog = useCallback(
		(log: TimeLog, worker: WorkerTimekeeping) => {
			setSelectedDisputeLog(log);
			setSelectedDisputeWorker(worker);
			setSelectedEntryId(log.id);
			setIsDisputeDialogOpen(true);
		},
		[],
	);

	const openApproveDialog = useCallback(
		(log: TimeLog, worker: WorkerTimekeeping) => {
			setSelectedApproveLog(log);
			setSelectedApproveWorker(worker);
			setSelectedEntryId(log.id);
			setIsApproveDialogOpen(true);
		},
		[],
	);

	const openDetailDialog = useCallback((entry: DisputeLogEntry) => {
		setSelectedDetailLog(entry);
		setSelectedDisputeId(entry.id);
		setIsDetailDialogOpen(true);
	}, []);

	const openDisputeSupportingDocument = useCallback(async (key: string) => {
		try {
			const { signedUrl } =
				await TimekeepingService.getDisputeSupportingDocumentSignedUrl(key);
			if (typeof window !== "undefined") {
				window.open(signedUrl, "_blank", "noopener,noreferrer");
			}
		} catch (err) {
			toast.error(
				err instanceof Error
					? err.message
					: "Failed to open dispute supporting document",
			);
		}
	}, []);

	const handleApprovalCardApprove = useCallback(
		(entry: TimeApprovalEntry) => {
			const log: TimeLog = {
				id: entry.id,
				startDate: entry.startDate,
				endDate: entry.endDate,
				payCode: entry.payCode,
				startTime: entry.startTime,
				endTime: entry.endTime,
				totalHours: entry.totalHours,
				note: entry.note ?? null,
				status: entry.status,
				source: entry.source,
			};
			const worker: WorkerTimekeeping = {
				id: entry.id,
				name: entry.workerName,
				position: entry.position,
				source: entry.source,
				status: entry.status,
				regularHours: entry.regularHours,
				overtimeHours: entry.overtimeHours,
				totalHours: entry.totalHours,
				timeLogs: [log],
			};
			openApproveDialog(log, worker);
		},
		[openApproveDialog],
	);

	const handleApprovalCardDispute = useCallback(
		(entry: TimeApprovalEntry) => {
			const log: TimeLog = {
				id: entry.id,
				startDate: entry.startDate,
				endDate: entry.endDate,
				payCode: entry.payCode,
				startTime: entry.startTime,
				endTime: entry.endTime,
				totalHours: entry.totalHours,
				note: entry.note ?? null,
				status: entry.status,
				source: entry.source,
			};
			const worker: WorkerTimekeeping = {
				id: entry.id,
				name: entry.workerName,
				position: entry.position,
				source: entry.source,
				status: entry.status,
				regularHours: entry.regularHours,
				overtimeHours: entry.overtimeHours,
				totalHours: entry.totalHours,
				timeLogs: [log],
			};
			openDisputeDialog(log, worker);
		},
		[openDisputeDialog],
	);

	const handleDisputeLogResolve = useCallback((entry: DisputeLogEntry) => {
		const day = workDateToIso(entry.date) || entry.date;
		const log: TimeLog = {
			id: entry.id,
			startDate: day,
			endDate: day,
			payCode: entry.payCode as TimeLog["payCode"],
			startTime: entry.startTime,
			endTime: entry.endTime,
			totalHours: entry.hours,
			note: null,
			status: "DISPUTED",
			source: entry.source,
		};
		const worker: WorkerTimekeeping = {
			id: entry.id,
			name: entry.workerName,
			position: entry.position,
			source: entry.source,
			status: "DISPUTED",
			regularHours: entry.hours,
			overtimeHours: 0,
			totalHours: entry.hours,
			timeLogs: [log],
		};
		setSelectedDisputeId(entry.id);
		setSelectedApproveLog(log);
		setSelectedApproveWorker(worker);
		setIsApproveDialogOpen(true);
	}, []);

	const openRejectDisputeDialog = useCallback((entry: DisputeLogEntry) => {
		setSelectedRejectDispute(entry);
		setIsRejectDisputeDialogOpen(true);
	}, []);

	const confirmRejectDispute = useCallback(
		(reason: string) => {
			if (!selectedRejectDispute) return;
			mutateRejectDispute(
				{ disputeId: selectedRejectDispute.id, reason },
				{
					onSuccess: () => {
						setIsRejectDisputeDialogOpen(false);
						setSelectedRejectDispute(null);
						toast.success("Dispute rejected.");
					},
					onError: (err) =>
						toast.error(
							err instanceof Error ? err.message : "Failed to reject dispute",
						),
				},
			);
		},
		[selectedRejectDispute, mutateRejectDispute],
	);

	const submitDispute = useCallback(
		(reason: string) => {
			if (!selectedEntryId) return;
			mutateCreateDispute(
				{ entryId: selectedEntryId, payload: { description: reason } },
				{
					onSuccess: () => {
						setIsDisputeDialogOpen(false);
						toast.success("Dispute submitted successfully.");
					},
					onError: (err) =>
						toast.error(
							err instanceof Error ? err.message : "Failed to submit dispute",
						),
				},
			);
		},
		[selectedEntryId, mutateCreateDispute],
	);

	const confirmApproval = useCallback(() => {
		if (!selectedEntryId) return;
		mutateUpdateStatus(
			{
				entryId: selectedEntryId,
				payload: { status: "APPROVED", approvalSource: "Manual" },
			},
			{
				onSuccess: () => {
					setIsApproveDialogOpen(false);
					toast.success("Time entry approved.");
				},
				onError: (err) =>
					toast.error(
						err instanceof Error ? err.message : "Failed to approve entry",
					),
			},
		);
	}, [selectedEntryId, mutateUpdateStatus]);

	const confirmDisputeResolution = useCallback(
		(note?: string) => {
			if (!selectedDisputeId) return;
			mutateResolveDispute(
				{ disputeId: selectedDisputeId, payload: { resolution: note } },
				{
					onSuccess: () => {
						setIsApproveDialogOpen(false);
						toast.success("Dispute resolved.");
					},
					onError: (err) =>
						toast.error(
							err instanceof Error ? err.message : "Failed to resolve dispute",
						),
				},
			);
		},
		[selectedDisputeId, mutateResolveDispute],
	);

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

	const handleExportTimeReports = useCallback(() => {
		const data = reportEntries.map((e) => ({
			Worker: e.workerName,
			Location: e.location,
			Department: e.department,
			Date: formatDateRange(e.startDate, e.endDate),
			"Pay Code": e.payCode,
			Hours: e.hours,
			Source: e.source === "MOBILE_APP" ? "Mobile App" : "File Upload",
			Notes: e.notes || "",
		}));
		exportAsCSV(data, `time_reports_${new Date().toISOString().split("T")[0]}`);
	}, [reportEntries]);

	const filterConfigs = useMemo(
		() => [
			{
				id: "timekeeping-filter-source",
				label: "Data Source",
				value: dataSourceFilter,
				onValueChange: (v: string) =>
					setDataSourceFilter(v as DataSourceFilter),
				placeholder: "All",
				options: DATA_SOURCE_OPTIONS.map((o) => ({
					value: o.value,
					label: o.label,
				})),
			},
		],
		[dataSourceFilter, setDataSourceFilter],
	);

	return {
		searchQuery: localSearch,
		setSearchQuery: handleSearchChange,
		isFiltersExpanded,
		setIsFiltersExpanded,
		dataSourceFilter,
		setDataSourceFilter,
		groupedStatusFilter,
		setGroupedStatusFilter,
		approvalStatusFilter,
		setApprovalStatusFilter,
		isDisputeDialogOpen,
		setIsDisputeDialogOpen,
		selectedDisputeLog,
		selectedDisputeWorker,
		isApproveDialogOpen,
		setIsApproveDialogOpen,
		selectedApproveLog,
		selectedApproveWorker,
		isDetailDialogOpen,
		setIsDetailDialogOpen,
		selectedDetailLog,
		currentPage,
		setCurrentPage,
		totalPages,
		paginatedApprovalEntries,
		filteredLocations,
		filteredApprovalEntries,
		filteredDisputeLogs,
		locationStatusCounts,
		approvalStatusCounts,
		disputeStatusCounts,
		timekeepingStats,
		groupBy,
		setGroupBy,
		groupedReportData,
		openDisputeDialog,
		openApproveDialog,
		openDetailDialog,
		openDisputeSupportingDocument,
		handleApprovalCardApprove,
		handleApprovalCardDispute,
		handleDisputeLogResolve,
		openRejectDisputeDialog,
		confirmRejectDispute,
		isRejectDisputeDialogOpen,
		setIsRejectDisputeDialogOpen,
		selectedRejectDispute,
		submitDispute,
		confirmApproval,
		confirmDisputeResolution,
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
		overdueCount,
		handleViewWorker,
		handleSendReminder,
		handleBulkAction,
		confirmReminder,
		confirmBulkReminder,
		handleExportReport,
		handleExportTimeReports,
		missingTimeEntries,
		isLoading: groupedQuery.isLoading || statsQuery.isLoading,
		groupedPage,
		setGroupedPage,
		groupedTotalPages,
		reportPage,
		setReportPage,
		reportTotalPages,
		disputePage,
		setDisputePage,
		disputeTotalPages,
		missingTimePage,
		setMissingTimePage,
		missingTimeTotalPages,
		filterConfigs,
	};
}
