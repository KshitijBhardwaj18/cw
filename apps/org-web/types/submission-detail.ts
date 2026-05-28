import type { SubmissionStage } from "@repo/shared";
import type { SubmissionListRow } from "@/constants/submissions";

export type OrgSubmissionComplianceItem = {
	complianceListItemId: string;
	title: string;
	meta: string;
	hasDocument: boolean;
	status?: string;
};

export type OrgSubmissionLabelValue = { label: string; value: string };

export type OrgSubmissionQaPair = { question: string; answer: string };

export type OrgSubmissionComplianceBlock = {
	statusLabel: string;
	items: OrgSubmissionComplianceItem[];
	candidatePortal?: {
		showDocumentsBanner: boolean;
		documentsBannerMessage: string | null;
	};
};

/** Prisma `SubmissionStage` values plus history-only `OFFER_EXTENDED` (legacy / API event name). */
export type SubmissionHistoryEventType =
	| `${SubmissionStage}`
	| "OFFER_EXTENDED";

export type SubmissionHistoryActorKind = "user" | "vendor";

export type SubmissionHistoryEntry = {
	id: string;
	type: SubmissionHistoryEventType;
	title: string;
	at: string;
	actorLabel: string;
	actorKind: SubmissionHistoryActorKind;
	body: string | null;
};

export type OrgSubmissionDetail = SubmissionListRow & {
	submittedAt: string;
	summaryNote: string | null;
	overtimeRate: number | null;
	requisitionNumber: string | null;
	employment: {
		startDate: string | null;
		endDate: string | null;
		shiftType: string | null;
		hoursPerWeek: number | null;
		shiftsPerWeek: number | null;
		startTime: string | null;
		endTime: string | null;
	};
	candidateDetail: {
		phone: string | null;
		address: string;
	};
	specialtyName: string;
	rtos: { start: string; end: string }[];
	submissionStatusBadge: string;
	regionalNurse: string;
	specificSpecialty: string;
	interview: {
		scheduledAt: string | null;
		location: string | null;
		notes: string | null;
	};
	coreQuestions: OrgSubmissionLabelValue[];
	occupationalQuestionnaire: OrgSubmissionQaPair[];
	specialtyQuestionnaire: OrgSubmissionQaPair[];
	priorityFactors: string[];
	compliance: OrgSubmissionComplianceBlock;
	historyEntries: SubmissionHistoryEntry[];
};

export type ApplicationTimelineItem = {
	id: string;
	title: string;
	description: string;
	occurredAt: string | null;
	completed: boolean;
};

export type CandidateSubmissionDetailResponse = OrgSubmissionDetail & {
	applicationTimeline: ApplicationTimelineItem[];
	compliance: OrgSubmissionComplianceBlock;
};
