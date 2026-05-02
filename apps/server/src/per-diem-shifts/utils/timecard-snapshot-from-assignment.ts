export type TimesheetEntryForShiftList = {
	workDate: Date;
	clockIn: string | null;
	clockOut: string | null;
	breakMinutes: number;
	regularHours: number;
	overtimeHours: number;
	hours: number | null;
};

export type SavedTimecardSegment = {
	workDate: string;
	isOvertime: boolean;
	start: string;
	end: string;
	breakMin: number;
};

export function mapTimesheetEntriesToSavedSegments(
	entries: TimesheetEntryForShiftList[],
): SavedTimecardSegment[] | null {
	if (!entries.length) return null;
	const mapped = entries.map((e) => {
		const iso = e.workDate.toISOString().slice(0, 10);
		const reg = e.regularHours ?? 0;
		const ot = e.overtimeHours ?? 0;
		const isOvertime = ot > 0 && Math.abs(reg) < 1e-6;
		return {
			workDate: iso,
			isOvertime,
			start: e.clockIn ?? "",
			end: e.clockOut ?? "",
			breakMin: e.breakMinutes,
		};
	});
	mapped.sort((a, b) => Number(a.isOvertime) - Number(b.isOvertime));
	return mapped;
}

export function buildTimecardSnapshotFromAssignment(
	assignment:
		| {
				status: string;
				candidateFeedback: string | null;
				timesheet: {
					entries: TimesheetEntryForShiftList[];
				} | null;
		  }
		| null
		| undefined,
): {
	savedActualStartTime: string | null;
	savedActualEndTime: string | null;
	savedBreakMinutes: number | null;
	savedTimecardSegments: SavedTimecardSegment[] | null;
	timecardNotes: string | null;
	timecardStatus: "draft" | "submitted" | null;
} {
	if (!assignment) {
		return {
			savedActualStartTime: null,
			savedActualEndTime: null,
			savedBreakMinutes: null,
			savedTimecardSegments: null,
			timecardNotes: null,
			timecardStatus: null,
		};
	}

	const savedTimecardSegments = assignment.timesheet?.entries?.length
		? mapTimesheetEntriesToSavedSegments(assignment.timesheet.entries)
		: null;
	const regularSeg = savedTimecardSegments?.find((s) => !s.isOvertime);

	const timecardStatus =
		assignment.status === "draft" || assignment.status === "submitted"
			? (assignment.status as "draft" | "submitted")
			: null;

	return {
		savedActualStartTime: regularSeg?.start ? regularSeg.start : null,
		savedActualEndTime: regularSeg?.end ? regularSeg.end : null,
		savedBreakMinutes: regularSeg != null ? regularSeg.breakMin : null,
		savedTimecardSegments,
		timecardNotes: assignment.candidateFeedback ?? null,
		timecardStatus,
	};
}
