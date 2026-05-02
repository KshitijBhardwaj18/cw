/**
 * App-level re-exports and aliases for timekeeping.
 * Canonical UI shapes live in `@repo/ui/general/timekeeping/types`.
 */
export type {
	ApprovalStatusFilter,
	DataSourceFilter,
	DisputeLogEntry,
	DisputeStatus,
	DisputeStatusFilter,
	HolidayEntry,
	LocationTimekeeping,
	MissingTimeEntry,
	MissingTimeStatus,
	PayCode,
	TimeApprovalEntry,
	TimeEntryStatus,
	TimeLog,
	TimeReportGroupByOption,
	WorkerTimekeeping,
} from "@repo/ui/general/timekeeping/types";

export type DataSource =
	| "FILE_UPLOAD"
	| "MOBILE_APP"
	| "MANUAL"
	| "INTEGRATION";

export type TimekeepingTab =
	| "timekeeping"
	| "time-approval"
	| "dispute-log"
	| "missing-time"
	| "time-reports"
	| "pay-codes"
	| "holidays";
