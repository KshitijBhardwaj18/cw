import { formatDateRange, TimesheetEntryStatus } from "@repo/shared";
import type { LucideIcon } from "lucide-react";
import {
	Building2,
	Calendar,
	DollarSign,
	LayoutGrid,
	MapPin,
} from "lucide-react";

import type {
	ApprovalStatusFilter,
	DataSourceFilter,
	DisputeLogEntry,
	DisputeStatus,
	GroupedTimeReport,
	LocationTimekeeping,
	PayCode,
	TimeApprovalEntry,
	TimeEntryStatus,
	TimeLog,
	TimeReportEntry,
	TimeReportGroupByOption,
	WorkerTimekeeping,
} from "../types";

export type GroupByOption = TimeReportGroupByOption;

export type ReportEntry = TimeReportEntry;

export type GroupedReportData = GroupedTimeReport;

export const flattenReportEntries = (
	locations: LocationTimekeeping[],
): TimeReportEntry[] => {
	const entries: TimeReportEntry[] = [];
	for (const loc of locations) {
		for (const dept of loc.departments) {
			for (const worker of dept.workers) {
				for (const log of worker.timeLogs) {
					entries.push({
						id: log.id,
						workerName: worker.name,
						location: loc.name,
						department: dept.name,
						startDate: log.startDate,
						endDate: log.endDate,
						payCode: log.payCode,
						hours: log.totalHours,
						source: log.source,
						notes: log.note,
					});
				}
			}
		}
	}
	return entries;
};

export const groupReportEntries = (
	entries: ReportEntry[],
	groupBy: GroupByOption,
): GroupedReportData[] => {
	const groups: Record<string, GroupedReportData> = {};

	for (const entry of entries) {
		let groupId = "";
		let groupTitle = "";
		let icon: LucideIcon = LayoutGrid;

		switch (groupBy) {
			case "location":
				groupId = entry.location;
				groupTitle = entry.location;
				icon = MapPin;
				break;
			case "department":
				groupId = `${entry.location}-${entry.department}`;
				groupTitle = `${entry.location} - ${entry.department}`;
				icon = Building2;
				break;
			case "date":
				groupId = entry.startDate;
				groupTitle = formatDateRange(entry.startDate, entry.endDate);
				icon = Calendar;
				break;
			case "payCode":
				groupId = entry.payCode;
				groupTitle = entry.payCode;
				icon = DollarSign;
				break;
		}

		let group = groups[groupId];
		if (!group) {
			group = {
				id: groupId,
				title: groupTitle,
				entryCount: 0,
				totalHours: 0,
				payCodeBreakdown: {},
				entries: [],
				icon,
			};
			groups[groupId] = group;
		}

		group.entries.push(entry);
		group.entryCount += 1;
		group.totalHours += entry.hours;
		group.payCodeBreakdown[entry.payCode] =
			(group.payCodeBreakdown[entry.payCode] ?? 0) + entry.hours;
	}

	return Object.values(groups).sort((a, b) => a.title.localeCompare(b.title));
};

export const disputeStatusToTimeEntryStatus: Record<
	DisputeStatus,
	TimeEntryStatus
> = {
	Open: TimesheetEntryStatus.DISPUTED,
	Resolved: TimesheetEntryStatus.APPROVED,
	Rejected: TimesheetEntryStatus.DISPUTED,
};

export const calculateWorkerHours = (logs: TimeLog[]) => {
	return logs.reduce(
		(acc, log) => {
			const isOvertime = log.payCode === "OT" || log.payCode === "Double Time";
			if (isOvertime) {
				acc.overtime += log.totalHours;
			} else {
				acc.regular += log.totalHours;
			}
			return acc;
		},
		{ regular: 0, overtime: 0 },
	);
};

export const transformApprovalEntryToLog = (
	entry: TimeApprovalEntry,
): TimeLog => ({
	id: `log-${entry.id}`,
	startDate: entry.startDate,
	endDate: entry.endDate,
	payCode: entry.payCode,
	startTime: entry.startTime,
	endTime: entry.endTime,
	totalHours: entry.totalHours,
	note: entry.note,
	status: entry.status,
	source: entry.source,
});

export const transformApprovalEntryToWorker = (
	entry: TimeApprovalEntry,
	log: TimeLog,
): WorkerTimekeeping => ({
	id: `worker-${entry.id}`,
	name: entry.workerName,
	position: entry.position,
	source: entry.source,
	status: entry.status,
	regularHours: entry.regularHours,
	overtimeHours: entry.overtimeHours,
	totalHours: entry.totalHours,
	timeLogs: [log],
});

export const transformDisputeLogEntryToLog = (
	entry: DisputeLogEntry,
): TimeLog => ({
	id: `dispute-log-${entry.id}`,
	startDate: entry.date,
	endDate: entry.date,
	payCode: entry.payCode as PayCode,
	startTime: entry.startTime,
	endTime: entry.endTime,
	totalHours: entry.hours,
	note: entry.disputeReason,
	status: disputeStatusToTimeEntryStatus[entry.status],
	source: entry.source,
});

export const transformDisputeLogEntryToWorker = (
	entry: DisputeLogEntry,
	log: TimeLog,
): WorkerTimekeeping => ({
	id: `dispute-worker-${entry.id}`,
	name: entry.workerName,
	position: entry.position,
	source: entry.source,
	status: disputeStatusToTimeEntryStatus[entry.status],
	regularHours:
		entry.payCode === "OT" || entry.payCode === "Double Time" ? 0 : entry.hours,
	overtimeHours:
		entry.payCode === "OT" || entry.payCode === "Double Time" ? entry.hours : 0,
	totalHours: entry.hours,
	timeLogs: [log],
});

const filterWorker = (
	worker: WorkerTimekeeping,
	selectedStatusFilter: ApprovalStatusFilter,
	dataSourceFilter: DataSourceFilter,
) => {
	const matchingLogs = worker.timeLogs.filter((log) => {
		const matchesStatus =
			selectedStatusFilter === "ALL" || log.status === selectedStatusFilter;
		const matchesSource =
			dataSourceFilter === "ALL" || log.source === dataSourceFilter;
		return matchesStatus && matchesSource;
	});

	if (matchingLogs.length === 0) return null;

	const { regular, overtime } = calculateWorkerHours(matchingLogs);

	return {
		...worker,
		timeLogs: matchingLogs,
		regularHours: regular,
		overtimeHours: overtime,
		totalHours: regular + overtime,
		status:
			selectedStatusFilter === "ALL"
				? worker.status
				: (selectedStatusFilter as TimeEntryStatus),
	};
};

export const filterLocations = (
	locations: LocationTimekeeping[],
	dataSourceFilter: DataSourceFilter,
	selectedStatusFilter: ApprovalStatusFilter,
	searchQuery: string,
) => {
	const normalizedSearch = searchQuery.toLowerCase();

	return locations
		.map((location) => ({
			...location,
			departments: location.departments
				.map((dept) => ({
					...dept,
					workers: dept.workers
						.map((w) => filterWorker(w, selectedStatusFilter, dataSourceFilter))
						.filter((w): w is NonNullable<typeof w> => w !== null),
				}))
				.filter((dept) => dept.workers.length > 0),
		}))
		.filter((location) => {
			if (location.departments.length === 0) return false;
			if (!searchQuery) return true;

			return (
				location.name.toLowerCase().includes(normalizedSearch) ||
				location.departments.some(
					(dept) =>
						dept.name.toLowerCase().includes(normalizedSearch) ||
						dept.workers.some((w) =>
							w.name.toLowerCase().includes(normalizedSearch),
						),
				)
			);
		});
};
