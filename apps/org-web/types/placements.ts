/** Row lifecycle for metrics and tab filtering. */
export type PlacementListStatus =
	| "upcoming"
	| "active"
	| "ending_soon"
	| "completed";

/** Primary placement list tabs (counts shown on triggers). */
export type PlacementTabValue = "upcoming" | "active" | "completed";

export interface PlacementListMockRow {
	id: string;
	displayId: string;
	candidateName: string;
	jobTitle: string;
	location: string;
	department: string;
	startDate: string;
	endDate: string;
	durationWeeks: number;
	/** USD per hour (vendor bill rate). */
	vendorRatePerHour: number;
	status: PlacementListStatus;
	/** When set, shown under end date in orange (e.g. ending soon). */
	daysRemaining?: number;
}

export interface PlacementMetricStats {
	totalPlacements: number;
	active: number;
	endingSoon: number;
	completed: number;
}

export interface PlacementTabCounts {
	upcoming: number;
	active: number;
	completed: number;
}
