import type { CandidateTimecardDetailEntry } from "@/types/candidate-timecard";

export function sumTimecardEntryHours(
	entries: CandidateTimecardDetailEntry[],
): number {
	return (
		Math.round(
			entries.reduce(
				(s, e) => s + (e.regularHours ?? 0) + (e.overtimeHours ?? 0),
				0,
			) * 100,
		) / 100
	);
}
