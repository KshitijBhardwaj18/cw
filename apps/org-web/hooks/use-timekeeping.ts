"use client";

import {
	exportAsCSV,
	formatTzShortDate,
	formatUtcLongDate,
	type OrganizationTimezone,
	TimesheetEntryStatus,
	utcInstantToIsoDateString,
} from "@repo/shared";
import type {
	ApprovalStatusFilter,
	DataSourceFilter,
	DisputeLogEntry,
	DisputeStatus,
	LocationTimekeeping,
	MissingTimeEntry,
	TimeApprovalEntry,
	TimeEntryStatus,
	TimeLog,
	TimeReportGroupByOption,
	WorkerTimekeeping,
} from "@repo/ui/general/timekeeping/types";
import {
	flattenReportEntries,
	groupReportEntries,
} from "@repo/ui/general/timekeeping/utils";
import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useSearchWithFilters } from "@repo/ui/hooks/use-search-with-filters";
import { parseAsString, useQueryStates } from "nuqs";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	DATA_SOURCE_OPTIONS,
	TIMEKEEPING_POLICY_DEFAULTS,
} from "@/constants/timekeeping";
import { useUserTimezone } from "@/hooks/use-user-timezone";
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

function getDaysSince(iso: string | null | undefined): number {
	if (!iso) return 0;
	const diff = Date.now() - new Date(iso).getTime();
	return Math.floor(diff / 86_400_000);
}

