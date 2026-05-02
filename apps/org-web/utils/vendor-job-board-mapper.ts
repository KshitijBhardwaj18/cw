import type {
	VendorRequisitionCandidateRow,
	VendorRequisitionDetail,
	VendorRequisitionListItem,
} from "@/services/vendor-requisitions.service";
import type { VendorCandidateListRow } from "@/types/vendor-candidates";
import type { Candidate, Requisition } from "@/types/vendor-jobs-board";

function formatUsdPerHour(rate: number | null | undefined): string {
	if (rate == null || Number.isNaN(rate)) return "—";
	return `$${rate.toFixed(2)}/hr`;
}

function formatLocation(loc: VendorRequisitionListItem["location"]): string {
	if (!loc) return "—";
	const cityState = [loc.city, loc.state].filter(Boolean).join(", ");
	return [loc.name, cityState].filter(Boolean).join(" · ") || "—";
}

function formatShift(
	item: VendorRequisitionListItem | VendorRequisitionDetail,
): string {
	const parts: string[] = [];
	if (item.shiftType) parts.push(String(item.shiftType).replaceAll("_", " "));
	if (item.startTime && item.endTime) {
		parts.push(`${item.startTime}–${item.endTime}`);
	}
	if (item.shiftHours != null) {
		parts.push(`${item.shiftHours}h`);
	}
	return parts.length > 0 ? parts.join(" · ") : "—";
}

function formatDurationWeeks(weeks: number | null | undefined): string {
	if (weeks == null) return "—";
	return `${weeks} week${weeks === 1 ? "" : "s"}`;
}

function formatDate(d: Date | string | null | undefined): string {
	if (d == null) return "—";
	const date = d instanceof Date ? d : new Date(d);
	if (Number.isNaN(date.getTime())) return "—";
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function formatOpenings(
	item: VendorRequisitionListItem | VendorRequisitionDetail,
): string {
	const open = item.numberOfPositions - item.positionsFilled;
	if (open <= 0) return "Filled";
	return `${open} open (${item.positionsFilled}/${item.numberOfPositions} filled)`;
}

function humanizeSubmissionStage(stage: string): string {
	return stage
		.replaceAll("_", " ")
		.toLowerCase()
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function mapListItemToRequisition(
	item: VendorRequisitionListItem,
): Requisition {
	const occupation = item.organizationOccupation?.occupation.name ?? "—";
	const specialty = item.organizationSpecialty?.specialty.name ?? "—";
	const requirements = item.jobSummary
		? item.jobSummary
				.split(/\n+/)
				.map((s) => s.trim())
				.filter(Boolean)
		: [];

	return {
		id: item.id,
		title: item.jobTitle?.trim() || "—",
		hospital: item.organization.name,
		location: formatLocation(item.location),
		shift: formatShift(item),
		department: item.unitName?.trim() || item.department?.name || "—",
		vendorRate: formatUsdPerHour(item.billRate),
		duration: formatDurationWeeks(item.lengthWeeks),
		startDate: formatDate(item.startDate),
		openings: formatOpenings(item),
		occupation,
		specialty,
		requirements,
		benefits: [],
		contractType: item.type?.replaceAll("_", " ") ?? "—",
		expectedWeeklyHours:
			item.shiftHours != null ? `${item.shiftHours * 5} hrs (est.)` : "—",
		shiftPattern: formatShift(item),
		startDateFlexibility: "—",
		savedByVendorUser: false,
	};
}

export function mapDetailToRequisition(
	detail: VendorRequisitionDetail,
): Requisition {
	const base = mapListItemToRequisition(detail);
	const requirements =
		detail.acceptanceCriteria?.map((a) => a.complianceListItem.name) ?? [];
	const jobSummaryBullets = detail.jobSummary
		? detail.jobSummary
				.split(/\n+/)
				.map((s) => s.trim())
				.filter(Boolean)
		: [];
	return {
		...base,
		requirements:
			jobSummaryBullets.length > 0 ? jobSummaryBullets : requirements,
		benefits: detail.benefitsPerks ?? [],
		expectedWeeklyHours:
			detail.hoursPerWeek != null
				? `${detail.hoursPerWeek} hrs/week`
				: base.expectedWeeklyHours,
		shiftPattern:
			detail.shiftsPerWeek != null
				? `${detail.shiftsPerWeek} shifts/wk · ${formatShift(detail)}`
				: base.shiftPattern,
		startDateFlexibility: "—",
		savedByVendorUser: detail.savedByVendorUser,
	};
}

export function mapVendorCandidateListRowToCandidate(
	row: VendorCandidateListRow,
): Candidate {
	return {
		id: row.id,
		name: row.name,
		status: row.status === "ACTIVE" ? "Active" : row.status,
		role: row.occupationName !== "—" ? row.occupationName : row.specialty,
		location: row.locationLine,
		experience: row.yearsExperienceLabel,
		availability: "—",
		matchScore: 0,
		email: row.email,
		phone: row.phone,
		specialty: row.specialty,
		occupation: row.occupationName,
		address: "—",
		preferredShifts: "—",
		ageRange: "—",
		availableStartDate: "",
		travelScope: "",
		yearsOfBirth: "",
		rnCertFirst: "",
		occupationalQuestionnaire: "",
		yearsOfExperienceUnitCare: "",
		experienceChemicalWound: "",
		experienceNeonatalICU: "",
		certificationPALS: "",
		summaryNote: "",
		skills: [],
		compliance: [],
	};
}

export function mapCandidateRowToCandidate(
	row: VendorRequisitionCandidateRow,
): Candidate {
	const status = row.submissionStage
		? humanizeSubmissionStage(row.submissionStage)
		: row.matchScore >= 80
			? "Strong match"
			: row.matchScore >= 60
				? "Good match"
				: "Review";

	return {
		id: row.id,
		name: row.name,
		status,
		role: row.role,
		location: row.location,
		experience: row.experience,
		availability: row.availability,
		matchScore: row.matchScore,
		email: row.email ?? undefined,
		specialty: row.specialty ?? "—",
		occupation: row.role,
		address: "—",
		preferredShifts: "—",
		ageRange: "—",
		availableStartDate: "",
		travelScope: "",
		yearsOfBirth: "",
		rnCertFirst: "",
		occupationalQuestionnaire: "",
		yearsOfExperienceUnitCare: "",
		experienceChemicalWound: "",
		experienceNeonatalICU: "",
		certificationPALS: "",
		summaryNote: "",
		skills: [],
		compliance: [],
	};
}
