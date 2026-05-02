import { ApiClient } from "@/lib/api-client";
import type {
	RequisitionTemplateStatus,
	RequisitionTemplateType,
} from "@/types/requisition-template";

export type RequisitionTemplateListItem = {
	id: string;
	type: RequisitionTemplateType;
	status: RequisitionTemplateStatus;
	title: string;
	templateName: string;
	occupation: string;
	specialty: string;
	location: string;
	departmentLabel: string;
	shiftSummary: string;
	billRateLabel: string;
	complianceTemplateName: string;
	lastUsedLabel: string;
	usedCount: number;
	durationLabel: string;
	complianceItemCount: number;
	lastUpdated: string;
};

export type RequisitionTemplatesResponse = {
	data: RequisitionTemplateListItem[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
};

export type RequisitionTemplateDetail = {
	id: string;
	type: RequisitionTemplateType;
	templateName: string;
	locationId: string;
	organizationOccupationId: string;
	organizationSpecialtyId: string | null;
	occupationId: string;
	specialtyId: string | null;
	departmentId: string;
	unitName: string | null;
	jobDescription: string | null;
	benefitsPerks: string[];
	status: RequisitionTemplateStatus;
	startDate: string | null;
	endDate: string | null;
	lengthWeeks: number | null;
	startTime: string | null;
	endTime: string | null;
	shiftType:
		| "DAYS"
		| "EVENINGS"
		| "NIGHTS"
		| "ROTATING"
		| "WEEKENDS_ONLY"
		| null;
	shiftHours: number | null;
	shiftsPerWeek: number | null;
	hoursPerWeek: number | null;
	billRate: number | null;
	numberOfPositions: number | null;
	incentiveType: string | null;
	incentiveAmount: number | null;
	interviewRequired:
		| "NO_INTERVIEW"
		| "CLIENT_INTERVIEW"
		| "INTERNAL_INTERVIEW"
		| null;
	hiringManagerId: string | null;
	complianceChecklistId: string | null;
	requiresApproval: boolean;
	approvalRole:
		| "EXECUTIVE"
		| "HIRING_MANAGER"
		| "OPERATIONS"
		| "OPERATIONS_MANAGER"
		| "PROGRAM_MANAGER"
		| "TECHNICAL_MANAGER"
		| "COMPLIANCE_MANAGER"
		| null;
	workflowType: "VENDOR_CANDIDATE" | "VENDOR_ONLY" | "CANDIDATE_ONLY" | null;
	whoCanSubmit: "all_vendors" | "selected_vendors";
	internalNotes: string | null;
	templateVendors: { vendorId: string }[];
	complianceChecklistItemPhases: Array<{
		complianceListItemId: string;
		phase: "SUBMISSION" | "PLACEMENT";
	}> | null;
};

export type CreateRequisitionTemplateInput = {
	type: RequisitionTemplateType;
	templateName: string;
	occupationId: string;
	specialtyId?: string;
	departmentId: string;
	unitName?: string;
	jobDescription: string;
	benefitsPerks?: string[];
	status: RequisitionTemplateStatus;
	startDate: string;
	endDate?: string;
	lengthWeeks: number;
	startTime: string;
	endTime: string;
	shiftType: "DAYS" | "EVENINGS" | "NIGHTS" | "ROTATING" | "WEEKENDS_ONLY";
	shiftHours: number;
	shiftsPerWeek: number;
	hoursPerWeek?: number;
	billRate: number;
	numberOfPositions: number;
	incentiveType?: string;
	incentiveAmount?: number;
	interviewRequired?:
		| "NO_INTERVIEW"
		| "CLIENT_INTERVIEW"
		| "INTERNAL_INTERVIEW";
	hiringManagerId?: string;
	complianceChecklistId: string;
	requiresApproval: boolean;
	approvalRole?:
		| "EXECUTIVE"
		| "HIRING_MANAGER"
		| "OPERATIONS"
		| "OPERATIONS_MANAGER"
		| "PROGRAM_MANAGER"
		| "TECHNICAL_MANAGER"
		| "COMPLIANCE_MANAGER";
	workflowType: "VENDOR_CANDIDATE" | "VENDOR_ONLY" | "CANDIDATE_ONLY";
	selectedVendorsOnly: boolean;
	selectedVendorIds?: string[];
	internalNotes?: string;
	complianceChecklistItemPhases?: Array<{
		complianceListItemId: string;
		phase: "SUBMISSION" | "PLACEMENT";
	}>;
};

const BASE = "/api/org/requisition-templates";

export class RequisitionTemplatesService {
	static async list(
		query: {
			search?: string;
			status?: string;
			page?: number;
			limit?: number;
		} = {},
	) {
		return ApiClient.get<RequisitionTemplatesResponse>(BASE, query);
	}

	static async create(input: CreateRequisitionTemplateInput) {
		return ApiClient.post(BASE, input);
	}

	static async findOne(id: string) {
		return ApiClient.get<RequisitionTemplateDetail>(`${BASE}/${id}`);
	}

	static async update(
		id: string,
		input: Partial<CreateRequisitionTemplateInput>,
	) {
		return ApiClient.patch<RequisitionTemplateDetail>(`${BASE}/${id}`, input);
	}
}
