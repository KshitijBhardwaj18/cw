import type { TimesheetEntryStatus } from "@repo/shared";
import type { LucideIcon } from "lucide-react";
import type { MetricCardVariant } from "../../MetricCard";

export interface PayCodeStats {
	key: string;
	label: string;
	value: number;
	icon: LucideIcon;
	variant: MetricCardVariant;
}

export type PayCode =
	| "REG"
	| "Regular"
	| "Training"
	| "OT"
	| "Double Time"
	| "PTO"
	| "Holiday"
	| "Sick"
	| "Bereavement"
	| "Jury Duty"
	| "On-Call";

export type TimeEntryStatus = TimesheetEntryStatus;
export type TimekeepingDataSource = "FILE_UPLOAD" | "MOBILE_APP";

export interface TimeApprovalEntry {
	id: string;
	workerName: string;
	position: string;
	startDate: string;
	endDate: string;
	regularHours: number;
	overtimeHours: number;
	totalHours: number;
	status: TimeEntryStatus;
	startTime: string;
	endTime: string;
	payCode: PayCode;
	source: TimekeepingDataSource;
	note: string | null;
	pendingDays?: number;
	isAutoApproved?: boolean;
}

export interface TimeLog {
	id: string;
	startDate: string;
	endDate: string;
	payCode: PayCode;
	startTime: string;
	endTime: string;
	totalHours: number;
	note: string | null;
	status: TimeEntryStatus;
	approvalSource?: "Auto" | "Manual";
	source: TimekeepingDataSource;
}

export interface WorkerTimekeeping {
	id: string;
	name: string;
	position: string;
	source: TimekeepingDataSource;
	status: TimeEntryStatus;
	regularHours: number;
	overtimeHours: number;
	totalHours: number;
	timeLogs: TimeLog[];
}

export interface DepartmentTimekeeping {
	id: string;
	name: string;
	workerCount: number;
	totalHours: number;
	workers: WorkerTimekeeping[];
}

export interface LocationTimekeeping {
	id: string;
	name: string;
	entryCount: number;
	totalHours: number;
	departments: DepartmentTimekeeping[];
}

export type DataSourceFilter = TimekeepingDataSource | "ALL";

export type ApprovalStatusFilter = TimeEntryStatus | "ALL";

export interface TimekeepingStatCard {
	key: string;
	label: string;
	value: number;
	subLabel: string;
	icon: LucideIcon;
	variant: MetricCardVariant;
}

export interface PayCodeConfigEntry {
	code: string;
	description: string;
	multiplier: string | number | null;
}

export interface PayCodeConfig {
	category: string;
	codes: PayCodeConfigEntry[];
}

export interface HolidayEntry {
	id: string;
	name: string;
	/** Display date (mock / legacy rows) */
	date?: string;
	/** API: observed calendar date */
	observedOn?: string;
	dayOfWeek?: string;
	holidayType?: string | null;
	/** Mock / display label */
	type?: string;
}

export interface HolidayStats {
	key: string;
	label: string;
	value: number;
	icon: LucideIcon;
	variant: MetricCardVariant;
}

export type TimeReportGroupByOption =
	| "location"
	| "department"
	| "date"
	| "payCode";

export interface TimeReportEntry {
	id: string;
	workerName: string;
	location: string;
	department: string;
	startDate: string;
	endDate: string;
	payCode: string;
	hours: number;
	source: TimekeepingDataSource;
	notes: string | null;
}

export interface GroupedTimeReport {
	id: string;
	title: string;
	entryCount: number;
	totalHours: number;
	payCodeBreakdown: Record<string, number>;
	entries: TimeReportEntry[];
	icon: LucideIcon;
}

export type MissingTimeStatus = "Overdue" | "Pending";
export type WorkerType =
	| "Contract"
	| "Per Diem"
	| "Travel"
	| "Full Time"
	| "Part Time";

export interface MissingTimeEntry {
	id: string;
	status: MissingTimeStatus;
	workerName: string;
	workerType: WorkerType;
	location: string;
	department: string;
	position: string;
	missingDates: string[];
	lastSubmitted: string;
	daysOverdue: number;
}

export interface MissingTimeStatCard {
	key: string;
	label: string;
	value: number;
	subLabel: string;
	icon: LucideIcon;
	variant: MetricCardVariant;
}

