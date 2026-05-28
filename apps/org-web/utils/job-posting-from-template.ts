import {
	ComplianceChecklistItemPhase,
	InterviewType,
	WorkflowType,
} from "@repo/shared";
import type { JobPostingDetailsValues } from "@/schemas/job-posting-details.schema";
import {
	type JobPostingSubmissionValues,
	normalizeJobPostingSubmissionVendorFields,
} from "@/schemas/job-posting-submission.schema";
import type { RequisitionTemplateDetail } from "@/services/requisition-templates.service";

/** Local-date `YYYY-MM-DD` (no UTC drift). Mirrors the helpers in the schema and constants. */
function relativeIsoDate(days = 0, baseIso?: string): string {
	const d = baseIso ? new Date(`${baseIso}T12:00:00`) : new Date();
	if (days !== 0) d.setDate(d.getDate() + days);
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
}

/** Pick the template's date if it's still today/future; otherwise fall back to today. */
function templateDateOrToday(
	templateDate: string | null | undefined,
	today: string,
): string {
	const value = templateDate?.slice(0, 10) ?? "";
	if (!value) return today;
	return value < today ? today : value;
}

export function mapTemplateDetailToJobDetails(
	detail: RequisitionTemplateDetail,
	prev: JobPostingDetailsValues,
): JobPostingDetailsValues {
	const shiftHours = detail.shiftHours ?? 8;
	const shiftsPerWeek = detail.shiftsPerWeek ?? 1;
	const hours =
		detail.hoursPerWeek ?? Number((shiftHours * shiftsPerWeek).toFixed(2));
	const today = relativeIsoDate();
	return {
		...prev,
		requisitionName: detail.templateName,
		location: detail.locationId,
		department: detail.departmentId,
		unitName: detail.unitName ?? "",
		occupation: detail.organizationOccupationId,
		specialty: detail.organizationSpecialtyIds,
		shiftType: (detail.shiftType ??
			prev.shiftType) as JobPostingDetailsValues["shiftType"],
		startDate:
			prev.startDate && prev.startDate.trim() !== ""
				? prev.startDate
				: templateDateOrToday(detail.startDate, today),
		endDate: (() => {
			const start =
				prev.startDate && prev.startDate.trim() !== ""
					? prev.startDate
					: templateDateOrToday(detail.startDate, today);
			const end =
				prev.endDate && prev.endDate.trim() !== ""
					? prev.endDate
					: templateDateOrToday(detail.endDate, today);
			if (end < start) {
				return start;
			}
			return end;
		})(),
		lengthWeeks: detail.lengthWeeks ?? prev.lengthWeeks,
		startTime: detail.startTime ?? prev.startTime,
		endTime: detail.endTime ?? prev.endTime,
		shiftHours,
		shiftsPerWeek,
		hoursPerWeek: hours,
		billRate:
			detail.billRate != null ? Math.round(detail.billRate) : prev.billRate,
		numberOfPositions: detail.numberOfPositions ?? prev.numberOfPositions,
		incentiveType: detail.incentiveType ?? "",
		incentiveAmount:
			detail.incentiveAmount != null
				? Math.round(detail.incentiveAmount)
				: undefined,
		interviewRequired:
			detail.interviewRequired ?? InterviewType.CLIENT_INTERVIEW,
		hiringManagerId: detail.hiringManagerId ?? prev.hiringManagerId,
		description: detail.jobDescription?.trim()
			? detail.jobDescription
			: prev.description,
		benefitsPerks:
			detail.benefitsPerks.length > 0
				? detail.benefitsPerks
				: prev.benefitsPerks,
		complianceTemplateId:
			detail.complianceChecklistId ?? prev.complianceTemplateId,
	};
}

export function mapTemplateDetailToSubmissionSettings(
	detail: RequisitionTemplateDetail,
): JobPostingSubmissionValues {
	let submissionType: JobPostingSubmissionValues["submissionType"] =
		"VENDOR_AND_CANDIDATE";
	if (detail.workflowType === WorkflowType.VENDOR_ONLY)
		submissionType = "VENDOR_ONLY";
	else if (detail.workflowType === WorkflowType.CANDIDATE_ONLY)
		submissionType = "CANDIDATE_ONLY";
	const vendorAccess =
		detail.whoCanSubmit === "selected_vendors"
			? "SELECTED_VENDORS"
			: "ALL_VENDORS";
	const phases = detail.complianceChecklistItemPhases ?? [];
	const acceptanceCriteriaIds = phases
		.filter((p) => p.phase === ComplianceChecklistItemPhase.SUBMISSION)
		.map((p) => p.complianceListItemId);
	return normalizeJobPostingSubmissionVendorFields({
		submissionType,
		vendorAccess,
		notesForVendors: "",
		acceptanceCriteriaIds,
		selectedVendorIds: detail.templateVendors.map((v) => v.vendorId),
	});
}
