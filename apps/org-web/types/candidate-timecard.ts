export type CandidateTimecardStatus = "approved" | "submitted" | "draft";

export interface CandidateTimecardListItem {
	id: string;
	jobTitle: string;
	weekEndingDate: string;
	totalHours: number;
	status: CandidateTimecardStatus;
	/** Secondary line under the row (e.g. "Approved on …", "Awaiting approval") */
	footerNote: string;
}

export interface CandidateTimecardPageData {
	placementId: string;
	/** Shown in the current-assignment hero, e.g. job + facility */
	assignmentTitle: string;
	currentWeekEnding: string;
	payCodes: Array<{
		id: string;
		code: string;
		description: string;
		multiplier?: number | null;
	}>;
	timecards: CandidateTimecardListItem[];
}

export interface CandidateTimecardDetailEntry {
	id: string;
	workDate: string;
	regularHours: number;
	overtimeHours: number;
	clockIn: string | null;
	clockOut: string | null;
	breakMinutes: number;
	notes: string | null;
	status: string;
	payCode: {
		id: string;
		code: string;
		description: string;
	} | null;
}

export interface CandidateTimecardDetail {
	id: string;
	placementId: string;
	assignmentTitle: string;
	weekEndingDate: string;
	notes: string;
	canEdit: boolean;
	payCodes: Array<{
		id: string;
		code: string;
		description: string;
		multiplier?: number | null;
	}>;
	entries: CandidateTimecardDetailEntry[];
}

export interface UpsertCandidateTimecardPayload {
	weekEndingDate: string;
	notes?: string;
	submit: boolean;
	entries: Array<{
		workDate: string;
		isOvertime: boolean;
		start: string;
		end: string;
		breakMin: number;
		payCodeId?: string;
	}>;
}

export interface UpsertCandidateTimecardResult {
	timesheetId: string | null;
	submitted: boolean;
}
