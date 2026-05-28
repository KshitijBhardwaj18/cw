import {
	formatTzShortDate,
	formatUtcLongDate,
	type OrganizationTimezone,
	TimesheetEntryStatus,
	utcInstantToIsoDateString,
} from "@repo/shared";
import type {
	DisputeLogEntry,
	DisputeStatus,
	LocationTimekeeping,
	TimeEntryStatus,
	TimeLog,
	WorkerTimekeeping,
	WorkerType,
} from "@repo/ui/general/timekeeping/types";
import type {
	DisputeItem,
	LocationGrouped,
	TimeEntryLog,
} from "@/services/organization-timekeeping.types";

export const GROUPED_PAGE_SIZE = 20;
/** Page size for dispute log API (`useDisputes`). */
export const DISPUTE_LIST_PAGE_SIZE = 10;
export const MISSING_TIME_LIST_PAGE_SIZE = 20;
export const REPORT_PAGE_SIZE = 20;

export const WORKER_TYPE_LABEL: Record<string, WorkerType> = {
	EXTERNAL_VENDOR_LTO: "Contract",
	EXTERNAL_VENDOR_PER_DIEM: "Per Diem",
	INTERNAL_PRN: "Per Diem",
	INTERNAL_FULL_TIME: "Full Time",
	INTERNAL_PART_TIME: "Part Time",
	EXTERNAL_EOR: "Travel",
	EXTERNAL_1099: "Travel",
	SELF: "Contract",
	INTERNAL_FLOAT_POOL: "Contract",
	INTERNAL_VOLUNTEER: "Contract",
};

export function workDateToIso(workDate: string | null | undefined): string {
	return utcInstantToIsoDateString(workDate);
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

export function toTimeLog(entry: TimeEntryLog): TimeLog {
	const openDisputeDescription =
		entry.status === TimesheetEntryStatus.DISPUTED
			? (entry.disputes?.[0]?.description ?? null)
			: null;
	const noteForDisplay =
		entry.status === TimesheetEntryStatus.DISPUTED
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

export function toLocationTimekeeping(
	loc: LocationGrouped,
): LocationTimekeeping {
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

export function toDisputeLogEntry(
	item: DisputeItem,
	tz?: OrganizationTimezone,
): DisputeLogEntry {
	let status: DisputeStatus = "Open";
	if (item.resolutionCategory === "REJECTED") status = "Rejected";
	else if (item.resolution !== null) status = "Resolved";

	const workDateIso = item.timesheetEntry?.workDate
		? workDateToIso(item.timesheetEntry.workDate)
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
