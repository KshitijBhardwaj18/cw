export const CANDIDATE_JOB_SEARCH_PAGE_SIZE = 12;

/** URL query keys for matches / job search (candidate portal). Namespace avoids clashes with org routes. */
export const CANDIDATE_MATCHES_URL_KEYS = {
	search: "mjSearch",
	page: "mjPage",
	specialty: "mjSpecialty",
	location: "mjLocation",
	shiftType: "mjShift",
	contractType: "mjContract",
} as const;

export const SHIFT_TYPE_LABELS: Record<string, string> = {
	DAYS: "Days",
	EVENINGS: "Evenings",
	NIGHTS: "Nights",
	SWING: "Swing",
	ROTATING: "Rotating",
	WEEKENDS_ONLY: "Weekends Only",
	ON_CALL: "On Call",
};

export const CONTRACT_TYPE_LABELS: Record<string, string> = {
	LONG_TERM_ORDER: "Long-term",
	PER_DIEM: "Per Diem",
	PERMANENT_ROLE: "Permanent",
	INTERNAL_FLEX_POOL: "Internal Flex Pool",
};

export function getShiftTypeLabel(shiftType: string | null): string {
	if (!shiftType) return "—";
	return SHIFT_TYPE_LABELS[shiftType] ?? shiftType;
}

export function getContractTypeLabel(contractType: string | null): string {
	if (!contractType) return "—";
	return CONTRACT_TYPE_LABELS[contractType] ?? contractType;
}

export function buildShiftTypeOptions(shiftTypes: string[]) {
	return shiftTypes.map((s) => ({
		value: s,
		label: SHIFT_TYPE_LABELS[s] ?? s,
	}));
}

export function buildContractTypeOptions(contractTypes: string[]) {
	return contractTypes.map((c) => ({
		value: c,
		label: CONTRACT_TYPE_LABELS[c] ?? c,
	}));
}

export function buildLocationOptions(
	locations: { id: string; name: string; city: string; state: string }[],
) {
	return locations.map((l) => ({
		value: l.id,
		label: `${l.name} · ${l.city}, ${l.state}`,
	}));
}

export function buildSpecialtyOptions(
	specialties: { id: string; name: string }[],
) {
	return specialties.map((s) => ({ value: s.id, label: s.name }));
}
