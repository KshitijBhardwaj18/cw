import { ApiClient } from "@/lib/api-client";
import type {
	CandidateDocumentWalletItemsResponse,
	CandidateDocumentWalletSummary,
} from "@/types/candidate-document-wallet";

const base = (candidateId: string) =>
	`/api/vendor/candidates/${candidateId}/document-wallet`;

export type VendorCandidateDocumentWalletSummaryResponse =
	CandidateDocumentWalletSummary & {
		candidate: {
			id: string;
			name: string;
			email: string;
			phone: string | null;
			specialty: string;
		};
	};

export type VendorCandidateDocumentWalletItemsQuery = {
	page?: number;
	limit?: number;
	search?: string;
	categoryKey?: string;
};

export class VendorCandidateDocumentWalletService {
	static async getSummary(
		candidateId: string,
	): Promise<VendorCandidateDocumentWalletSummaryResponse> {
		return ApiClient.get<VendorCandidateDocumentWalletSummaryResponse>(
			`${base(candidateId)}/summary`,
		);
	}

	static async getItems(
		candidateId: string,
		query: VendorCandidateDocumentWalletItemsQuery,
	): Promise<CandidateDocumentWalletItemsResponse> {
		return ApiClient.get<CandidateDocumentWalletItemsResponse>(
			`${base(candidateId)}/items`,
			query as Record<string, unknown>,
		);
	}

	static async getSignedUrl(
		candidateId: string,
		complianceListItemId: string,
	): Promise<{ signedUrl: string }> {
		return ApiClient.get<{ signedUrl: string }>(
			`${base(candidateId)}/items/${complianceListItemId}/signed-url`,
		);
	}

	/** Approve (`APPROVED`) or return to pending review (`PENDING`). */
	static async updateComplianceStatus(
		candidateId: string,
		complianceListItemId: string,
		body: { status: string; notes?: string; expiryDate?: string },
	): Promise<void> {
		await ApiClient.patch(
			`${base(candidateId)}/items/${complianceListItemId}/status`,
			body,
		);
	}
}
