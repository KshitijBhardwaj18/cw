import type { PagePaginatedResponse, TimesheetEntryStatus } from "@repo/shared";
import { ApiClient } from "@/lib/api-client";

export type TimekeepingStats = {
	totalEntries: number;
	fileUploads: number;
	mobileApps: number;
	totalHours: number;
	openDisputes: number;
	missingCount: number;
	overdueCount: number;
	lastRefreshedAt: string | null;
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
	status: TimesheetEntryStatus;
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

export type PayCodesQuery = {
	search?: string;
	page?: number;
	limit?: number;
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
	supportingDocuments?:
		| {
				key: string;
				name: string;
				type: string;
				size: number;
				lastModified?: number;
		  }[]
		| null;
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

const BASE = "/api/org/timekeeping";

export class TimekeepingService {
	static async uploadDisputeSupportingDocument(file: File) {
		const form = new FormData();
		form.append("file", file);
		return ApiClient.post<{
			key: string;
			name: string;
			type: string;
			size: number;
		}>(`${BASE}/disputes/supporting-documents`, form);
	}

	static async getDisputeSupportingDocumentSignedUrl(key: string) {
		return ApiClient.get<{ signedUrl: string }>(
			`${BASE}/disputes/supporting-documents/signed-url`,
			{ key },
		);
	}

	static async getStats() {
		return ApiClient.get<TimekeepingStats>(`${BASE}/stats`);
	}

	static async getEntryStatusCounts(query?: EntriesQuery) {
		return ApiClient.get<EntryStatusCounts>(`${BASE}/entries/counts`, query);
	}

	static async listEntriesGrouped(query: EntriesQuery) {
		return ApiClient.get<PagePaginatedResponse<LocationGrouped>>(
			`${BASE}/entries/grouped`,
			query,
		);
	}

	static async listEntries(query: EntriesQuery) {
		return ApiClient.get<PagePaginatedResponse<TimeEntryLog>>(
			`${BASE}/entries`,
			query,
		);
	}

	static async updateEntryStatus(
		entryId: string,
		payload: { status: string; approvalSource?: string },
	) {
		return ApiClient.patch<TimeEntryLog>(
			`${BASE}/entries/${entryId}/status`,
			payload,
		);
	}

	static async createDispute(
		entryId: string,
		payload: {
			disputeType?: string;
			description: string;
			originalHours?: number;
			disputedHours?: number;
			supportingDocuments?: {
				key?: string;
				name: string;
				type: string;
				size: number;
				lastModified?: number;
			}[];
		},
	) {
		return ApiClient.post<{ id: string }>(
			`${BASE}/entries/${entryId}/dispute`,
			payload,
		);
	}

	static async getDisputeStatusCounts() {
		return ApiClient.get<DisputeStatusCounts>(`${BASE}/disputes/counts`);
	}

	static async listDisputes(query: DisputesQuery) {
		return ApiClient.get<PagePaginatedResponse<DisputeItem>>(
			`${BASE}/disputes`,
			query,
		);
	}

	static async resolveDispute(
		disputeId: string,
		payload: {
			resolution?: string;
			resolutionCategory?: string;
			finalHours?: number;
		},
	) {
		return ApiClient.patch<{ success: boolean }>(
			`${BASE}/disputes/${disputeId}/resolve`,
			payload,
		);
	}

	static async rejectDispute(disputeId: string, payload: { reason: string }) {
		return ApiClient.patch<{ success: boolean }>(
			`${BASE}/disputes/${disputeId}/reject`,
			payload,
		);
	}

	static async getMissingTimeStats() {
		return ApiClient.get<MissingTimeStats>(`${BASE}/missing-time/stats`);
	}

	static async listMissingTime(query: MissingTimeQuery) {
		return ApiClient.get<PagePaginatedResponse<MissingTimeCase>>(
			`${BASE}/missing-time`,
			query,
		);
	}

	static async sendReminder(caseId: string, payload: { message?: string }) {
		return ApiClient.post<{ success: boolean }>(
			`${BASE}/missing-time/${caseId}/remind`,
			payload,
		);
	}

	static async bulkSendReminders(
		target: "all" | "overdue",
		payload: { message?: string },
	) {
		return ApiClient.post<{ success: boolean; count: number }>(
			`${BASE}/missing-time/bulk-remind?target=${target}`,
			payload,
		);
	}

	static async getHolidayStats(year?: number) {
		return ApiClient.get<HolidayStats>(
			`${BASE}/holidays/stats`,
			year !== undefined ? { year } : undefined,
		);
	}

	static async listHolidays(query?: HolidaysQuery) {
		return ApiClient.get<PagePaginatedResponse<HolidayItem>>(
			`${BASE}/holidays`,
			query,
		);
	}

	static async createHoliday(payload: {
		name: string;
		observedOn: string;
		holidayType?: string;
	}) {
		return ApiClient.post<HolidayItem>(`${BASE}/holidays`, payload);
	}

	static async deleteHoliday(holidayId: string) {
		return ApiClient.delete<{ success: boolean }>(
			`${BASE}/holidays/${holidayId}`,
		);
	}

	static async updateHoliday(
		holidayId: string,
		payload: { name?: string; observedOn?: string; holidayType?: string },
	) {
		return ApiClient.patch<HolidayItem>(
			`${BASE}/holidays/${holidayId}`,
			payload,
		);
	}

	// ─── Submission Deadline Policy ──────────────────────────────────────────

	static async getPolicy() {
		return ApiClient.get<TimekeepingPolicy>(`${BASE}/policy`);
	}

	static async updatePolicy(
		payload: Partial<{
			submissionDeadlineDays: number;
			reminderIntervalDays: number;
			autoCreateMissingCases: boolean;
		}>,
	) {
		return ApiClient.patch<TimekeepingPolicy>(`${BASE}/policy`, payload);
	}

	// ─── Internal Upload ─────────────────────────────────────────────────────

	static async internalUpload(file: File) {
		const formData = new FormData();
		formData.append("file", file);
		return ApiClient.request<{
			jobId: string;
			fileName: string;
			status: string;
		}>({
			method: "POST",
			url: `${BASE}/internal-upload`,
			data: formData,
		});
	}

	static async getUploadJob(jobId: string) {
		return ApiClient.get<{
			id: string;
			status: string;
			result: {
				created: number;
				skipped: number;
				failed: number;
				errors: { row: number; message: string }[];
			} | null;
			completedAt: string | null;
		}>(`${BASE}/internal-upload/${jobId}`);
	}
}
