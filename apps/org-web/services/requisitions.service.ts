import { ApiClient } from "@/lib/api-client";
import type { JobPostingFlowValues } from "@/types/job-posting-flow";
import type { OrgJobCardItem } from "@/types/org-job";
import type { RequisitionTemplateType } from "@/types/requisition-template";

export type RequisitionsListResponse = {
	data: OrgJobCardItem[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
};

export type PendingRequisitionApprovalItem = {
	id: string;
	title: string;
	location: string;
	submittedLabel: string;
	hiringManager: string;
	expectedStartDate: string;
	duration: string;
	shiftType: string;
	billRate: string;
	openPositions: number;
	department: string;
	jobDescription: string;
	requiredSkills: string[];
};

export type PendingRequisitionApprovalsResponse = {
	data: PendingRequisitionApprovalItem[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
};

export type RequisitionDetailResponse = {
	id: string;
	type: RequisitionTemplateType;
	status: string;
	templateId: string;
	templateName: string | null;
	locationName: string | null;
	departmentName: string | null;
	occupationName: string | null;
	specialtyName: string | null;
	hiringManagerName: string | null;
	requirementNames: string[];
	jobDetails: JobPostingFlowValues["jobDetails"];
	submissionSettings: JobPostingFlowValues["submissionSettings"] & {
		selectedVendorIds: string[];
	};
	publishSettings: JobPostingFlowValues["publishSettings"] & {
		publishedAt: string | null;
	};
};

export type CreateRequisitionApiPayload = {
	type: RequisitionTemplateType;
	templateId?: string;
	jobTitle: string;
	organizationOccupationId: string;
	organizationSpecialtyId?: string;
	locationId: string;
	departmentId: string;
	unitName?: string | null;
	jobSummary: string;
	benefitsPerks?: string[];
	shiftType: JobPostingFlowValues["jobDetails"]["shiftType"];
	startDate: string;
	endDate?: string | null;
	lengthWeeks: number;
	startTime: string;
	endTime: string;
	shiftHours: number;
	shiftsPerWeek: number;
	hoursPerWeek: number;
	billRate: number;
	numberOfPositions: number;
	incentiveType?: string | null;
	incentiveAmount?: number | null;
	interviewRequired?: JobPostingFlowValues["jobDetails"]["interviewRequired"];
	hiringManagerId: string;
	complianceChecklistId: string;
	submissionType: JobPostingFlowValues["submissionSettings"]["submissionType"];
	vendorAccess: JobPostingFlowValues["submissionSettings"]["vendorAccess"];
	notesForVendors?: string;
	acceptanceCriteriaIds: string[];
	selectedVendorIds?: string[];
	publishMode: JobPostingFlowValues["publishSettings"]["publishMode"];
	scheduledPublishAt?: string;
};

function combineScheduledPublishIso(
	dateStr: string,
	timeStr: string,
): string | undefined {
	if (!dateStr || !timeStr) return undefined;
	const d = new Date(`${dateStr}T${timeStr}:00`);
	return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

export function jobPostingFlowToCreatePayload(
	values: JobPostingFlowValues,
): CreateRequisitionApiPayload {
	const { jobDetails, submissionSettings, publishSettings, typeSelection } =
		values;
	const scheduledPublishAt =
		publishSettings.publishMode === "SCHEDULE_PUBLISH_DATE"
			? combineScheduledPublishIso(
					publishSettings.scheduledPublishDate ?? "",
					publishSettings.scheduledPublishTime ?? "",
				)
			: undefined;

	return {
		type: typeSelection.type,
		templateId: values.templateSelection.templateId || undefined,
		jobTitle: jobDetails.requisitionName,
		organizationOccupationId: jobDetails.occupation,
		organizationSpecialtyId:
			jobDetails.specialty.trim().length > 0 ? jobDetails.specialty : undefined,
		locationId: jobDetails.location,
		departmentId: jobDetails.department,
		unitName: jobDetails.unitName ?? null,
		jobSummary: jobDetails.description,
		benefitsPerks: jobDetails.benefitsPerks,
		shiftType: jobDetails.shiftType,
		startDate: jobDetails.startDate,
		endDate: jobDetails.endDate ?? null,
		lengthWeeks: jobDetails.lengthWeeks,
		startTime: jobDetails.startTime,
		endTime: jobDetails.endTime,
		shiftHours: jobDetails.shiftHours,
		shiftsPerWeek: jobDetails.shiftsPerWeek,
		hoursPerWeek: jobDetails.hoursPerWeek,
		billRate: jobDetails.billRate,
		numberOfPositions: jobDetails.numberOfPositions,
		incentiveType: jobDetails.incentiveType?.trim()
			? jobDetails.incentiveType
			: null,
		incentiveAmount: jobDetails.incentiveAmount ?? null,
		interviewRequired: jobDetails.interviewRequired ?? null,
		hiringManagerId: jobDetails.hiringManagerId,
		complianceChecklistId: jobDetails.complianceTemplateId,
		submissionType: submissionSettings.submissionType,
		vendorAccess: submissionSettings.vendorAccess,
		notesForVendors: submissionSettings.notesForVendors,
		acceptanceCriteriaIds: submissionSettings.acceptanceCriteriaIds,
		selectedVendorIds:
			submissionSettings.vendorAccess === "SELECTED_VENDORS"
				? submissionSettings.selectedVendorIds
				: undefined,
		publishMode: publishSettings.publishMode,
		scheduledPublishAt,
	};
}

const BASE = "/api/org/requisitions";

export class RequisitionsService {
	static async list(
		query: {
			search?: string;
			cardStatus?: string;
			shiftType?: string;
			requisitionType?: string;
			locationId?: string;
			departmentId?: string;
			organizationOccupationId?: string;
			organizationSpecialtyId?: string;
			expectedStartDate?: string;
			excludeProjectId?: string;
			page?: number;
			limit?: number;
		} = {},
	) {
		return ApiClient.get<RequisitionsListResponse>(BASE, query);
	}

	static async findOne(id: string) {
		return ApiClient.get<RequisitionDetailResponse>(`${BASE}/${id}`);
	}

	static async create(payload: CreateRequisitionApiPayload) {
		return ApiClient.post<RequisitionDetailResponse>(BASE, payload);
	}

	static async update(
		id: string,
		payload: Partial<CreateRequisitionApiPayload>,
	) {
		return ApiClient.patch<RequisitionDetailResponse>(`${BASE}/${id}`, payload);
	}

	static async cancel(id: string) {
		return ApiClient.post<RequisitionDetailResponse>(
			`${BASE}/${id}/cancel`,
			{},
		);
	}

	static async listPendingApprovals(
		query: { search?: string; page?: number; limit?: number } = {},
	) {
		return ApiClient.get<PendingRequisitionApprovalsResponse>(
			`${BASE}/approvals/pending`,
			query,
		);
	}

	static async approve(id: string, notes?: string) {
		return ApiClient.post<RequisitionDetailResponse>(`${BASE}/${id}/approve`, {
			notes,
		});
	}

	static async reject(id: string, notes?: string) {
		return ApiClient.post<RequisitionDetailResponse>(`${BASE}/${id}/reject`, {
			notes,
		});
	}
}
