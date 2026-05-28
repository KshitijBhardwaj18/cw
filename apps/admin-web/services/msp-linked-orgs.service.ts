import type {
	MspFinancialSummary,
	MspLinkedOrgWithOrganization,
} from "@repo/shared";
import { ApiClient } from "@/lib/api-client";

export type CreateMspLinkedOrgPayload = {
	organizationId: string;
	addendumAgreement: string;
	addendumAgreementFileName?: string;
	addendumRevisionDate?: string | null;
	mspFeePercentage: number;
	saasFeePercentage: number;
	startDate: string;
	renewalDate: string;
	possibleCancellationDate?: string | null;
};

export type UpdateMspLinkedOrgPayload = Partial<
	Omit<CreateMspLinkedOrgPayload, "organizationId">
>;

export type AddendumUploadResponse = { key: string; fileName: string };

export class MspLinkedOrgsService {
	static async list(mspId: string): Promise<MspLinkedOrgWithOrganization[]> {
		return ApiClient.get<MspLinkedOrgWithOrganization[]>(
			`/api/msps/${mspId}/linked-orgs`,
		);
	}

	static async create(
		mspId: string,
		payload: CreateMspLinkedOrgPayload,
	): Promise<MspLinkedOrgWithOrganization> {
		return ApiClient.post<
			MspLinkedOrgWithOrganization,
			CreateMspLinkedOrgPayload
		>(`/api/msps/${mspId}/linked-orgs`, payload);
	}

	static async update(
		mspId: string,
		linkedOrgId: string,
		payload: UpdateMspLinkedOrgPayload,
	): Promise<MspLinkedOrgWithOrganization> {
		return ApiClient.patch<
			MspLinkedOrgWithOrganization,
			UpdateMspLinkedOrgPayload
		>(`/api/msps/${mspId}/linked-orgs/${linkedOrgId}`, payload);
	}

	static async remove(mspId: string, linkedOrgId: string): Promise<void> {
		return ApiClient.delete(`/api/msps/${mspId}/linked-orgs/${linkedOrgId}`);
	}

	static async getAgreementSignedUrl(
		mspId: string,
		linkedOrgId: string,
	): Promise<{ signedUrl: string }> {
		return ApiClient.get<{ signedUrl: string }>(
			`/api/msps/${mspId}/linked-orgs/${linkedOrgId}/agreement-signed-url`,
		);
	}

	static async uploadAddendum(
		mspId: string,
		file: File,
	): Promise<AddendumUploadResponse> {
		const formData = new FormData();
		formData.append("agreement", file);
		return ApiClient.post<AddendumUploadResponse, FormData>(
			`/api/msps/${mspId}/linked-orgs/agreement`,
			formData,
		);
	}

	static async getFinancialSummary(
		mspId: string,
	): Promise<MspFinancialSummary> {
		return ApiClient.get<MspFinancialSummary>(
			`/api/msps/${mspId}/financial-summary`,
		);
	}
}
