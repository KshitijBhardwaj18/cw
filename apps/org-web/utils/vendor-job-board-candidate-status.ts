import {
	SubmissionStage,
	VENDOR_CANDIDATE_PORTAL_STATUS_OPTIONS,
	VendorCandidateJobBoardMatchTier,
	VendorCandidatePortalStatus,
} from "@repo/shared";
import type { SubmissionStageKey } from "@/constants/submissions";
import { SUBMISSION_STAGE_TABS } from "@/constants/submissions";
import type { VendorJobBoardCandidateStatus } from "@/types/vendor-jobs-board";

/** Exhaustive label map — TypeScript errors if any VendorJobBoardCandidateStatus member is missing. */
const STATUS_LABEL: Record<VendorJobBoardCandidateStatus, string> = {
	// Portal lifecycle
	[VendorCandidatePortalStatus.ACTIVE]:
		VENDOR_CANDIDATE_PORTAL_STATUS_OPTIONS[0].label,
	[VendorCandidatePortalStatus.ONBOARDING]:
		VENDOR_CANDIDATE_PORTAL_STATUS_OPTIONS[1].label,
	[VendorCandidatePortalStatus.INACTIVE]:
		VENDOR_CANDIDATE_PORTAL_STATUS_OPTIONS[2].label,
	// Match tier
	[VendorCandidateJobBoardMatchTier.STRONG]: "Strong match",
	[VendorCandidateJobBoardMatchTier.GOOD]: "Good match",
	[VendorCandidateJobBoardMatchTier.REVIEW]: "Review",
	// Submission stages (labels mirror SUBMISSION_STAGE_OPTIONS in @repo/shared)
	[SubmissionStage.SUBMITTED]: "Submitted",
	[SubmissionStage.QUALIFIED]: "Qualified",
	[SubmissionStage.SHORTLISTED]: "Shortlisted",
	[SubmissionStage.INTERVIEW_SCHEDULED]: "Interview Scheduled",
	[SubmissionStage.INTERVIEW_COMPLETED]: "Interview Completed",
	[SubmissionStage.OFFERED]: "Offer",
	[SubmissionStage.ACCEPTED]: "Accepted",
	[SubmissionStage.WITHDRAWN]: "Withdrawn",
	[SubmissionStage.REJECTED]: "Rejected",
};

/** Human-readable label for job-board candidate cards, match card, and dialogs. */
export function formatVendorJobBoardCandidateStatus(
	status: VendorJobBoardCandidateStatus,
): string {
	return STATUS_LABEL[status];
}

export function vendorJobBoardCandidateStatusBadgeVariant(
	status: VendorJobBoardCandidateStatus,
): "success" | "info" | "warning" {
	switch (status) {
		case VendorCandidatePortalStatus.ACTIVE:
		case VendorCandidateJobBoardMatchTier.STRONG:
		case SubmissionStage.SHORTLISTED:
		case SubmissionStage.ACCEPTED:
			return "success";
		case VendorCandidatePortalStatus.ONBOARDING:
		case VendorCandidateJobBoardMatchTier.GOOD:
		case SubmissionStage.SUBMITTED:
		case SubmissionStage.QUALIFIED:
		case SubmissionStage.INTERVIEW_SCHEDULED:
		case SubmissionStage.INTERVIEW_COMPLETED:
		case SubmissionStage.OFFERED:
			return "info";
		default:
			return "warning";
	}
}

function isSubmissionStageKey(raw: string): raw is SubmissionStageKey {
	return SUBMISSION_STAGE_TABS.some((t) => t.stage === raw);
}

export function parseVendorRequisitionSubmissionStage(
	raw: string | undefined,
): SubmissionStageKey | undefined {
	if (!raw || !isSubmissionStageKey(raw)) return undefined;
	return raw;
}
