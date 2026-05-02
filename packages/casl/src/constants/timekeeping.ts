import type { AppSubjects } from "../types/subjects";

export const TIMEKEEPING_ROUTE: AppSubjects = "Timekeeping";

export const TIMEKEEPING_TAB_SUBJECTS = {
	timekeeping: "Timesheet",
	"time-approval": "Timesheet",
	"dispute-log": "TimesheetDispute",
	"missing-time": "MissingTimeCase",
	"time-reports": "TimekeepingSummary",
	"pay-codes": "OrganizationPayCode",
	holidays: "OrganizationHoliday",
} as const satisfies Record<string, AppSubjects>;

export type TimekeepingTabSubjectKey = keyof typeof TIMEKEEPING_TAB_SUBJECTS;
