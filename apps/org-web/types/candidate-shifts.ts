export type CandidateShiftStatus =
	| "OPEN"
	| "IN_PROGRESS"
	| "COMPLETED"
	| "CANCELLED"
	| "EXPIRED";

export type CandidateWorkerType = "internal" | "vendor";

export interface CandidateShiftListItem {
	id: string;
	title: string;
	status: CandidateShiftStatus;
	date: string;
	startTime: string;
	endTime: string;
	totalHours: number;
	ratePerHour: number;
	occupation: string;
	specialty: string | null;
	department: string | null;
	location: string;
	isUrgent: boolean;
	isClaimed: boolean;
	shiftType: string;
	savedActualStartTime?: string | null;
	savedActualEndTime?: string | null;
	savedBreakMinutes?: number | null;
	savedTimecardSegments?: ShiftTimecardSegment[] | null;
	timecardNotes?: string | null;
	timecardStatus?: "draft" | "submitted" | null;
}

export interface ShiftTimecardSegment {
	workDate: string;
	isOvertime: boolean;
	start: string;
	end: string;
	breakMin: number;
}

export interface CandidateShiftsListResponse {
	data: CandidateShiftListItem[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface CandidateShiftCounts {
	available: number;
	myShifts: number;
	active: number;
	completed: number;
	isInternal: boolean;
}

export interface CandidateShiftsCalendarResponse {
	shifts: CandidateShiftListItem[];
}

export interface SubmitShiftTimecardPayload {
	entries: ShiftTimecardSegment[];
	notes?: string;
	submit?: boolean;
}

export interface SubmitShiftTimecardResult {
	success: boolean;
	actualHours: number;
	status: "draft" | "submitted";
}
