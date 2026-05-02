import type { CandidateShiftListItem } from "@/types/candidate-shifts";
import type { ClaimableShift } from "@/types/vendor-claim-shifts";

export function claimableShiftToCandidateShiftListItem(
	shift: ClaimableShift,
): CandidateShiftListItem {
	const rateMatch = shift.billRate.match(/[\d.]+/);
	const ratePerHour = rateMatch ? Number.parseFloat(rateMatch[0]) : 0;
	const durationMatch = shift.duration.match(/[\d.]+/);
	const totalHours = durationMatch ? Number.parseFloat(durationMatch[0]) : 0;

	return {
		id: shift.id,
		title: shift.role,
		status: "IN_PROGRESS",
		date: shift.date,
		startTime: shift.startTime,
		endTime: shift.endTime,
		totalHours,
		ratePerHour,
		occupation: shift.role,
		specialty: shift.requirements[0] ?? null,
		department: null,
		location: `${shift.location.city}, ${shift.location.state}`,
		isUrgent: shift.urgency === "High",
		isClaimed: true,
		shiftType: "",
		savedActualStartTime: shift.savedActualStartTime,
		savedActualEndTime: shift.savedActualEndTime,
		savedBreakMinutes: shift.savedBreakMinutes,
		savedTimecardSegments: shift.savedTimecardSegments,
		timecardNotes: shift.timecardNotes,
		timecardStatus: shift.timecardStatus,
	};
}
