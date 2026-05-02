import type {
	CursorPaginatedResponse,
	GroupedOrganizationsResponse,
	OrganizationDepartmentDetailType,
	OrganizationDepartmentType,
	OrganizationLocationType,
	OrganizationResponseType,
	OrganizationType,
	OrganizationVendorWithVendorType,
	OrgMemberWithUserType,
	OrgVendorUserType,
	PagePaginatedResponse,
	PaginatedDepartmentsResponse,
	PaginatedLocationsResponse,
	PaginatedOrganizationsResponse,
	PaginatedOrganizationVendorsResponse,
	PaginatedOrgMembersResponse,
	VendorPickerItem,
} from "@repo/shared";
import { ApiClient } from "@/lib/api-client";
import type {
	CreateDepartmentPayload,
	UpdateDepartmentPayload,
} from "@/schemas/department.schema";
import type {
	CreateLocationPayload,
	CreateOrganizationPayload,
	UpdateLocationPayload,
} from "@/schemas/organization.schema";
import type {
	CreateOrganizationVendorPayload,
	UpdateOrganizationVendorPayload,
} from "@/schemas/organization-vendor.schema";
import type {
	BulkEnrollmentJobResponse,
	EnrollExistingUserInput,
	EnrollOrgUserInput,
	UserDto,
} from "@/types/users";
import type { NoteWithUser, VendorDocumentWithUser } from "@/types/vendor";

export class OrganizationsService {
	static async getOrganizations(
		page = 1,
		limit = 8,
		organizationType?: OrganizationType,
		search?: string,
	) {
		return ApiClient.get<PaginatedOrganizationsResponse>("/api/organizations", {
			page,
			limit,
			...(organizationType && { organizationType }),
			...(search?.trim() && { search: search.trim() }),
		});
	}

	static async getOrganizationsGrouped(limitPerGroup = 8) {
		return ApiClient.get<GroupedOrganizationsResponse>(
			"/api/organizations/by-type/grouped",
			{ limitPerGroup },
		);
	}

	static async getOrganizationById(id: string) {
		return ApiClient.get<OrganizationResponseType | null>(
			`/api/organizations/${id}`,
		);
	}

	static async getServiceAgreementSignedUrl(
		organizationId: string,
	): Promise<{ signedUrl: string }> {
		return ApiClient.get<{ signedUrl: string }>(
			`/api/organizations/${organizationId}/service-agreement-signed-url`,
		);
	}

	static async getOrganizationLocations(
		organizationId: string,
		page = 1,
		limit = 8,
		search?: string,
	): Promise<PaginatedLocationsResponse> {
		return ApiClient.get<PaginatedLocationsResponse>(
			`/api/organizations/${organizationId}/locations`,
			{ page, limit, ...(search?.trim() && { search: search.trim() }) },
		);
	}

	static async createOrganizationLocation(
		organizationId: string,
		payload: CreateLocationPayload,
		photo?: File,
	): Promise<OrganizationLocationType> {
		const formData = new FormData();
		formData.append("data", JSON.stringify(payload));
		if (photo) formData.append("photo", photo);
		return ApiClient.post<OrganizationLocationType>(
			`/api/organizations/${organizationId}/locations`,
			formData,
		);
	}

	static async updateOrganizationLocation(
		organizationId: string,
		locationId: string,
		payload: UpdateLocationPayload,
		photo?: File,
	): Promise<OrganizationLocationType> {
		const formData = new FormData();
		formData.append("data", JSON.stringify(payload));
		if (photo) formData.append("photo", photo);
		return ApiClient.put<OrganizationLocationType>(
			`/api/organizations/${organizationId}/locations/${locationId}`,
			formData,
		);
	}

	static async deleteOrganizationLocation(
		organizationId: string,
		locationId: string,
	): Promise<void> {
		return ApiClient.delete(
			`/api/organizations/${organizationId}/locations/${locationId}`,
		);
	}

	static async getOrganizationAvailableVendors(
		organizationId: string,
		page = 1,
		limit = 20,
		search?: string,
	): Promise<PagePaginatedResponse<VendorPickerItem>> {
		return ApiClient.get<PagePaginatedResponse<VendorPickerItem>>(
			`/api/organizations/${organizationId}/available-vendors`,
			{
				page,
				limit,
				...(search?.trim() && { search: search.trim() }),
			},
		);
	}

	static async getOrganizationVendors(
		organizationId: string,
		page = 1,
		limit = 8,
		search?: string,
	): Promise<PaginatedOrganizationVendorsResponse> {
		return ApiClient.get<PaginatedOrganizationVendorsResponse>(
			`/api/organizations/${organizationId}/vendors`,
			{
				page,
				limit,
				...(search?.trim() && { search: search.trim() }),
			},
		);
	}

	static async createOrganizationVendor(
		organizationId: string,
		payload: CreateOrganizationVendorPayload,
		contract?: File,
	): Promise<OrganizationVendorWithVendorType> {
		const formData = new FormData();
		formData.append("data", JSON.stringify(payload));
		if (contract) formData.append("contract", contract);
		return ApiClient.post<OrganizationVendorWithVendorType>(
			`/api/organizations/${organizationId}/vendors`,
			formData,
		);
	}

