import type { SubmissionListRow } from "@/constants/submissions";

export type OrgSubmissionComplianceItem = {
	title: string;
	meta: string;
	documentUrl: string | null;
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
	coreQuestions: OrgSubmissionLabelValue[];
	occupationalQuestionnaire: OrgSubmissionQaPair[];
	specialtyQuestionnaire: OrgSubmissionQaPair[];
	priorityFactors: string[];
	compliance: OrgSubmissionComplianceBlock;
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
