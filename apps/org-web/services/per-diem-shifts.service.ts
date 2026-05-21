import type { ShiftStatus, ShiftType } from "@/constants/shifts";
import { ApiClient } from "@/lib/api-client";
import type {
	SubmitShiftTimecardPayload,
	SubmitShiftTimecardResult,
} from "@/types/candidate-shifts";
import type { ClaimableShift } from "@/types/vendor-claim-shifts";

export type CreatePerDiemShiftInput = {
	shiftTemplateId: string;
	shiftDate: string; // YYYY-MM-DD
	startTime: string; // HH:mm
	endTime: string; // HH:mm
	shiftType: ShiftType;
	totalShiftHours: number;
	shiftRate: number;
	vendorRate: number;
	specialtyId?: string | null;
	isPublic?: boolean;
	isUrgent?: boolean;
};

export type PerDiemShiftListItem = {
	id: string;
	title: string;
	status: ShiftStatus;
	isPublic: boolean;
	date: string;
	timeRange: string;
	ratePerHour: number;
	occupation: string;
	specialty: string;
	department: string;
	location: string;
	claimedBy: string | null;
	claimedAt: string | null;
	vendorRatePerHour: number;
	shiftType: ShiftType;
	totalHours: number;
	totalCost: number;
	notifications: number;
	createdBy: string;
	createdAt: string;
	hasConflict: boolean;
	conflictReason: string | null;
};

export type PerDiemShiftStatusCounts = {
	ALL: number;
	OPEN: number;
	IN_PROGRESS: number;
	COMPLETED: number;
	CANCELLED: number;
};

export type PerDiemShiftListResponse = {
	data: PerDiemShiftListItem[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	counts: PerDiemShiftStatusCounts;
};

export type CommandCenterShiftsSummaryCounts = {
	"total-shifts": number;
	filled: number;
	open: number;
	"in-progress": number;
};

export type CommandCenterDepartmentOccupation = {
	department: string;
	occupations: string[];
};

export type CommandCenterShiftFiltersMetaResponse = {
	departments: string[];
	occupations: string[];
	departmentOccupations: CommandCenterDepartmentOccupation[];
};

export type CommandCenterShiftLocation = {
	id: string;
	name: string;
	shifts: PerDiemShiftListItem[];
};

export type CommandCenterShiftLocationsResponse = {
	locations: CommandCenterShiftLocation[];
	counts: CommandCenterShiftsSummaryCounts;
	filtersMeta: CommandCenterShiftFiltersMetaResponse;
	page: number;
	limit: number;
	totalLocations: number;
};

export type VendorPerDiemShiftsQueryParams = {
	page?: number;
	limit?: number;
	search?: string;
	urgency?: "all" | "high" | "medium" | "low";
	specialtyId?: string;
	date?: string;
};

export type VendorPerDiemShiftsListResponse = {
	data: ClaimableShift[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
};

export type VendorShiftClaimingMetrics = {
	totalShifts: number;
	highUrgency: number;
	inProgress: number;
	completed: number;
};

export type VendorAssignableCandidatesResponse = {
	data: Array<{
		id: string;
		name: string;
		role: string;
		initials: string;
	}>;
};

const PER_DIEM_SHIFTS_API_URL = "/api/org/per-diem-shifts";
const PER_DIEM_SHIFT_ASSIGNMENT_API_URL = "/api/org/per-diem-shift-assignment";
const PER_DIEM_SHIFT_TIMECARDS_API_URL = "/api/org/per-diem-shift-timecards";
export class PerDiemShiftsService {
	static async list(query: {
		search?: string;
		status?: string;
		shiftType?: string;
		date?: string;
		page?: number;
		limit?: number;
	}) {
		return ApiClient.get<PerDiemShiftListResponse>(
			`${PER_DIEM_SHIFTS_API_URL}`,
			query as Record<string, unknown>,
		);
	}

	static async getCommandCenterLocations(query: {
		search?: string;
		department?: string;
		occupation?: string;
		page?: number;
		limit?: number;
	}) {
		return ApiClient.get<CommandCenterShiftLocationsResponse>(
			`${PER_DIEM_SHIFTS_API_URL}/command-center/locations`,
			query,
		);
	}

	static async create(input: CreatePerDiemShiftInput) {
		return ApiClient.post(`${PER_DIEM_SHIFTS_API_URL}`, input);
	}

	static async cancel(shiftId: string, input?: { reason?: string }) {
		return ApiClient.patch<{ success: true }>(
			`${PER_DIEM_SHIFTS_API_URL}/${shiftId}/cancel`,
			input ?? {},
		);
	}

	static async listVendorAvailable(
		params: VendorPerDiemShiftsQueryParams,
	): Promise<VendorPerDiemShiftsListResponse> {
		return ApiClient.get<VendorPerDiemShiftsListResponse>(
			`${PER_DIEM_SHIFT_ASSIGNMENT_API_URL}/vendor/available`,
			params as Record<string, unknown>,
		);
	}

	static async listVendorAssigned(
		params: VendorPerDiemShiftsQueryParams,
	): Promise<VendorPerDiemShiftsListResponse> {
		return ApiClient.get<VendorPerDiemShiftsListResponse>(
			`${PER_DIEM_SHIFT_ASSIGNMENT_API_URL}/vendor/assigned`,
			params as Record<string, unknown>,
		);
	}

	static async getVendorShiftMetrics(): Promise<VendorShiftClaimingMetrics> {
		return ApiClient.get<VendorShiftClaimingMetrics>(
			`${PER_DIEM_SHIFT_ASSIGNMENT_API_URL}/vendor/metrics`,
		);
	}

	static async listVendorAssignableCandidates(
		shiftId: string,
	): Promise<VendorAssignableCandidatesResponse> {
		return ApiClient.get<VendorAssignableCandidatesResponse>(
			`${PER_DIEM_SHIFT_ASSIGNMENT_API_URL}/vendor/${shiftId}/assignable-candidates`,
		);
	}

	static async assignShiftToCandidate(
		shiftId: string,
		candidateId: string,
	): Promise<{ success: boolean }> {
		return ApiClient.post<{ success: boolean }>(
			`${PER_DIEM_SHIFT_ASSIGNMENT_API_URL}/vendor/${shiftId}/assign`,
			{ candidateId },
		);
	}

	static async submitVendorAssignmentTimecard(
		assignmentId: string,
		payload: SubmitShiftTimecardPayload,
	): Promise<SubmitShiftTimecardResult> {
		return ApiClient.put<SubmitShiftTimecardResult>(
			`${PER_DIEM_SHIFT_TIMECARDS_API_URL}/vendor/${assignmentId}/timecard`,
			payload,
		);
	}
}
