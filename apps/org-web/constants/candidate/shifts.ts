export const CANDIDATE_SHIFTS_TABS = {
	AVAILABLE: "available-shifts",
	MY_SHIFTS: "my-shifts",
	MY_CALENDAR: "my-calendar",
} as const;

export const CANDIDATE_SHIFTS_COPY = {
	pageTitle: "Shift Marketplace",
	pageDescription: "Browse and claim available per diem shifts",
	searchPlaceholder: "Search shifts",
	noAvailableShifts: "No available shifts match your filters.",
	noMyShifts: "You have no active shifts.",
	noMyShiftsInternal: "Claim shifts from the Available Shifts tab.",
	noMyShiftsVendor:
		"Mark interest in shifts from the Available Shifts tab and wait for vendor approval.",
	claimSuccess: "Shift claimed successfully",
	claimError: "Failed to claim shift",
} as const;
