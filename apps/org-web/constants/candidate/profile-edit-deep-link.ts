/** Query-driven profile edit flow: `/profile?edit=…` (consumed on load). */

export type ProfessionalProfileFocus =
	| "occupation"
	| "specialties"
	| "locations"
	| "shifts";

export type CandidateProfileEditIntent =
	| { edit: "contact" }
	| { edit: "professional"; focus: ProfessionalProfileFocus }
	| { edit: "resume" };

const PROFESSIONAL_FOCUS_VALUES = [
	"occupation",
	"specialties",
	"locations",
	"shifts",
] as const satisfies readonly ProfessionalProfileFocus[];

export function parseProfileEditIntent(
	searchParams: Pick<URLSearchParams, "get">,
): CandidateProfileEditIntent | null {
	const edit = searchParams.get("edit");
	if (edit === "contact") return { edit: "contact" };
	if (edit === "resume") return { edit: "resume" };
	if (edit === "professional") {
		const raw = searchParams.get("focus");
		const focus =
			raw && (PROFESSIONAL_FOCUS_VALUES as readonly string[]).includes(raw)
				? (raw as ProfessionalProfileFocus)
				: "occupation";
		return { edit: "professional", focus };
	}
	return null;
}

/** Hrefs for “Fix now” from submission-ready / tier-1 gaps */
export const candidateProfileFixHref = {
	contact: "/profile?edit=contact",
	resume: "/profile?edit=resume",
	professional: (focus: ProfessionalProfileFocus) =>
		`/profile?edit=professional&focus=${focus}`,
} as const;
