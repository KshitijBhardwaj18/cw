import { ApiClient } from "@/lib/api-client";
import type {
	CandidateDocumentWalletItemsResponse,
	CandidateDocumentWalletPickerItem,
	CandidateDocumentWalletSummary,
	CandidateDocumentWalletUploadVars,
} from "@/types/candidate-document-wallet";

export type CandidateDocumentWalletItemsQuery = {
	page?: number;
	limit?: number;
	search?: string;
	categoryKey?: string;
};

export class CandidateDocumentWalletService {
	static async getSummary(): Promise<CandidateDocumentWalletSummary> {
		return ApiClient.get<CandidateDocumentWalletSummary>(
			"/api/candidates/me/document-wallet/summary",
		);
	}

	static async getItems(
		query: CandidateDocumentWalletItemsQuery,
	): Promise<CandidateDocumentWalletItemsResponse> {
		return ApiClient.get<CandidateDocumentWalletItemsResponse>(
			"/api/candidates/me/document-wallet/items",
			{
				page: query.page,
				limit: query.limit,
				search: query.search || undefined,
				categoryKey: query.categoryKey || undefined,
			},
		);
	}

	static async getUploadOptions(): Promise<
		CandidateDocumentWalletPickerItem[]
	> {
		return ApiClient.get<CandidateDocumentWalletPickerItem[]>(
			"/api/candidates/me/document-wallet/upload-options",
		);
	}

	static async uploadDocument(
		input: CandidateDocumentWalletUploadVars,
	): Promise<{ success: true }> {
		const formData = new FormData();
		formData.append("file", input.file);
		if (input.expiryDate?.trim()) {
			formData.append("expiryDate", input.expiryDate.trim());
		}
		if (input.issueDate?.trim()) {
			formData.append("issueDate", input.issueDate.trim());
		}
		const url = `/api/candidates/me/document-wallet/items/${input.complianceListItemId}/document`;
		return ApiClient.post<{ success: true }>(url, formData);
	}

	static async getSignedUrl(
		complianceListItemId: string,
	): Promise<{ signedUrl: string }> {
		return ApiClient.get<{ signedUrl: string }>(
			`/api/candidates/me/document-wallet/items/${complianceListItemId}/signed-url`,
		);
	}

	static async markLinkSubmitted(
		complianceListItemId: string,
	): Promise<{ success: true }> {
		return ApiClient.post<{ success: true }>(
			`/api/candidates/me/document-wallet/items/${complianceListItemId}/mark-link-submitted`,
			{},
		);
	}

	static async uploadDocumentForRequisition(
		requisitionId: string,
		input: CandidateDocumentWalletUploadVars,
	): Promise<{ success: true }> {
		const formData = new FormData();
		formData.append("file", input.file);
		if (input.expiryDate?.trim()) {
			formData.append("expiryDate", input.expiryDate.trim());
		}
		if (input.issueDate?.trim()) {
			formData.append("issueDate", input.issueDate.trim());
		}
		const url = `/api/candidates/me/requisitions/${requisitionId}/compliance-items/${input.complianceListItemId}/document`;
		return ApiClient.post<{ success: true }>(url, formData);
	}

	static async markLinkSubmittedForRequisition(
		requisitionId: string,
		complianceListItemId: string,
	): Promise<{ success: true }> {
		return ApiClient.post<{ success: true }>(
			`/api/candidates/me/requisitions/${requisitionId}/compliance-items/${complianceListItemId}/mark-link-submitted`,
			{},
		);
	}

	static async uploadDocumentForPlacement(
		placementId: string,
		input: CandidateDocumentWalletUploadVars,
	): Promise<{ success: true }> {
		const formData = new FormData();
		formData.append("file", input.file);
		if (input.expiryDate?.trim()) {
			formData.append("expiryDate", input.expiryDate.trim());
		}
		if (input.issueDate?.trim()) {
			formData.append("issueDate", input.issueDate.trim());
		}
		const url = `/api/candidates/me/placements/${placementId}/compliance-items/${input.complianceListItemId}/document`;
		return ApiClient.post<{ success: true }>(url, formData);
	}

	static async markLinkSubmittedForPlacement(
		placementId: string,
		complianceListItemId: string,
	): Promise<{ success: true }> {
		return ApiClient.post<{ success: true }>(
			`/api/candidates/me/placements/${placementId}/compliance-items/${complianceListItemId}/mark-link-submitted`,
			{},
		);
	}
}
