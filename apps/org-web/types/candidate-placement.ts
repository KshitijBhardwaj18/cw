export type CandidatePlacementKind = "active" | "upcoming" | "past";

export interface CandidatePlacementListItem {
	id: string;
	kind: CandidatePlacementKind;
	jobTitle: string;
	employerName: string;
	locationLabel: string;
	/** Display string for dates, e.g. "2024-12-01 - 2025-03-01" or "Starts 2025-01-15" */
	dateLabel: string;
	/** Active placements only — e.g. "Night Shift (7PM - 7AM)" */
	shiftLabel?: string;
	/** Upcoming: show inner onboarding banner when set (0–100) */
	onboardingPercent?: number;
}

export type CandidatePlacementListGrouped = {
	active: CandidatePlacementListItem[];
	upcoming: CandidatePlacementListItem[];
	past: CandidatePlacementListItem[];
};
