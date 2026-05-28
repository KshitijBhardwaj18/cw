import { getLabel } from "@repo/shared";
import { SHIFT_TYPE_OPTIONS, SHIFT_TYPE_VALUES } from "@/constants/shifts";

export const CANDIDATE_JOB_SEARCH_DEFAULT_LIMIT = 12;
export const CANDIDATE_JOB_SEARCH_PAGE_SIZE_OPTIONS = [6, 12, 18, 24];

/** URL query keys for matches / job search (candidate portal). Namespace avoids clashes with org routes. */
export const CANDIDATE_MATCHES_URL_KEYS = {
	search: "mjSearch",
	page: "mjPage",
	limit: "mjLimit",
	specialty: "mjSpecialty",
	location: "mjLocation",
	shiftType: "mjShift",
	contractType: "mjContract",
	tab: "mjTab",
} as const;

export const CANDIDATE_MATCHES_TABS = ["all", "saved"] as const;
export type CandidateMatchesTab = (typeof CANDIDATE_MATCHES_TABS)[number];

/** All Prisma `ShiftType` values — for filters and option keys. */
export const CANDIDATE_MATCHES_SHIFT_TYPE_ORDER = [...SHIFT_TYPE_VALUES];

export const CONTRACT_TYPE_LABELS: Record<string, string> = {
	LONG_TERM_ORDER: "Long-term",
	PER_DIEM: "Per Diem",
	PERMANENT_ROLE: "Permanent",
	INTERNAL_FLEX_POOL: "Internal Flex Pool",
};

export function getShiftTypeLabel(shiftType: string | null): string {
	if (!shiftType) return "—";
	return getLabel(SHIFT_TYPE_OPTIONS, shiftType);
}

export function getContractTypeLabel(contractType: string | null): string {
	if (!contractType) return "—";
	return CONTRACT_TYPE_LABELS[contractType] ?? contractType;
}

export function buildShiftTypeOptions(shiftTypes: string[]) {
	return shiftTypes.map((s) => ({
		value: s,
		label: getLabel(SHIFT_TYPE_OPTIONS, s),
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
