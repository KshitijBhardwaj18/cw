/** Mirrors Prisma `TimesheetEntryStatus`. Keep synchronized with schema.prisma. */
export enum TimesheetEntryStatus {
	PENDING = "PENDING",
	APPROVED = "APPROVED",
	REJECTED = "REJECTED",
	DISPUTED = "DISPUTED",
	DRAFT = "DRAFT",
}

/** Vendor list filter: stable order + display labels (PENDING → "Submitted"). */
export const TIMESHEET_ENTRY_STATUS_VENDOR_FILTER_OPTIONS = [
	{ value: TimesheetEntryStatus.DRAFT, label: "Draft" },
	{ value: TimesheetEntryStatus.PENDING, label: "Submitted" },
	{ value: TimesheetEntryStatus.APPROVED, label: "Approved" },
	{ value: TimesheetEntryStatus.REJECTED, label: "Rejected" },
	{ value: TimesheetEntryStatus.DISPUTED, label: "Disputed" },
] as const satisfies ReadonlyArray<{
	value: TimesheetEntryStatus;
	label: string;
}>;

/** All Prisma statuses; suitable for query-param / filter validation. */
export const TIMESHEET_ENTRY_STATUS_VALUES = [
	TimesheetEntryStatus.DRAFT,
	TimesheetEntryStatus.PENDING,
	TimesheetEntryStatus.APPROVED,
	TimesheetEntryStatus.REJECTED,
	TimesheetEntryStatus.DISPUTED,
] as const satisfies readonly TimesheetEntryStatus[];
