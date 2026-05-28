export type CandidatePlacementsListTab = "active" | "upcoming" | "past";

export function candidatePlacementsListPath(
	tab?: CandidatePlacementsListTab,
): string {
	if (!tab || tab === "active") return "/placements";
	return `/placements?cpPlTab=${tab}`;
}

export function candidateProfilePath(): string {
	return "/profile";
}

export function candidatePlacementDetailPath(placementId: string): string {
	return `/placements/${placementId}`;
}

export function candidatePlacementTimecardPath(placementId: string): string {
	return `/placements/${placementId}/timecard`;
}

export function candidatePlacementTimecardDetailPath(
	placementId: string,
	timecardId: string,
): string {
	return `/placements/${placementId}/timecard/${timecardId}`;
}