export type DisputeStatus = "Open" | "Resolved" | "Rejected";
export type DisputeStatusFilter = DisputeStatus | "ALL";

export interface DisputeLogEntry {
	id: string;
	workerName: string;
	position: string;
	date: string;
	startTime: string;
	endTime: string;
	payCode: string;
	hours: number;
	source: TimekeepingDataSource;
	disputeReason: string;
	supportingDocuments?: {
		key: string;
		name: string;
		type: string;
		size: number;
		lastModified?: number;
	}[];
	resolution?: string;
	submittedBy: {
		name: string;
		role: string;
		timestamp: string;
	};
	resolvedAt?: string;
	status: DisputeStatus;
}

export interface DisputeStatCard {
	key: string;
	label: string;
	value: number;
	subLabel: string;
	icon: LucideIcon;
	variant: MetricCardVariant;
}

/*  ----- Grouped State & Handler Interfaces ----- */

export interface TimekeepingState {
	searchQuery: string;
	isFiltersExpanded: boolean;
	dataSourceFilter: DataSourceFilter;
	statusFilter: ApprovalStatusFilter;
	filteredLocations: LocationTimekeeping[];
	locationStatusCounts: Record<string, number>;
	stats: {
		totalEntries: number;
		fileUploads: number;
		mobileApps: number;
		totalHours: number;
		openDisputes: number;
	};
}

export interface TimekeepingHandlers {
	setSearchQuery: (q: string) => void;
	setIsFiltersExpanded: (e: boolean) => void;
	setDataSourceFilter: (f: DataSourceFilter) => void;
	setStatusFilter: (f: ApprovalStatusFilter) => void;
	openDisputeDialog: (log: TimeLog, worker: WorkerTimekeeping) => void;
	openApproveDialog: (log: TimeLog, worker: WorkerTimekeeping) => void;
}

export interface ApprovalState {
	statusFilter: ApprovalStatusFilter;
	currentPage: number;
	totalPages: number;
	paginatedEntries: TimeApprovalEntry[];
	statusCounts: Record<string, number>;
}

export interface ApprovalHandlers {
	setStatusFilter: (f: ApprovalStatusFilter) => void;
	setCurrentPage: (p: number) => void;
	handleApprove: (entry: TimeApprovalEntry) => void;
	handleDispute: (entry: TimeApprovalEntry) => void;
}

export interface DisputeState {
	searchQuery: string;
	statusFilter: DisputeStatusFilter;
	filteredLogs: DisputeLogEntry[];
	statusCounts: Record<string, number>;
	isFiltersExpanded: boolean;
}

export interface DisputeHandlers {
	setSearchQuery: (q: string) => void;
	setStatusFilter: (f: DisputeStatusFilter) => void;
	setIsFiltersExpanded: (e: boolean) => void;
	handleResolve: (entry: DisputeLogEntry) => void;
	handleReject: (entry: DisputeLogEntry) => void;
	openDetailDialog: (entry: DisputeLogEntry) => void;
}

export interface MissingTimeState {
	searchQuery: string;
	filteredEntries: MissingTimeEntry[];
	overdueCount: number;
	isFiltersExpanded: boolean;
	isConfigureOpen: boolean;
	isReminderOpen: boolean;
	isViewOpen: boolean;
	isBulkOpen: boolean;
	bulkTarget: "all" | "overdue";
	selectedWorker: MissingTimeEntry | null;
}

export interface MissingTimeHandlers {
	setSearchQuery: (q: string) => void;
	setIsFiltersExpanded: (e: boolean) => void;
	setIsConfigureOpen: (o: boolean) => void;
	setIsReminderOpen: (o: boolean) => void;
	setIsViewOpen: (o: boolean) => void;
	setIsBulkOpen: (o: boolean) => void;
	handleViewWorker: (worker: MissingTimeEntry) => void;
	handleSendReminder: (worker: MissingTimeEntry) => void;
	handleBulkAction: (target: "all" | "overdue") => void;
	handleExportReport: () => void;
}

export interface TimeReportState {
	groupBy: TimeReportGroupByOption;
	groupedData: GroupedTimeReport[];
}

export interface TimeReportHandlers {
	setGroupBy: (g: TimeReportGroupByOption) => void;
	handleExport: () => void;
}