	static async updateOrganizationVendor(
		organizationId: string,
		organizationVendorId: string,
		payload: UpdateOrganizationVendorPayload,
		contract?: File,
	): Promise<OrganizationVendorWithVendorType> {
		const formData = new FormData();
		formData.append("data", JSON.stringify(payload));
		if (contract) formData.append("contract", contract);
		return ApiClient.put<OrganizationVendorWithVendorType>(
			`/api/organizations/${organizationId}/vendors/${organizationVendorId}`,
			formData,
		);
	}

	static async deleteOrganizationVendor(
		organizationId: string,
		organizationVendorId: string,
	): Promise<void> {
		return ApiClient.delete(
			`/api/organizations/${organizationId}/vendors/${organizationVendorId}`,
		);
	}

	static async getOrganizationVendorContractSignedUrl(
		organizationId: string,
		organizationVendorId: string,
	): Promise<{ signedUrl: string }> {
		return ApiClient.get<{ signedUrl: string }>(
			`/api/organizations/${organizationId}/vendors/${organizationVendorId}/contract-signed-url`,
		);
	}

	static async getOrganizationDepartments(
		organizationId: string,
		page = 1,
		limit = 8,
		search?: string,
		locationId?: string,
	): Promise<PaginatedDepartmentsResponse> {
		return ApiClient.get<PaginatedDepartmentsResponse>(
			`/api/organizations/${organizationId}/departments`,
			{
				page,
				limit,
				...(search?.trim() && { search: search.trim() }),
				...(locationId && { locationId }),
			},
		);
	}

	static async getOrganizationDepartment(
		organizationId: string,
		departmentId: string,
	): Promise<OrganizationDepartmentDetailType> {
		return ApiClient.get<OrganizationDepartmentDetailType>(
			`/api/organizations/${organizationId}/departments/${departmentId}`,
		);
	}

	static async updateOrganizationDepartmentApprovers(
		organizationId: string,
		departmentId: string,
		userIds: string[],
	): Promise<OrganizationDepartmentDetailType> {
		return ApiClient.put<OrganizationDepartmentDetailType>(
			`/api/organizations/${organizationId}/departments/${departmentId}/approvers`,
			{ userIds },
		);
	}

	static async createOrganizationDepartment(
		organizationId: string,
		payload: CreateDepartmentPayload,
	): Promise<OrganizationDepartmentType> {
		return ApiClient.post<OrganizationDepartmentType>(
			`/api/organizations/${organizationId}/departments`,
			payload,
		);
	}

	static async updateOrganizationDepartment(
		organizationId: string,
		departmentId: string,
		payload: UpdateDepartmentPayload,
	): Promise<OrganizationDepartmentType> {
		return ApiClient.put<OrganizationDepartmentType>(
			`/api/organizations/${organizationId}/departments/${departmentId}`,
			payload,
		);
	}

	static async deleteOrganizationDepartment(
		organizationId: string,
		departmentId: string,
	): Promise<void> {
		return ApiClient.delete(
			`/api/organizations/${organizationId}/departments/${departmentId}`,
		);
	}

	static async createOrganization(
		data: CreateOrganizationPayload,
		files?: { logo?: File; serviceAgreement?: File },
	) {
		const formData = new FormData();
		formData.append("data", JSON.stringify(data));
		if (files?.logo) formData.append("logo", files.logo);
		if (files?.serviceAgreement)
			formData.append("serviceAgreement", files.serviceAgreement);
		return ApiClient.post<OrganizationResponseType, FormData>(
			"/api/organizations",
			formData,
		);
	}

	static async getOrgMembers(
		organizationId: string,
		type?:
			| "organization"
			| "program"
			| "vendor"
			| "organization_and_program"
			| "approvers",
		search?: string,
		page = 1,
		limit = 10,
	) {
		return ApiClient.get<PaginatedOrgMembersResponse>(
			`/api/organizations/${organizationId}/members`,
			{
				...(type && { type }),
				...(search?.trim() && { search: search.trim() }),
				page,
				limit,
			},
		);
	}

	static async getOrgProgramUsers(
		organizationId: string,
		search?: string,
		limit = 20,
		cursor?: string,
	) {
		return ApiClient.get<CursorPaginatedResponse<UserDto>>(
			`/api/organizations/${organizationId}/program-users`,
			{
				...(search?.trim() && { search: search.trim() }),
				limit,
				...(cursor && { cursor }),
			},
		);
	}

	static async getOrgVendorUsers(
		organizationId: string,
		search?: string,
		limit = 20,
		cursor?: string,
	) {
		return ApiClient.get<CursorPaginatedResponse<OrgVendorUserType>>(
			`/api/organizations/${organizationId}/vendor-users`,
			{
				...(search?.trim() && { search: search.trim() }),
				limit,
				...(cursor && { cursor }),
			},
		);
	}

	static async enrollOrgUser(organizationId: string, data: EnrollOrgUserInput) {
		return ApiClient.post<OrgMemberWithUserType, EnrollOrgUserInput>(
			`/api/organizations/${organizationId}/members/org-user`,
			data,
		);
	}

