import { formatDateOrPlaceholder, formatUsdPerHour } from "@repo/shared";
import {
	CANDIDATE_PORTAL_LABELS,
	type CandidatePortalLabels,
} from "@/constants/candidate/submissions-portal";
import type { SubmissionStageKey } from "@/constants/submissions";
import type {
	CandidateComplianceItemStatus,
	CandidateSubmissionDetail,
	SubmissionStatus,
} from "@/types/candidate-submission";
import type {
	ApplicationTimelineItem,
	CandidateSubmissionDetailResponse,
	OrgSubmissionComplianceBlock,
} from "@/types/submission-detail";

function submissionStatusFromStage(
	stage: SubmissionStageKey,
): SubmissionStatus {
	switch (stage) {
		case "SUBMITTED":
			return "Submitted";
		case "QUALIFIED":
		case "SHORTLISTED":
			return "In Review";
		case "INTERVIEW_SCHEDULED":
		case "INTERVIEW_COMPLETED":
			return "Interview";
		case "OFFERED":
			return "Offer";
		case "ACCEPTED":
			return "Accepted";
		case "REJECTED":
			return "Rejected";
		case "WITHDRAWN":
			return "Withdrawn";
	}
}

export function complianceDbStatusToUi(
	s: string | undefined,
): CandidateComplianceItemStatus {
	switch (s) {
		case "APPROVED":
			return "Approved";
		case "PENDING":
			return "Pending Verification";
		case "MISSING":
			return "Requested";
		case "EXPIRED":
			return "Expired";
		default:
			return "Pending Verification";
	}
}

export function buildComplianceStatusFromApi(
	compliance: OrgSubmissionComplianceBlock,
): CandidateSubmissionDetail["complianceStatus"] {
	const items = compliance.items.map((i) => ({
		label: i.title,
		status: complianceDbStatusToUi(i.status),
	}));
	const approved = items.filter((x) => x.status === "Approved").length;
	const pending = items.filter(
		(x) => x.status === "Pending Verification",
	).length;
	const missing = items.filter(
		(x) => x.status === "Requested" || x.status === "Expired",
	).length;
	return { approved, pending, missing, items };
}

export type CandidateSubmissionDetailView = CandidateSubmissionDetail & {
	labels: CandidatePortalLabels;
	applicationTimeline: ApplicationTimelineItem[];
	complianceBanner: {
		visible: boolean;
		message: string | null;
	};
};

export function mapCandidateSubmissionDetailResponseToView(
	api: CandidateSubmissionDetailResponse,
): CandidateSubmissionDetailView {
	const submittedLabel = formatDateOrPlaceholder(api.submittedAt);
	const billRateLabel = formatUsdPerHour(api.billRate);

	const questionnaire: CandidateSubmissionDetail["questionnaire"] = [
		...api.occupationalQuestionnaire.map((q) => ({
			label: q.question,
			value: q.answer,
		})),
		...api.specialtyQuestionnaire.map((q) => ({
			label: q.question,
			value: q.answer,
		})),
	];

	const requestedTimeOff = api.rtos.map(
		(r) =>
			`${formatDateOrPlaceholder(r.start)} – ${formatDateOrPlaceholder(r.end)}`,
	);

	const status = submissionStatusFromStage(api.stage);

	return {
		id: api.id,
		jobTitle: api.jobTitle,
		location: api.facilityName,
		appliedDate: submittedLabel,
		updatedDate: formatDateOrPlaceholder(api.stageEnteredAt),
		status,
		summary: {
			submitted: submittedLabel,
			lastUpdate: formatDateOrPlaceholder(api.stageEnteredAt),
			payRate: billRateLabel,
		},
		candidateInfo: {
			name: api.candidateName,
			occupation: api.occupationLabel,
			specialty: api.specialtyName,
		},
		questionnaire,
		summaryNote: api.summaryNote?.trim() || "—",
		complianceStatus: buildComplianceStatusFromApi(api.compliance),
		requestedTimeOff,
		labels: CANDIDATE_PORTAL_LABELS,
		applicationTimeline: api.applicationTimeline,
		complianceBanner: {
			visible: api.compliance.candidatePortal?.showDocumentsBanner ?? false,
			message: api.compliance.candidatePortal?.documentsBannerMessage ?? null,
		},
	};
}
