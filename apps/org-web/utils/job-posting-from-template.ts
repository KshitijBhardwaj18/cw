import type { JobPostingDetailsValues } from "@/schemas/job-posting-details.schema";
import type { JobPostingSubmissionValues } from "@/schemas/job-posting-submission.schema";
import type { RequisitionTemplateDetail } from "@/services/requisition-templates.service";

export function mapTemplateDetailToJobDetails(
	detail: RequisitionTemplateDetail,
	prev: JobPostingDetailsValues,
): JobPostingDetailsValues {
	const shiftHours = detail.shiftHours ?? 8;
	const shiftsPerWeek = detail.shiftsPerWeek ?? 1;
	const hours =
		detail.hoursPerWeek ?? Number((shiftHours * shiftsPerWeek).toFixed(2));
	return {
		...prev,
		requisitionName: detail.templateName,
		location: detail.locationId,
		department: detail.departmentId,
		unitName: detail.unitName ?? "",
		occupation: detail.organizationOccupationId,
		specialty: detail.organizationSpecialtyId ?? "",
		shiftType: (detail.shiftType ??
			prev.shiftType) as JobPostingDetailsValues["shiftType"],
		startDate: detail.startDate?.slice(0, 10) ?? prev.startDate,
		endDate: detail.endDate?.slice(0, 10) ?? prev.endDate,
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
		interviewRequired: detail.interviewRequired ?? undefined,
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
	if (detail.workflowType === "VENDOR_ONLY") submissionType = "VENDOR_ONLY";
	else if (detail.workflowType === "CANDIDATE_ONLY")
		submissionType = "CANDIDATE_ONLY";
	const vendorAccess =
		detail.whoCanSubmit === "selected_vendors"
			? "SELECTED_VENDORS"
			: "ALL_VENDORS";
	const phases = detail.complianceChecklistItemPhases ?? [];
	const acceptanceCriteriaIds = phases
		.filter((p) => p.phase === "SUBMISSION")
		.map((p) => p.complianceListItemId);
	return {
		submissionType,
		vendorAccess,
		notesForVendors: "",
		acceptanceCriteriaIds,
		selectedVendorIds: detail.templateVendors.map((v) => v.vendorId),
	};
}
