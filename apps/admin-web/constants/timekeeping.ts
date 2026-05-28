import { TimesheetEntryStatus } from "@repo/shared";
import type { ApprovalStatusFilter } from "@repo/ui/general/timekeeping/types";

export const DEFAULT_DISPUTE_WINDOW_DAYS = 3;

export const TIMEKEEPING_POLICY_DEFAULTS = {
	submissionDeadlineDays: 3,
	reminderIntervalDays: 2,
	autoApproveAfterDays: 3,
} as const;

export const DATA_SOURCE_OPTIONS: { value: string; label: string }[] = [
	{ value: "ALL", label: "All Sources" },
	{ value: "FILE_UPLOAD", label: "File / Integration" },
	{ value: "MOBILE_APP", label: "Mobile App" },
];

export const TIMEKEEPING_STATUS_FILTER_OPTIONS: {
	key: ApprovalStatusFilter;
	label: string;
}[] = [
	{ key: "ALL", label: "All" },
	{ key: TimesheetEntryStatus.PENDING, label: "Pending" },
	{ key: TimesheetEntryStatus.APPROVED, label: "Approved" },
	{ key: TimesheetEntryStatus.DISPUTED, label: "Disputed" },
];
