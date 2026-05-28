import {
	DEFAULT_TIMEZONE,
	formatTzShortDate,
	formatUsdPerHour,
	VendorCandidateJobBoardMatchTier,
} from "@repo/shared";
import type {
	VendorRequisitionCandidateRow,
	VendorRequisitionDetail,
	VendorRequisitionListItem,
} from "@/services/vendor-requisitions.service";
import type { VendorCandidateListRow } from "@/types/vendor-candidates";
import type { Candidate, Requisition } from "@/types/vendor-jobs-board";
import { parseVendorRequisitionSubmissionStage } from "@/utils/vendor-job-board-candidate-status";

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

export type VendorRequisitionShortDateFormatter = (
	d: Date | string | null | undefined,
) => string;

function formatDateDefaultTz(d: Date | string | null | undefined): string {
	return formatTzShortDate(d, DEFAULT_TIMEZONE);
}

function formatOpenings(
	item: VendorRequisitionListItem | VendorRequisitionDetail,
): string {
	const open = item.numberOfPositions - item.positionsFilled;
	if (open <= 0) return "Filled";
	return `${open} open (${item.positionsFilled}/${item.numberOfPositions} filled)`;
}

export function mapListItemToRequisition(
	item: VendorRequisitionListItem,
	formatShortDate: VendorRequisitionShortDateFormatter = formatDateDefaultTz,
): Requisition {
	const occupation = item.organizationOccupation?.occupation.name ?? "—";
	const occupationId = item.organizationOccupation?.occupation.id ?? null;
	const specialtyNames = item.requisitionSpecialties.map(
		(s) => s.organizationSpecialty.specialty.name,
	);
	const specialty = specialtyNames.length > 0 ? specialtyNames.join(", ") : "—";
	const specialtyIds = item.requisitionSpecialties.map(
		(s) => s.organizationSpecialty.specialty.id,
	);

	return {
		id: item.id,
		title: item.jobTitle?.trim() || "—",
		hospital: item.organization.name,
		location: formatLocation(item.location),
		shift: formatShift(item),
		department: item.unitName?.trim() || item.department?.name || "—",
		vendorRate: formatUsdPerHour(item.billRate),
		duration: formatDurationWeeks(item.lengthWeeks),
		startDate: formatShortDate(item.startDate),
		openings: formatOpenings(item),
		occupation,
		occupationId,
		specialty,
		specialtyIds,
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
	formatShortDate: VendorRequisitionShortDateFormatter = formatDateDefaultTz,
): Requisition {
	const base = mapListItemToRequisition(detail, formatShortDate);
	const criteria = detail.acceptanceCriteria ?? [];
	const checklistItems = detail.complianceChecklist?.items ?? [];
	const requirements = (criteria.length > 0 ? criteria : checklistItems).map(
		(a: { complianceListItem: { name: string } }) => a.complianceListItem.name,
	);
	const jobSummary = detail.jobSummary?.trim() || "";
	return {
		...base,
		requirements,
		jobSummary,
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
		status: row.status,
		role: row.occupationName !== "—" ? row.occupationName : row.specialty,
		location: row.locationLine,
		experience: row.experienceBandLabel,
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
		tags: row.tags,
		compliance: [],
	};
}

export function mapCandidateRowToCandidate(
	row: VendorRequisitionCandidateRow,
): Candidate {
	const submissionKey = parseVendorRequisitionSubmissionStage(
		row.submissionStage,
	);
	const status =
		submissionKey ??
		(row.matchScore >= 80
			? VendorCandidateJobBoardMatchTier.STRONG
			: row.matchScore >= 60
				? VendorCandidateJobBoardMatchTier.GOOD
				: VendorCandidateJobBoardMatchTier.REVIEW);

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
		tags: row.tags,
		compliance: [],
	};
}
