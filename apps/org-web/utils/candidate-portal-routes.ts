export function candidatePlacementsListPath(): string {
	return "/placements";
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
