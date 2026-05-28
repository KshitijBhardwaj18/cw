import {
	CANDIDATE_EXPERIENCE_BAND_OPTIONS,
	DEFAULT_TIMEZONE,
	formatTzShortDate,
	getLabel,
	type ShiftType,
} from "@repo/shared";
import { SHIFT_TYPE_LABEL, SHIFT_TYPE_VALUES } from "@/constants/shifts";
import type {
	ReviewSubmitFormValues,
	VendorJobBoardShiftType,
} from "@/schemas/vendor-jobs-board.schema";
import type { CandidateExperienceBandValue } from "@/services/onboarding.service";
import type { Candidate } from "@/types/vendor-jobs-board";

function isShiftType(value: string): value is VendorJobBoardShiftType {
	return (SHIFT_TYPE_VALUES as readonly string[]).includes(value);
}

function experienceBandLabel(
	band: CandidateExperienceBandValue | null,
): string {
	if (band == null) return "—";
	return getLabel(CANDIDATE_EXPERIENCE_BAND_OPTIONS, band);
}

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
	experienceBand: CandidateExperienceBandValue | null;
	preferredShiftTypes: VendorJobBoardShiftType[];
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
	options: {
		email?: string;
		phone?: string;
		requirements?: string[];
	},
): ReviewSubmitFormValues {
	const fullName = p.user.name.trim();
	const parts = fullName.split(/\s+/).filter(Boolean);
	const firstName = parts[0] ?? "";
	const lastName = parts.length > 1 ? parts.slice(1).join(" ") : "";

	const streetAddress = p.streetAddress?.trim() || "";
	const city = p.city?.trim() || "";
	const state = p.state?.trim() || "";
	const zipCode = p.zipCode?.trim() || "";

	const email =
		p.user.email.trim() || options.email?.trim() || "unknown@example.com";
	const phoneNumber = p.user.phoneNumber.trim() || options.phone?.trim() || "";

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

	const requirements = options.requirements ?? [];
	const complianceItems = requirements.map((name) => {
		const existing = p.compliance.find(
			(c) => c.name.toLowerCase() === name.toLowerCase(),
		);
		return {
			name: existing?.name || name,
			status: existing?.status || "missing",
			file: undefined,
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
		preferredShiftTypes: p.preferredShiftTypes.map((s) => s as ShiftType),
		availableFrom,
		isAvailable: p.isAvailable,
		questionnaire: p.questionnaire.map((q) => ({ ...q })),
		summaryNote: p.bio?.trim() ?? "",
		rto: rtoForm,
		complianceItems,
	};
}

type MergeJobBoardProfileOpts = {
	fmtShortDate?: (iso: string | Date | null | undefined) => string;
};

/** Merge API profile with list-row candidate for dialogs (match score, status from row). */
export function mergeJobBoardProfileIntoCandidate(
	row: Candidate,
	profile: VendorCandidateJobBoardProfile | undefined,
	opts?: MergeJobBoardProfileOpts,
): Candidate {
	if (!profile) {
		return row;
	}
	const fmtShort =
		opts?.fmtShortDate ??
		((iso: string | Date | null | undefined) =>
			formatTzShortDate(iso, DEFAULT_TIMEZONE));
	const loc = [profile.city, profile.state].filter(Boolean).join(", ") || "—";
	const availability = profile.availableFrom
		? `From ${fmtShort(profile.availableFrom)}`
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
			profile.experienceBand != null
				? experienceBandLabel(profile.experienceBand)
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
		preferredShifts: profile.preferredShiftTypes
			.map((s) => SHIFT_TYPE_LABEL[s])
			.join(", "),
		availableStartDate: availability,
		occupationalQuestionnaire: profile.questionnaire
			.map((q) => `${q.questionText}: ${q.value}`)
			.join("\n"),
		summaryNote: profile.bio?.trim() ?? row.summaryNote,
		compliance: profile.compliance.map((c) => ({
			name: c.name,
			status:
				c.status === "verified"
					? "APPROVED"
					: c.status === "expired"
						? "EXPIRED"
						: "MISSING",
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
	preferredShiftTypes?: VendorJobBoardShiftType[];
	availableFrom?: string | null;
	isAvailable?: boolean;
	bio?: string;
	questionnaireResponses?: { questionId: string; value: string }[];
	rtos?: { startDate: string; endDate?: string; label: string }[];
};

export function reviewFormValuesToPatchBody(
	value: Omit<ReviewSubmitFormValues, "complianceItems">,
): VendorCandidateJobBoardPatchBody {
	const preferredShiftTypes = value.preferredShiftTypes.filter(isShiftType);

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
