import { formatUsdPerHour, formatUsdWhole } from "@repo/shared";
import { getShiftTypeLabel } from "@/constants/candidate/matches-and-job-search";
import type { CandidateMatchListItem } from "@/types/candidate-matches";

export function formatMatchPayLabel(job: CandidateMatchListItem): string {
	if (job.incentiveType && job.incentiveAmount != null) {
		return `${job.incentiveType}: ${formatUsdWhole(job.incentiveAmount)}`;
	}
	if (job.billRate != null) {
		return formatUsdPerHour(job.billRate);
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

export function formatMatchSpecialtyLabel(
	job: CandidateMatchListItem,
): string | null {
	if (!job.specialties || job.specialties.length === 0) return null;
	return job.specialties.map((s) => s.name).join(", ");
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
