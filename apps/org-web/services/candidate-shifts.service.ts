import { ApiClient } from "@/lib/api-client";
import type {
	CandidateShiftCounts,
	CandidateShiftsCalendarResponse,
	CandidateShiftsListResponse,
	SubmitShiftTimecardPayload,
	SubmitShiftTimecardResult,
} from "@/types/candidate-shifts";

export interface CandidateShiftsQueryParams {
	page?: number;
	limit?: number;
	search?: string;
	date?: string;
	shiftType?: string;
}

const PER_DIEM_SHIFT_ASSIGNMENT_API_URL = "/api/org/per-diem-shift-assignment";
const PER_DIEM_SHIFT_TIMECARDS_API_URL = "/api/org/per-diem-shift-timecards";
export class CandidateShiftsService {
	static async getAvailableShifts(
		params: CandidateShiftsQueryParams = {},
	): Promise<CandidateShiftsListResponse> {
		return ApiClient.get<CandidateShiftsListResponse>(
			`${PER_DIEM_SHIFT_ASSIGNMENT_API_URL}/candidates/available`,
			params as Record<string, unknown>,
		);
	}

	static async getMyShifts(
		params: CandidateShiftsQueryParams = {},
	): Promise<CandidateShiftsListResponse> {
		return ApiClient.get<CandidateShiftsListResponse>(
			`${PER_DIEM_SHIFT_ASSIGNMENT_API_URL}/candidates/my`,
			params as Record<string, unknown>,
		);
	}

	static async getCounts(): Promise<CandidateShiftCounts> {
		return ApiClient.get<CandidateShiftCounts>(
			`${PER_DIEM_SHIFT_ASSIGNMENT_API_URL}/candidates/counts`,
		);
	}

	static async getCalendarShifts(
		year: number,
		month: number,
	): Promise<CandidateShiftsCalendarResponse> {
		return ApiClient.get<CandidateShiftsCalendarResponse>(
			`${PER_DIEM_SHIFT_ASSIGNMENT_API_URL}/candidates/calendar`,
			{ year, month } as Record<string, unknown>,
		);
	}

	static async claimShift(shiftId: string): Promise<{ success: boolean }> {
		return ApiClient.request<{ success: boolean }>({
			method: "POST",
			url: `${PER_DIEM_SHIFT_ASSIGNMENT_API_URL}/candidates/${shiftId}/claim`,
		});
	}

	static async submitTimecard(
		shiftId: string,
		payload: SubmitShiftTimecardPayload,
	): Promise<SubmitShiftTimecardResult> {
		return ApiClient.request<SubmitShiftTimecardResult>({
			method: "PUT",
			url: `${PER_DIEM_SHIFT_TIMECARDS_API_URL}/candidates/${shiftId}/timecard`,
			data: payload,
		});
	}
}