	static async enrollExistingUser(
		organizationId: string,
		data: EnrollExistingUserInput,
	) {
		return ApiClient.post<OrgMemberWithUserType, EnrollExistingUserInput>(
			`/api/organizations/${organizationId}/members`,
			data,
		);
	}

	static async removeMember(organizationId: string, memberId: string) {
		return ApiClient.delete(
			`/api/organizations/${organizationId}/members/${memberId}`,
		);
	}

	static async submitBulkEnrollment(organizationId: string, file: File) {
		const form = new FormData();
		form.append("file", file);
		return ApiClient.request<{ jobId: string }>({
			method: "POST",
			url: `/api/organizations/${organizationId}/members/bulk`,
			data: form,
		});
	}

	static async getBulkEnrollmentJob(organizationId: string, jobId: string) {
		return ApiClient.get<BulkEnrollmentJobResponse>(
			`/api/organizations/${organizationId}/members/bulk/jobs/${jobId}`,
		);
	}

	static createBulkEnrollmentStream(
		organizationId: string,
		jobId: string,
	): EventSource {
		return ApiClient.sse(
			`/api/organizations/${organizationId}/members/bulk/jobs/${jobId}/stream`,
		);
	}

	static async sendInvite(
		organizationId: string,
		payload: { memberId: string; scheduledAt?: string },
	) {
		return ApiClient.post<{ jobId: string }>(
			`/api/organizations/${organizationId}/invitations`,
			payload,
		);
	}

	static async suggestSlug(
		name: string,
		excludeOrganizationId?: string,
	): Promise<{ slug: string; modified: boolean }> {
		return ApiClient.get("/api/organizations/slug/suggest", {
			name,
			...(excludeOrganizationId && { excludeOrganizationId }),
		});
	}

	static async checkSlugAvailability(
		slug: string,
	): Promise<{ available: boolean; slug: string }> {
		return ApiClient.get(`/api/organizations/slug/${slug}/check`);
	}

	static async sendBulkInvite(
		organizationId: string,
		payload: { memberIds: string[]; scheduledAt?: string },
	) {
		return ApiClient.post<{ jobId: string }>(
			`/api/organizations/${organizationId}/invitations/bulk`,
			payload,
		);
	}

	static async getInviteJob(organizationId: string, jobId: string) {
		return ApiClient.get<BulkEnrollmentJobResponse>(
			`/api/organizations/${organizationId}/invitations/jobs/${jobId}`,
		);
	}

	static async updateOrganization(
		id: string,
		data: Record<string, unknown>,
		files?: { logo?: File; serviceAgreement?: File },
	) {
		const formData = new FormData();
		formData.append("data", JSON.stringify(data));
		if (files?.logo) formData.append("logo", files.logo);
		if (files?.serviceAgreement)
			formData.append("serviceAgreement", files.serviceAgreement);
		return ApiClient.put<OrganizationResponseType, FormData>(
			`/api/organizations/${id}`,
			formData,
		);
	}

	static async deleteOrganization(id: string): Promise<void> {
		return ApiClient.delete(`/api/organizations/${id}`);
	}

	static async getOrganizationDocuments(
		organizationId: string,
		filters?: {
			search?: string;
			type?: string;
			dateFrom?: string;
			dateTo?: string;
		},
	): Promise<VendorDocumentWithUser[]> {
		const params: Record<string, string> = {};
		if (filters?.search?.trim()) params.search = filters.search.trim();
		if (filters?.type) params.type = filters.type;
		if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
		if (filters?.dateTo) params.dateTo = filters.dateTo;
		return ApiClient.get<VendorDocumentWithUser[]>(
			`/api/organizations/${organizationId}/documents`,
			params,
		);
	}

	static async addOrganizationDocument(
		organizationId: string,
		payload: Omit<import("@/types/vendor").AddDocumentPayload, "url">,
		file: File,
	) {
		const formData = new FormData();
		formData.append("name", payload.name);
		formData.append("type", payload.type);
		if (payload.description)
			formData.append("description", payload.description);
		formData.append("document", file);
		return ApiClient.post(
			`/api/organizations/${organizationId}/documents`,
			formData,
		);
	}

	static async getOrganizationNotes(
		organizationId: string,
		filters?: {
			search?: string;
			type?: string;
			dateFrom?: string;
			dateTo?: string;
		},
	): Promise<NoteWithUser[]> {
		const params: Record<string, string> = {};
		if (filters?.search?.trim()) params.search = filters.search.trim();
		if (filters?.type) params.type = filters.type;
		if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
		if (filters?.dateTo) params.dateTo = filters.dateTo;
		return ApiClient.get<NoteWithUser[]>(
			`/api/organizations/${organizationId}/notes`,
			params,
		);
	}

	static async addOrganizationNote(
		organizationId: string,
		payload: import("@/types/vendor").AddNotePayload,
	) {
		return ApiClient.post<NoteWithUser>(
			`/api/organizations/${organizationId}/notes`,
			payload,
		);
	}
}
