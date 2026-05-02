import type { ReviewSubmitFormValues } from "@/schemas/vendor-jobs-board.schema";
import type { Candidate } from "@/types/vendor-jobs-board";

/** Response from GET /api/vendor/candidates/job-board-profile/:id */
export type VendorCandidateJobBoardProfile = {
	id: string;
	occupationId: string;
	specialtyIds: string[];
	user: { name: string; email: string; phoneNumber: string };
	occupationName: string;
	specialtiesLabel: string;
	streetAddress: string | null;
	city: string | null;
	state: string | null;
	zipCode: string | null;
	yearsOfExperience: number | null;
	preferredShiftTypes: string[];
	availableFrom: string | null;
	isAvailable: boolean;
	skills: string[];
	bio: string | null;
	questionnaire: {
		questionId: string;
		questionText: string;
		value: string;
		scope: "occupation" | "specialty" | "general";
	}[];
	compliance: { name: string; status: "verified" | "expired" | "missing" }[];
	/** Persisted RTO draft (same shape as submission `rtos`). */
	rtos: { startDate: string; endDate?: string; label: string }[];
};

export function mapJobBoardProfileToReviewFormValues(
	p: VendorCandidateJobBoardProfile,
	fallbacks?: { email?: string; phone?: string },
): ReviewSubmitFormValues {
	const fullName = p.user.name.trim();
	const parts = fullName.split(/\s+/).filter(Boolean);
	const firstName = parts[0] ?? "";
	const lastName = parts.length > 1 ? parts.slice(1).join(" ") : "";

	const streetAddress = p.streetAddress?.trim() || "";
	const city = p.city?.trim() || "";
	const state = p.state?.trim() || "";
	const zipCode = p.zipCode?.trim() || "";

	const preferredShiftsText =
		p.preferredShiftTypes.length > 0
			? p.preferredShiftTypes.join(", ")
			: "Not specified";

	const email =
		p.user.email.trim() || fallbacks?.email?.trim() || "unknown@example.com";
	const phoneNumber =
		p.user.phoneNumber.trim() || fallbacks?.phone?.trim() || "";

	const availableFrom =
		p.availableFrom && !Number.isNaN(Date.parse(p.availableFrom))
			? p.availableFrom.slice(0, 10)
			: "";

	const rtoForm = (p.rtos ?? []).map((r) => {
		const start = r.startDate.slice(0, 10);
		const endRaw = r.endDate?.trim();
		const end = endRaw ? endRaw.slice(0, 10) : "";
		const isRange = Boolean(end && end !== start);
		return {
			startDate: start,
			endDate: isRange ? end : undefined,
			type: isRange ? ("range" as const) : ("single" as const),
		};
	});

	return {
		firstName,
		lastName,
		email,
		phoneNumber,
		streetAddress,
		city,
		state,
		zipCode,
		occupationId: p.occupationId,
		specialtyIds: p.specialtyIds.length > 0 ? p.specialtyIds : ([] as string[]),
		preferredShiftsText,
		availableFrom,
		isAvailable: p.isAvailable,
		questionnaire: p.questionnaire.map((q) => ({ ...q })),
		summaryNote: p.bio?.trim() ?? "",
		rto: rtoForm,
		complianceItems: p.compliance.map((c) => ({
			name: c.name,
			status: c.status,
			file: undefined,
		})),
	};
}

/** Merge API profile with list-row candidate for dialogs (match score, status from row). */
export function mergeJobBoardProfileIntoCandidate(
	row: Candidate,
	profile: VendorCandidateJobBoardProfile | undefined,
): Candidate {
	if (!profile) {
		return row;
	}
	const loc = [profile.city, profile.state].filter(Boolean).join(", ") || "—";
	const availability = profile.availableFrom
		? `From ${new Date(profile.availableFrom).toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric",
			})}`
		: profile.isAvailable
			? "Available"
			: row.availability;

	return {
		...row,
		name: profile.user.name.trim() || row.name,
		email: profile.user.email || row.email,
		phone: profile.user.phoneNumber || row.phone,
		role: profile.occupationName,
		occupation: profile.occupationName,
		specialty: profile.specialtiesLabel,
		location: loc,
		experience:
			profile.yearsOfExperience != null
				? `${profile.yearsOfExperience} yrs`
				: row.experience,
		availability,
		skills: profile.skills.length > 0 ? profile.skills : row.skills,
		address: [
			profile.streetAddress,
			profile.city,
			profile.state,
			profile.zipCode,
		]
			.filter(Boolean)
			.join(", "),
		preferredShifts: profile.preferredShiftTypes.join(", "),
		availableStartDate: availability,
		occupationalQuestionnaire: profile.questionnaire
			.map((q) => `${q.questionText}: ${q.value}`)
			.join("\n"),
		summaryNote: profile.bio?.trim() ?? row.summaryNote,
		compliance: profile.compliance.map((c) => ({
			name: c.name,
			status:
				c.status === "verified"
					? "Approved"
					: c.status === "expired"
						? "Expired"
						: ("Pending" as const),
		})),
	};
}

export type VendorCandidateJobBoardPatchBody = {
	phoneNumber?: string;
	streetAddress?: string;
	city?: string;
	state?: string;
	zipCode?: string;
	occupationId?: string;
	specialtyIds?: string[];
	preferredShiftTypes?: string[];
	availableFrom?: string | null;
	isAvailable?: boolean;
	bio?: string;
	questionnaireResponses?: { questionId: string; value: string }[];
	rtos?: { startDate: string; endDate?: string; label: string }[];
};

export function reviewFormValuesToPatchBody(
	value: ReviewSubmitFormValues,
): VendorCandidateJobBoardPatchBody {
	const preferredShiftTypes = value.preferredShiftsText
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);

	return {
		phoneNumber: value.phoneNumber.trim() || undefined,
		streetAddress: value.streetAddress.trim() || undefined,
		city: value.city.trim() || undefined,
		state: value.state.trim() || undefined,
		zipCode: value.zipCode.trim() || undefined,
		occupationId: value.occupationId,
		specialtyIds: value.specialtyIds,
		preferredShiftTypes,
		availableFrom: value.availableFrom?.trim()
			? value.availableFrom.trim()
			: null,
		isAvailable: value.isAvailable,
		bio: value.summaryNote.trim() ? value.summaryNote.trim() : undefined,
		questionnaireResponses: value.questionnaire.map((q) => ({
			questionId: q.questionId,
			value: q.value,
		})),
		rtos: value.rto
			.filter((r) => r.startDate?.trim())
			.map((r) => ({
				startDate: r.startDate,
				endDate: r.endDate?.trim() ? r.endDate : undefined,
				label: r.type === "range" ? "Date range" : "Start preference",
			})),
	};
}
