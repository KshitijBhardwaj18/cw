import type {
	CombinationsFilter,
	CombinationsResponse,
	WalletTemplateDetail,
} from "@repo/shared";
import { ApiClient } from "@/lib/api-client";

export class ComplianceWalletTemplateService {
	static async getCombinations(
		organizationId: string,
		page = 1,
		limit = 10,
		search?: string,
		filter: CombinationsFilter = "all",
	) {
		return ApiClient.get<CombinationsResponse>(
			`/api/compliance-wallet-templates/org/${organizationId}/combinations`,
			{
				page,
				limit,
				...(search?.trim() && { search: search.trim() }),
				...(filter !== "all" && { filter }),
			},
		);
	}

	static async getWalletTemplateDetail(
		walletId: string,
		organizationId: string,
	) {
		return ApiClient.get<WalletTemplateDetail>(
			`/api/compliance-wallet-templates/org/${organizationId}/wallet/${walletId}`,
		);
	}

	static async updateWalletItems(
		walletId: string,
		organizationId: string,
		complianceListItemIds: string[],
	) {
		return ApiClient.patch<WalletTemplateDetail>(
			`/api/compliance-wallet-templates/org/${organizationId}/wallet/${walletId}/items`,
			{ complianceListItemIds },
		);
	}

	static async deleteWalletTemplate(
		walletId: string,
		organizationId: string,
	): Promise<void> {
		await ApiClient.delete(
			`/api/compliance-wallet-templates/org/${organizationId}/wallet/${walletId}`,
		);
	}
}
