import { getShiftTypeLabel } from "@/constants/candidate/matches-and-job-search";
import type { CandidateMatchListItem } from "@/types/candidate-matches";

export function formatMatchPayLabel(job: CandidateMatchListItem): string {
	if (job.incentiveType && job.incentiveAmount != null) {
		return `${job.incentiveType}: $${job.incentiveAmount.toLocaleString()}`;
	}
	if (job.billRate != null) {
		return `$${job.billRate}/hr`;
	}
	return "—";
}

export function formatMatchShiftLabel(job: CandidateMatchListItem): string {
	if (job.shiftType) {
		const label = getShiftTypeLabel(job.shiftType);
		return job.shiftHours ? `${label} (${job.shiftHours})` : label;
	}
	if (job.shiftHours) {
		return job.shiftHours;
	}
	return "Shift TBD";
}

export function formatMatchFacilityLabel(job: CandidateMatchListItem): string {
	const location =
		job.locationCity && job.locationState
			? `${job.locationCity}, ${job.locationState}`
			: null;
	if (job.facilityName && location) {
		return `${job.facilityName} · ${location}`;
	}
	return job.facilityName ?? location ?? "Location TBD";
}
