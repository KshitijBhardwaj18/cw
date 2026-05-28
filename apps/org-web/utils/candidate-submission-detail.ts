import {
	formatDateOrPlaceholder,
	formatUsdPerHour,
	SubmissionStage,
} from "@repo/shared";
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
		case SubmissionStage.SUBMITTED:
			return "Submitted";
		case SubmissionStage.QUALIFIED:
		case SubmissionStage.SHORTLISTED:
			return "In Review";
		case SubmissionStage.INTERVIEW_SCHEDULED:
		case SubmissionStage.INTERVIEW_COMPLETED:
			return "Interview";
		case SubmissionStage.OFFERED:
			return "Offer";
		case SubmissionStage.ACCEPTED:
			return "Accepted";
		case SubmissionStage.REJECTED:
			return "Rejected";
		case SubmissionStage.WITHDRAWN:
			return "Withdrawn";
		default: {
			const _unexpected: SubmissionStageKey = stage;
			throw new Error(`Unexpected submission stage: ${_unexpected}`);
		}
	}
}

const COMPLIANCE_STATUS_VALUES = new Set<CandidateComplianceItemStatus>([
	"APPROVED",
	"PENDING_REVIEW",
	"MISSING",
	"REJECTED",
	"EXPIRED",
]);

function narrowComplianceStatus(
	s: string | undefined,
): CandidateComplianceItemStatus {
	return COMPLIANCE_STATUS_VALUES.has(s as CandidateComplianceItemStatus)
		? (s as CandidateComplianceItemStatus)
		: "MISSING";
}

export function buildComplianceStatusFromApi(
	compliance: OrgSubmissionComplianceBlock,
): CandidateSubmissionDetail["complianceStatus"] {
	const items = compliance.items.map((i) => ({
		label: i.title,
		status: narrowComplianceStatus(i.status),
	}));
	const approved = items.filter((x) => x.status === "APPROVED").length;
	const pending = items.filter((x) => x.status === "PENDING_REVIEW").length;
	const missing = items.filter(
		(x) =>
			x.status === "MISSING" ||
			x.status === "EXPIRED" ||
			x.status === "REJECTED",
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

export type CandidateSubmissionDetailViewOptions = {
	formatDateLabel: (value: Date | string | null | undefined) => string;
	formatDateRangeLabel: (
		start: Date | string | null | undefined,
		end: Date | string | null | undefined,
	) => string;
};

export function mapCandidateSubmissionDetailResponseToView(
	api: CandidateSubmissionDetailResponse,
	options?: CandidateSubmissionDetailViewOptions,
): CandidateSubmissionDetailView {
	const formatDateLabel =
		options?.formatDateLabel ??
		((v: Date | string | null | undefined) => formatDateOrPlaceholder(v));
	const formatDateRangeLabel =
		options?.formatDateRangeLabel ??
		((
			a: Date | string | null | undefined,
			b: Date | string | null | undefined,
		) => `${formatDateOrPlaceholder(a)} – ${formatDateOrPlaceholder(b)}`);

	const submittedLabel = formatDateLabel(api.submittedAt);
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

	const requestedTimeOff = api.rtos.map((r) =>
		formatDateRangeLabel(r.start, r.end),
	);

	const status = submissionStatusFromStage(api.stage);

	return {
		id: api.id,
		jobTitle: api.jobTitle,
		location: api.facilityName,
		appliedDate: submittedLabel,
		updatedDate: formatDateLabel(api.stageEnteredAt),
		status,
		summary: {
			submitted: submittedLabel,
			lastUpdate: formatDateLabel(api.stageEnteredAt),
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
