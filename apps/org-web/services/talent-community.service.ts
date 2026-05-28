import type {
	CandidateSource,
	CandidateTalentType,
	CandidateWorkforceType,
	PaginatedTalentCommunityResponse,
	VendorCandidateWorkforceType,
} from "@repo/shared";
import { ApiClient } from "@/lib/api-client";
import type {
	AddExistingTalentCandidateRow,
	AddExistingTalentStatusValue,
} from "@/types/talent-community-add-existing";

export type InviteCandidateInput = {
	name: string;
	occupationId: string;
	specialtyIds?: string[];
	email: string;
	phoneNumber: string;
	workforceType: CandidateWorkforceType | VendorCandidateWorkforceType;
};

export type OrgVendorOption = {
	id: string;
	name: string;
};

type OrganizationVendorsResponse = {
	data: {
		vendorId: string;
		vendor: {
			id: string;
			name: string;
		};
	}[];
};

export type TalentCommunityTab = "talent-community" | "new" | "invited";

export type TalentCommunityQuery = {
	tab?: TalentCommunityTab;
	search?: string;
	workforceType?: string;
	inviteStatus?: string;
	page?: number;
	limit?: number;
};

export type ExistingTalentQuery = {
	search?: string;
	workforceType?: CandidateWorkforceType | "all";
	source?: CandidateSource | "all";
	status?: AddExistingTalentStatusValue | "all";
	page?: number;
	limit?: number;
};

export type ExistingTalentResponse = {
	data: AddExistingTalentCandidateRow[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
};

export type ComplianceSeverity = "ok" | "warning" | "danger";

export type CandidateProfileType = CandidateTalentType & {
	candidateCompliances: {
		id: string;
		documentName: string;
		category: string;
		status: string;
		severity: ComplianceSeverity;
		expiryDate: string | null;
		updatedAt: string;
	}[];
	complianceSummary: {
		total: number;
		verified: number;
		allVerified: boolean;
	};
};

export type CandidateActivityEvent = {
	id: string;
	action: string;
	description: string | null;
	changes: unknown;
	createdAt: string;
};

const BASE = "/api/org/talent-community";
const VENDORS_BASE = "/api/org/vendors";

export class TalentCommunityService {
	static async inviteCandidate(input: InviteCandidateInput) {
		return ApiClient.post<CandidateTalentType>(`${BASE}/invite`, input);
	}

	static async getTalentCommunity(query: TalentCommunityQuery = {}) {
		return ApiClient.get<PaginatedTalentCommunityResponse>(BASE, query);
	}

	static async getOrgVendors() {
		const response = await ApiClient.get<OrganizationVendorsResponse>(
			VENDORS_BASE,
			{ limit: 100 },
		);
		return response.data.map((item) => ({
			id: item.vendor.id || item.vendorId,
			name: item.vendor.name,
		}));
	}

	static async getExistingCandidates(query: ExistingTalentQuery = {}) {
		return ApiClient.get<ExistingTalentResponse>(
			`${BASE}/existing-candidates`,
			{
				...query,
				workforceType:
					query.workforceType && query.workforceType !== "all"
						? query.workforceType
						: undefined,
				source:
					query.source && query.source !== "all" ? query.source : undefined,
				status:
					query.status && query.status !== "all" ? query.status : undefined,
			},
		);
	}

	static async addExistingCandidates(candidateIds: string[]) {
		return ApiClient.post<{ addedCount: number }>(
			`${BASE}/existing-candidates/add`,
			{ candidateIds },
		);
	}

	static async getCandidateProfile(candidateId: string) {
		return ApiClient.get<CandidateProfileType>(
			`${BASE}/candidates/${candidateId}`,
		);
	}

	static async getCandidateActivity(candidateId: string) {
		return ApiClient.get<CandidateActivityEvent[]>(
			`${BASE}/candidates/${candidateId}/activity`,
			{ limit: 20 },
		);
	}

	static async updateCandidateWorkforceType(
		candidateId: string,
		workforceType: CandidateWorkforceType,
		vendorId?: string,
	) {
		return ApiClient.patch<CandidateTalentType>(
			`${BASE}/candidates/${candidateId}/workforce-type`,
			{ workforceType, vendorId },
		);
	}
}
