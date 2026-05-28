export type CandidatePlacementKind = "active" | "upcoming" | "past";

export interface CandidatePlacementListItem {
	id: string;
	kind: CandidatePlacementKind;
	jobTitle: string;
	employerName: string;
	locationLabel: string;
	/** Legacy server-built label; may contain ISO. Prefer {@link startDate}/{@link endDate} + user TZ formatters. */
	dateLabel: string;
	/** Assignment start (ISO); omit or null on older API responses */
	startDate?: string | null;
	/** Assignment end (ISO); omit or null on older API responses */
	endDate?: string | null;
	/** Active placements only — e.g. "Night Shift (7PM - 7AM)" */
	shiftLabel?: string;
	/** Upcoming: show inner onboarding banner when set (0–100) */
	onboardingPercent?: number;
}

export type CandidatePlacementListGrouped = {
	active: CandidatePlacementListItem[];
	upcoming: CandidatePlacementListItem[];
	past: CandidatePlacementListItem[];
	isInternal: boolean;
};
