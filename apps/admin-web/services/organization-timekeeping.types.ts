/** Mirrors org-web `services/timekeeping.service` types for admin explicit-org API. */

export type TimekeepingStats = {
	totalEntries: number;
	fileUploads: number;
	mobileApps: number;
	totalHours: number;
	openDisputes: number;
	missingCount: number;
	overdueCount: number;
};

export type EntryStatusCounts = Record<string, number>;

export type TimeEntryLog = {
	id: string;
	workDate: string;
	clockIn: string | null;
	clockOut: string | null;
	hours: number | null;
	regularHours: number;
	overtimeHours: number;
	breakMinutes: number;
	notes: string | null;
	disputes?: { id: string; description: string }[];
	status: "PENDING" | "APPROVED" | "REJECTED" | "DISPUTED";
	dataSource: "FILE_UPLOAD" | "MOBILE_APP" | "MANUAL" | "INTEGRATION";
	approvalSource: string | null;
	approvedAt: string | null;
	payCode: {
		id: string;
		code: string;
		description: string;
		multiplier: number | null;
	} | null;
	candidate: {
		id: string;
		workforceType: string | null;
		user: { name: string };
	};
	placement: { id: string; jobTitle: string | null } | null;
	department: { id: string; name: string } | null;
	location: { id: string; name: string } | null;
};

export type WorkerGrouped = {
	id: string;
	name: string;
	position: string;
	regularHours: number;
	overtimeHours: number;
	totalHours: number;
	timeLogs: TimeEntryLog[];
};

export type DepartmentGrouped = {
	id: string;
	name: string;
	workerCount: number;
	totalHours: number;
	workers: WorkerGrouped[];
};

export type LocationGrouped = {
	id: string;
	name: string;
	entryCount: number;
	totalHours: number;
	departments: DepartmentGrouped[];
};

export type HolidayStats = {
	year: number;
	total: number;
	federal: number;
	organization: number;
};

export type HolidaysQuery = {
	year?: number;
	search?: string;
	page?: number;
	limit?: number;
};

export type EntriesQuery = {
	search?: string;
	status?: string;
	dataSource?: string;
	weekEndingDate?: string;
	locationId?: string;
	departmentId?: string;
	page?: number;
	limit?: number;
};

export type DisputeItem = {
	id: string;
	disputeType: string | null;
	description: string;
	originalHours: number | null;
	disputedHours: number | null;
	raisedAt: string;
	resolution: string | null;
	resolutionCategory: string | null;
	finalHours: number | null;
	resolvedAt: string | null;
	raisedBy: { id: string; name: string; role: string } | null;
	resolvedBy: { id: string; name: string } | null;
	timesheet: {
		id: string;
		weekEndingDate: string;
		candidate: { id: string; user: { name: string } };
	};
	timesheetEntry: {
		id: string;
		workDate: string;
		clockIn: string | null;
		clockOut: string | null;
		hours: number | null;
		status: string;
		dataSource: string;
		payCode: { code: string; description: string } | null;
		location: { id: string; name: string } | null;
		department: { id: string; name: string } | null;
		placement: { jobTitle: string | null } | null;
	} | null;
};

export type DisputeStatusCounts = {
	open: number;
	resolved: number;
	rejected: number;
};

export type DisputesQuery = {
	search?: string;
	status?: string;
	page?: number;
	limit?: number;
};

export type MissingTimeCase = {
	id: string;
	workDate: string;
	status: "OPEN" | "REMINDED" | "RESOLVED" | "WAIVED";
	daysOverdue: number;
	lastRemindedAt: string | null;
	resolvedAt: string | null;
	notes: string | null;
	candidate: {
		id: string;
		user: { name: string };
		workforceType: string | null;
	};
	placement: { id: string; jobTitle: string | null } | null;
	department: { id: string; name: string } | null;
	location: { id: string; name: string } | null;
};

export type MissingTimeStats = {
	total: number;
	overdue: number;
	resolved: number;
};

export type MissingTimeQuery = {
	search?: string;
	status?: string;
	page?: number;
	limit?: number;
};

export type HolidayItem = {
	id: string;
	name: string;
	observedOn: string;
	holidayType: string | null;
	date?: string;
	dayOfWeek?: string;
	type?: string;
};

export type TimekeepingPolicy = {
	organizationId: string;
	submissionDeadlineDays: number;
	reminderIntervalDays: number;
	autoCreateMissingCases: boolean;
};
