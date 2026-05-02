import type { PagePaginatedResponse } from "@repo/shared";
import { ApiClient } from "@/lib/api-client";
import type {
	DisputeItem,
	DisputeStatusCounts,
	DisputesQuery,
	EntriesQuery,
	EntryStatusCounts,
	HolidayItem,
	HolidayStats,
	HolidaysQuery,
	LocationGrouped,
	MissingTimeCase,
	MissingTimeQuery,
	MissingTimeStats,
	TimeEntryLog,
	TimekeepingPolicy,
	TimekeepingStats,
} from "@/services/organization-timekeeping.types";

export type {
	DisputeItem,
	DisputeStatusCounts,
	EntryStatusCounts,
	HolidayItem,
	HolidayStats,
	LocationGrouped,
	MissingTimeCase,
	MissingTimeStats,
	TimeEntryLog,
	TimekeepingStats,
} from "@/services/organization-timekeeping.types";

function base(organizationId: string) {
	return `/api/organizations/${organizationId}/timekeeping`;
}

/** Admin portal: same behavior as org `TimekeepingService`, scoped by URL `organizationId`. */
export class OrganizationTimekeepingService {
	static async uploadDisputeSupportingDocument(
		organizationId: string,
		file: File,
	) {
		const form = new FormData();
		form.append("file", file);
		return ApiClient.post<{
			key: string;
			name: string;
			type: string;
			size: number;
		}>(`${base(organizationId)}/disputes/supporting-documents`, form);
	}

	static async getDisputeSupportingDocumentSignedUrl(
		organizationId: string,
		key: string,
	) {
		return ApiClient.get<{ signedUrl: string }>(
			`${base(organizationId)}/disputes/supporting-documents/signed-url`,
			{ key },
		);
	}

	static async getStats(organizationId: string) {
		return ApiClient.get<TimekeepingStats>(`${base(organizationId)}/stats`);
	}

	static async getEntryStatusCounts(
		organizationId: string,
		query?: EntriesQuery,
	) {
		return ApiClient.get<EntryStatusCounts>(
			`${base(organizationId)}/entries/counts`,
			query,
		);
	}

	static async listEntriesGrouped(organizationId: string, query: EntriesQuery) {
		return ApiClient.get<PagePaginatedResponse<LocationGrouped>>(
			`${base(organizationId)}/entries/grouped`,
			query,
		);
	}

	static async listEntries(organizationId: string, query: EntriesQuery) {
		return ApiClient.get<PagePaginatedResponse<TimeEntryLog>>(
			`${base(organizationId)}/entries`,
			query,
		);
	}

	static async updateEntryStatus(
		organizationId: string,
		entryId: string,
		payload: { status: string; approvalSource?: string },
	) {
		return ApiClient.patch<TimeEntryLog>(
			`${base(organizationId)}/entries/${entryId}/status`,
			payload,
		);
	}

	static async createDispute(
		organizationId: string,
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
			`${base(organizationId)}/entries/${entryId}/dispute`,
			payload,
		);
	}

	static async getDisputeStatusCounts(organizationId: string) {
		return ApiClient.get<DisputeStatusCounts>(
			`${base(organizationId)}/disputes/counts`,
		);
	}

	static async listDisputes(organizationId: string, query: DisputesQuery) {
		return ApiClient.get<PagePaginatedResponse<DisputeItem>>(
			`${base(organizationId)}/disputes`,
			query,
		);
	}

	static async resolveDispute(
		organizationId: string,
		disputeId: string,
		payload: {
			resolution?: string;
			resolutionCategory?: string;
			finalHours?: number;
		},
	) {
		return ApiClient.patch<{ success: boolean }>(
			`${base(organizationId)}/disputes/${disputeId}/resolve`,
			payload,
		);
	}

	static async rejectDispute(
		organizationId: string,
		disputeId: string,
		payload: { reason: string },
	) {
		return ApiClient.patch<{ success: boolean }>(
			`${base(organizationId)}/disputes/${disputeId}/reject`,
			payload,
		);
	}

	static async getMissingTimeStats(organizationId: string) {
		return ApiClient.get<MissingTimeStats>(
			`${base(organizationId)}/missing-time/stats`,
		);
	}

	static async listMissingTime(
		organizationId: string,
		query: MissingTimeQuery,
	) {
		return ApiClient.get<PagePaginatedResponse<MissingTimeCase>>(
			`${base(organizationId)}/missing-time`,
			query,
		);
	}

	static async sendReminder(
		organizationId: string,
		caseId: string,
		payload: { message?: string },
	) {
		return ApiClient.post<{ success: boolean }>(
			`${base(organizationId)}/missing-time/${caseId}/remind`,
			payload,
		);
	}

	static async bulkSendReminders(
		organizationId: string,
		target: "all" | "overdue",
		payload: { message?: string },
	) {
		return ApiClient.post<{ success: boolean; count: number }>(
			`${base(organizationId)}/missing-time/bulk-remind?target=${target}`,
			payload,
		);
	}

	static async getHolidayStats(organizationId: string, year?: number) {
		return ApiClient.get<HolidayStats>(
			`${base(organizationId)}/holidays/stats`,
			year !== undefined ? { year } : undefined,
		);
	}

	static async listHolidays(organizationId: string, query?: HolidaysQuery) {
		return ApiClient.get<PagePaginatedResponse<HolidayItem>>(
			`${base(organizationId)}/holidays`,
			query,
		);
	}

	static async createHoliday(
		organizationId: string,
		payload: {
			name: string;
			observedOn: string;
			holidayType?: string;
		},
	) {
		return ApiClient.post<HolidayItem>(
			`${base(organizationId)}/holidays`,
			payload,
		);
	}

	static async deleteHoliday(organizationId: string, holidayId: string) {
		return ApiClient.delete<{ success: boolean }>(
			`${base(organizationId)}/holidays/${holidayId}`,
		);
	}

	static async updateHoliday(
		organizationId: string,
		holidayId: string,
		payload: { name?: string; observedOn?: string; holidayType?: string },
	) {
		return ApiClient.patch<HolidayItem>(
			`${base(organizationId)}/holidays/${holidayId}`,
			payload,
		);
	}

	static async getPolicy(organizationId: string) {
		return ApiClient.get<TimekeepingPolicy>(`${base(organizationId)}/policy`);
	}

	static async updatePolicy(
		organizationId: string,
		payload: Partial<{
			submissionDeadlineDays: number;
			reminderIntervalDays: number;
			autoCreateMissingCases: boolean;
		}>,
	) {
		return ApiClient.patch<TimekeepingPolicy>(
			`${base(organizationId)}/policy`,
			payload,
		);
	}
}
