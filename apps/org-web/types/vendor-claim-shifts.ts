import type { ShiftTimecardSegment } from "./candidate-shifts";

export interface ClaimableShift {
	id: string;
	role: string;
	urgency: "High" | "Medium" | "Low";
	facilityName: string;
	location: { city: string; state: string };
	requirements: string[];
	date: string;
	startTime: string;
	endTime: string;
	duration: string;
	billRate: string;
	openings: number;
	assignmentId?: string;
	savedActualStartTime?: string | null;
	savedActualEndTime?: string | null;
	savedBreakMinutes?: number | null;
	savedTimecardSegments?: ShiftTimecardSegment[] | null;
	timecardNotes?: string | null;
	timecardStatus?: "draft" | "submitted" | null;
}

export interface QualifiedCandidate {
	id: string;
	name: string;
	role: string;
	initials: string;
}
