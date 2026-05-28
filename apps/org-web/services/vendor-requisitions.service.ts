import type {
	CandidateComplianceStatus,
	PagePaginatedResponse,
} from "@repo/shared";
import { ApiClient } from "@/lib/api-client";
import type { VendorCandidateListRow } from "@/types/vendor-candidates";

const BASE = "/api/vendor/requisitions";

export type VendorRequisitionListItem = {
	id: string;
	jobTitle: string | null;
	unitName: string | null;
	type: string;
	shiftType: string | null;
	startTime: string | null;
	endTime: string | null;
	shiftHours: number | null;
	lengthWeeks: number | null;
	startDate: Date | null;
	endDate: Date | null;
	billRate: number | null;
	numberOfPositions: number;
	positionsFilled: number;
	jobSummary: string | null;
	publishedAt: Date | null;
	location: {
		id: string;
		name: string;
		city: string;
		state: string;
	} | null;
	department: { id: string; name: string } | null;
	organizationOccupation: {
		occupation: { id: string; name: string };
	} | null;
	requisitionSpecialties: Array<{
		organizationSpecialty: {
			specialty: { id: string; name: string };
		};
	}>;
	organization: { name: string };
	isSaved: boolean;
};

export type VendorRequisitionDetail = VendorRequisitionListItem & {
	shiftsPerWeek: number | null;
	hoursPerWeek: number | null;
	interviewRequired: string | null;
	whoCanSubmit: string;
	vendorNotes: string | null;
	benefitsPerks: string[];
	incentiveType: string | null;
	incentiveAmount: number | null;
	acceptanceCriteria: Array<{
		complianceListItem: { id: string; name: string };
	}>;
	complianceChecklist?: {
		items: Array<{
			complianceListItem: { id: string; name: string };
		}>;
	} | null;
	savedByVendorUser: boolean;
};

export type VendorRequisitionCandidateRow = {
	id: string;
	name: string;
	email: string | null;
	role: string;
	specialty: string | null;
	location: string;
	experience: string;
	availability: string;
	matchScore: number;
	tags: string[];
	submissionStage?: string;
};

export type VendorRequisitionCandidatesTab =
	| "interested"
	| "matched"
	| "submitted";

export type VendorCandidateAcceptanceCriterionStatus =
	`${CandidateComplianceStatus}`;

export interface VendorCandidateAcceptanceCriterionItem {
	id: string;
	name: string;
	responseStyle:
		| "PENDING_FILE_UPLOAD"
		| "INTERNAL_TASK"
		| "DOWNLOAD_AND_UPLOAD"
		| "LINK";
	status: VendorCandidateAcceptanceCriterionStatus;
	satisfied: boolean;
	rejectionReason: string | null;
	documentName: string | null;
	expirationDate: string | null;
	link: string | null;
	instructionalNotes: string | null;
	expirationType: "EXPIRATION_DATE" | "EXPIRATION_RULE" | "NON_EXPIRABLE";
	expirationRuleValue: number | null;
	expirationRuleUnit: "DAYS" | "MONTHS" | "YEARS" | null;
}

export interface VendorCandidateAcceptanceCriteriaStatus {
	items: VendorCandidateAcceptanceCriterionItem[];
	allApproved: boolean;
}

export class VendorRequisitionsService {
	static async list(query: {
		page?: number;
		limit?: number;
		search?: string;
		specialtyId?: string;
		locationId?: string;
		savedOnly?: boolean;
	}): Promise<
		PagePaginatedResponse<VendorRequisitionListItem> & {
			totalPages: number;
			totalOpenings: number;
			averageBillRate: number | null;
		}
	> {
		return ApiClient.get(BASE, query as Record<string, unknown>);
	}

	static async getDetail(
		requisitionId: string,
	): Promise<VendorRequisitionDetail> {
		return ApiClient.get<VendorRequisitionDetail>(`${BASE}/${requisitionId}`);
	}

	static async listCandidates(
		requisitionId: string,
		query: {
			tab: VendorRequisitionCandidatesTab;
			page?: number;
			limit?: number;
		},
	): Promise<
		PagePaginatedResponse<VendorRequisitionCandidateRow> & {
			tab: VendorRequisitionCandidatesTab;
			totalPages: number;
		}
	> {
		return ApiClient.get(
			`${BASE}/${requisitionId}/candidates`,
			query as Record<string, unknown>,
		);
	}

	static async getCandidateAcceptanceCriteriaStatus(
		requisitionId: string,
		candidateId: string,
	): Promise<VendorCandidateAcceptanceCriteriaStatus> {
		return ApiClient.get<VendorCandidateAcceptanceCriteriaStatus>(
			`${BASE}/${requisitionId}/candidates/${candidateId}/compliance`,
		);
	}

	static async listSubmittableCandidates(
		requisitionId: string,
		query: { page?: number; limit?: number; search?: string },
	): Promise<PagePaginatedResponse<VendorCandidateListRow>> {
		return ApiClient.get(
			`${BASE}/${requisitionId}/submittable-candidates`,
			query as Record<string, unknown>,
		);
	}

	static async submitCandidate(
		requisitionId: string,
		body: {
			candidateId: string;
			summaryNote?: string;
			rtos?: { startDate: string; endDate?: string; label: string }[];
		},
	): Promise<{ id: string; stage: string; submittedAt: string }> {
		return ApiClient.post(`${BASE}/${requisitionId}/submissions`, body);
	}

	static async saveJob(requisitionId: string): Promise<{ saved: true }> {
		return ApiClient.post<{ saved: true }>(`${BASE}/${requisitionId}/save`, {});
	}

	static async unsaveJob(requisitionId: string): Promise<{ saved: false }> {
		return ApiClient.delete<{ saved: false }>(`${BASE}/${requisitionId}/save`);
	}
}