function deriveWorkerStatus(logs: TimeEntryLog[]): TimesheetEntryStatus {
	if (logs.some((l) => l.status === TimesheetEntryStatus.DISPUTED))
		return TimesheetEntryStatus.DISPUTED;
	if (logs.some((l) => l.status === TimesheetEntryStatus.PENDING))
		return TimesheetEntryStatus.PENDING;
	return TimesheetEntryStatus.APPROVED;
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
		entry.status === TimesheetEntryStatus.DISPUTED
			? (entry.disputes?.[0]?.description ?? null)
			: null;
	const noteForDisplay =
		entry.status === TimesheetEntryStatus.DISPUTED
			? (openDisputeDescription ?? entry.notes ?? null)
			: (entry.notes ?? null);

	const day = utcInstantToIsoDateString(entry.workDate);

	return {
		id: entry.id,
		startDate: day,
		endDate: day,
		payCode: (entry.payCode?.code ?? "REG") as TimeLog["payCode"],
		startTime: entry.clockIn ?? "—",
		endTime: entry.clockOut ?? "—",
		totalHours: entry.hours ?? entry.regularHours + entry.overtimeHours,
		note: noteForDisplay,
		status: entry.status as TimeEntryStatus,
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
		entry.status === TimesheetEntryStatus.DISPUTED
			? (entry.disputes?.[0]?.description ?? null)
			: null;
	const noteForDisplay =
		entry.status === TimesheetEntryStatus.DISPUTED
			? (openDisputeDescription ?? entry.notes ?? null)
			: (entry.notes ?? null);

	const day = utcInstantToIsoDateString(entry.workDate);

	return {
		id: entry.id,
		workerName: entry.candidate.user.name ?? "Unknown",
		position: entry.placement?.jobTitle ?? "",
		startDate: day,
		endDate: day,
		regularHours: entry.regularHours,
		overtimeHours: entry.overtimeHours,
		totalHours: entry.hours ?? entry.regularHours + entry.overtimeHours,
		status: entry.status as TimeEntryStatus,
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

function toDisputeLogEntry(
	item: DisputeItem,
	tz?: OrganizationTimezone,
): DisputeLogEntry {
	let status: DisputeStatus = "Open";
	if (item.resolutionCategory === "REJECTED") status = "Rejected";
	else if (item.resolution !== null) status = "Resolved";

	const workDateIso = item.timesheetEntry?.workDate
		? utcInstantToIsoDateString(item.timesheetEntry.workDate)
		: "";

	const fmtTs = (iso: string | null | undefined) =>
		tz ? formatTzShortDate(iso, tz) : formatUtcLongDate(iso);

	return {
		id: item.id,
		workerName: item.timesheet.candidate.user.name ?? "Unknown",
		position: item.timesheetEntry?.placement?.jobTitle ?? "",
		date: workDateIso || formatUtcLongDate(item.timesheetEntry?.workDate),
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
			timestamp: fmtTs(item.raisedAt),
		},
		resolvedAt: item.resolvedAt ? fmtTs(item.resolvedAt) : undefined,
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

const APPROVAL_DEFAULT_LIMIT = 6;
const APPROVAL_PAGE_SIZE_OPTIONS = [6, 12, 18, 24];
const GROUPED_DEFAULT_LIMIT = 10;
const DISPUTE_DEFAULT_LIMIT = 10;
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
const LIST_PAGE_SIZE = 20;
const REPORT_PAGE_SIZE = 20;

export const TK_PARAMS = {
	SEARCH: "otkSearch",
	DATA_SOURCE: "ds",
	GROUPED_STATUS: "gs",
	APPROVAL_STATUS: "apst",
	GROUP_BY: "groupBy",
	GROUPED_PAGE: "gp",
	GROUPED_LIMIT: "gpL",
	REPORT_PAGE: "rp",
	DISPUTE_PAGE: "dp",
	DISPUTE_LIMIT: "dpL",
	MISSING_PAGE: "mp",
	APPROVAL_PAGE: "ap",
	APPROVAL_LIMIT: "apL",
} as const;

export function useTimekeeping() {
	const { tz, fmtShortDate: fmtTsDate, fmtDateRange } = useUserTimezone();
	const {
		searchValue: localSearch,
		searchFromUrl,
		handleSearchChange,
		values: searchWithFiltersValues,
		onFilterChange,
	} = useSearchWithFilters({
		search: { paramKey: TK_PARAMS.SEARCH },
		filters: [
			{
				id: TK_PARAMS.DATA_SOURCE,
				label: "Data Source",
				defaultValue: "ALL",
				type: "select",
				options: DATA_SOURCE_OPTIONS,
			},
		],
	});

	const [params, setParams] = useQueryStates({
		[TK_PARAMS.GROUPED_STATUS]: parseAsString.withDefault(
			TimesheetEntryStatus.PENDING,
		),
		[TK_PARAMS.APPROVAL_STATUS]: parseAsString.withDefault(
			TimesheetEntryStatus.PENDING,
		),
		[TK_PARAMS.GROUP_BY]: parseAsString.withDefault("department"),
	});

	const {
		page: groupedPage,
		limit: groupedLimit,
		setPage: setGroupedPage,
		setLimit: setGroupedLimit,
	} = usePaginationControls({
		pageParamKey: TK_PARAMS.GROUPED_PAGE,
		limitParamKey: TK_PARAMS.GROUPED_LIMIT,
		defaultLimit: GROUPED_DEFAULT_LIMIT,
		pageSizeOptions: PAGE_SIZE_OPTIONS,
	});
	const { page: reportPage, setPage: setReportPage } = usePaginationControls({
		pageParamKey: TK_PARAMS.REPORT_PAGE,
	});
	const {
		page: disputePage,
		limit: disputeLimit,
		setPage: setDisputePage,
		setLimit: setDisputeLimit,
	} = usePaginationControls({
		pageParamKey: TK_PARAMS.DISPUTE_PAGE,
		limitParamKey: TK_PARAMS.DISPUTE_LIMIT,
		defaultLimit: DISPUTE_DEFAULT_LIMIT,
		pageSizeOptions: PAGE_SIZE_OPTIONS,
	});
	const { page: missingTimePage, setPage: setMissingTimePage } =
		usePaginationControls({
			pageParamKey: TK_PARAMS.MISSING_PAGE,
		});
	const {
		page: currentPage,
		limit: approvalLimit,
		setPage: setCurrentPage,
		setLimit: setApprovalLimit,
	} = usePaginationControls({
		pageParamKey: TK_PARAMS.APPROVAL_PAGE,
		limitParamKey: TK_PARAMS.APPROVAL_LIMIT,
		defaultLimit: APPROVAL_DEFAULT_LIMIT,
		pageSizeOptions: APPROVAL_PAGE_SIZE_OPTIONS,
	});

	const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

	const dataSourceFilter = searchWithFiltersValues[
		TK_PARAMS.DATA_SOURCE
	] as DataSourceFilter;
	const groupedStatusFilter = params[
		TK_PARAMS.GROUPED_STATUS
	] as ApprovalStatusFilter;
	const approvalStatusFilter = params[
		TK_PARAMS.APPROVAL_STATUS
	] as ApprovalStatusFilter;
	const groupBy = params[TK_PARAMS.GROUP_BY] as TimeReportGroupByOption;

	const setDataSourceFilter = useCallback(
		(v: DataSourceFilter) => {
			onFilterChange({
				[TK_PARAMS.DATA_SOURCE]: v === "ALL" ? null : v,
				[TK_PARAMS.GROUPED_PAGE]: null,
				[TK_PARAMS.REPORT_PAGE]: null,
				[TK_PARAMS.DISPUTE_PAGE]: null,
				[TK_PARAMS.MISSING_PAGE]: null,
				[TK_PARAMS.APPROVAL_PAGE]: null,
			});
		},
		[onFilterChange],
	);

	const setGroupedStatusFilter = useCallback(
		(v: ApprovalStatusFilter) => {
			setParams({
				[TK_PARAMS.GROUPED_STATUS]:
					v === TimesheetEntryStatus.PENDING ? null : v,
			});
			setGroupedPage(null);
		},
		[setParams, setGroupedPage],
	);

	const setApprovalStatusFilter = useCallback(
		(v: ApprovalStatusFilter) => {
			setParams({
				[TK_PARAMS.APPROVAL_STATUS]:
					v === TimesheetEntryStatus.PENDING ? null : v,
			});
			setCurrentPage(null);
		},
		[setParams, setCurrentPage],
	);

	const setGroupBy = useCallback(
		(v: TimeReportGroupByOption) => {
			setParams({ [TK_PARAMS.GROUP_BY]: v });
		},
		[setParams],
	);

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

	const groupedQuery = useEntriesGrouped({
		dataSource: dataSourceFilter === "ALL" ? undefined : dataSourceFilter,
		status: groupedStatusFilter === "ALL" ? undefined : groupedStatusFilter,
		search: searchFromUrl || undefined,
		page: groupedPage,
		limit: groupedLimit,
	});

	const reportsQuery = useEntriesGrouped({
		dataSource: dataSourceFilter === "ALL" ? undefined : dataSourceFilter,
		search: searchFromUrl || undefined,
		page: reportPage,
		limit: REPORT_PAGE_SIZE,
	});

	const approvalEntriesQuery = useEntries({
		status: approvalStatusFilter === "ALL" ? undefined : approvalStatusFilter,
		search: searchFromUrl || undefined,
		page: currentPage,
		limit: approvalLimit,
	});

	const disputesQuery = useDisputes({
		search: searchFromUrl || undefined,
		page: disputePage,
		limit: disputeLimit,
	});
	const missingTimeQuery = useMissingTime({
		search: searchFromUrl || undefined,
		page: missingTimePage,
		limit: LIST_PAGE_SIZE,
	});

	const { data: policy } = useTimekeepingPolicy();
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
				missingDates: [formatUtcLongDate(item.workDate)],
				lastSubmitted: item.lastRemindedAt
					? fmtTsDate(item.lastRemindedAt)
					: "Never",
				daysOverdue: item.daysOverdue,
			};
		},
		[deadline, fmtTsDate],
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

				existing.entry.missingDates.push(formatUtcLongDate(item.workDate));

				if (
					remindedAt !== null &&
					(existing.lastRemindedAt === null ||
						remindedAt > existing.lastRemindedAt)
				) {
					existing.lastRemindedAt = remindedAt;
					existing.entry.lastSubmitted = fmtTsDate(item.lastRemindedAt);
				}

				if (item.daysOverdue > existing.entry.daysOverdue) {
					existing.entry.daysOverdue = item.daysOverdue;
					existing.entry.status =
						existing.entry.daysOverdue > deadline ? "Overdue" : "Pending";
				}
			}

			return Array.from(grouped.values()).map(({ entry }) => entry);
		},
		[toMissingTimeEntry, deadline, fmtTsDate],
	);

	const statsQuery = useTimekeepingStats();
	const entryCountsQuery = useEntryStatusCounts(entryCountFilters);
	const disputeCountsQuery = useDisputeStatusCounts();
	const missingTimeStatsQuery = useMissingTimeStats();

	const { mutate: mutateUpdateStatus } = useUpdateEntryStatus();
	const { mutate: mutateCreateDispute } = useCreateDispute();
	const { mutate: mutateResolveDispute } = useResolveDispute();
	const { mutate: mutateRejectDispute } = useRejectDispute();
	const { mutate: mutateSendReminder } = useSendReminder();
	const { mutate: mutateBulkSendReminders } = useBulkSendReminders();

	const filteredLocations = useMemo<LocationTimekeeping[]>(
		() => (groupedQuery.data?.data ?? []).map(toLocationTimekeeping),
		[groupedQuery.data],
	);

	const groupedTotalPages = groupedQuery.data?.totalPages ?? 1;
	const groupedTotalCount = groupedQuery.data?.total ?? 0;
	const disputeTotalPages = disputesQuery.data?.totalPages ?? 1;
	const disputeTotalCount = disputesQuery.data?.total ?? 0;
	const missingTimeTotalPages = missingTimeQuery.data?.totalPages ?? 1;

	const locationStatusCounts = useMemo<
		Record<ApprovalStatusFilter, number>
	>(() => {
		const c = entryCountsQuery.data ?? {};
		const p = c[TimesheetEntryStatus.PENDING] ?? 0;
		const a = c[TimesheetEntryStatus.APPROVED] ?? 0;
		const d = c[TimesheetEntryStatus.DISPUTED] ?? 0;
		return {
			ALL: p + a + d,
			[TimesheetEntryStatus.PENDING]: p,
			[TimesheetEntryStatus.APPROVED]: a,
			[TimesheetEntryStatus.DISPUTED]: d,
			[TimesheetEntryStatus.REJECTED]: c[TimesheetEntryStatus.REJECTED] ?? 0,
			[TimesheetEntryStatus.DRAFT]: c[TimesheetEntryStatus.DRAFT] ?? 0,
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
			lastRefreshedAt: s?.lastRefreshedAt ?? null,
		};
	}, [statsQuery.data]);

	const filteredApprovalEntries = useMemo<TimeApprovalEntry[]>(
		() => (approvalEntriesQuery.data?.data ?? []).map(toTimeApprovalEntry),
		[approvalEntriesQuery.data],
	);

	const paginatedApprovalEntries = filteredApprovalEntries;
	const totalPages = approvalEntriesQuery.data?.totalPages ?? 1;
	const approvalTotalCount = approvalEntriesQuery.data?.total ?? 0;

	const filteredDisputeLogs = useMemo<DisputeLogEntry[]>(
		() =>
			(disputesQuery.data?.data ?? []).map((item) =>
				toDisputeLogEntry(item, tz),
			),
		[disputesQuery.data, tz],
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
		const day = utcInstantToIsoDateString(entry.date) || entry.date;
		const log: TimeLog = {
			id: entry.id,
			startDate: day,
			endDate: day,
			payCode: entry.payCode as TimeLog["payCode"],
			startTime: entry.startTime,
			endTime: entry.endTime,
			totalHours: entry.hours,
			note: null,
			status: TimesheetEntryStatus.DISPUTED,
			source: entry.source,
		};
		const worker: WorkerTimekeeping = {
			id: entry.id,
			name: entry.workerName,
			position: entry.position,
			source: entry.source,
			status: TimesheetEntryStatus.DISPUTED,
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
				payload: {
					status: TimesheetEntryStatus.APPROVED,
					approvalSource: "Manual",
				},
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
			Date: fmtDateRange(e.startDate, e.endDate),
			"Pay Code": e.payCode,
			Hours: e.hours,
			Source: e.source === "MOBILE_APP" ? "Mobile App" : "File Upload",
			Notes: e.notes || "",
		}));
		exportAsCSV(data, `time_reports_${new Date().toISOString().split("T")[0]}`);
	}, [reportEntries, fmtDateRange]);

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
		approvalLimit,
		setApprovalLimit,
		approvalPageSizeOptions: APPROVAL_PAGE_SIZE_OPTIONS,
		approvalTotalCount,
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
		groupedLimit,
		setGroupedLimit,
		groupedPageSizeOptions: PAGE_SIZE_OPTIONS,
		groupedTotalCount,
		groupedTotalPages,
		reportPage,
		setReportPage,
		reportTotalPages,
		disputePage,
		setDisputePage,
		disputeLimit,
		setDisputeLimit,
		disputePageSizeOptions: PAGE_SIZE_OPTIONS,
		disputeTotalCount,
		disputeTotalPages,
		missingTimePage,
		setMissingTimePage,
		missingTimeTotalPages,
		filterConfigs,
	};
}
