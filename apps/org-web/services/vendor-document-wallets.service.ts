import type { PagePaginatedResponse } from "@repo/shared";
import { ApiClient } from "@/lib/api-client";
import type {
	DocumentWalletListRow,
	DocumentWalletMetricStats,
} from "@/types/document-wallets";

const BASE = "/api/vendor/candidates/document-wallets";

export type VendorDocumentWalletsListQuery = {
	page?: number;
	limit?: number;
	search?: string;
};

export class VendorDocumentWalletsService {
	static async getMetrics(): Promise<DocumentWalletMetricStats> {
		return ApiClient.get<DocumentWalletMetricStats>(`${BASE}/metrics`);
	}

	static async list(
		query: VendorDocumentWalletsListQuery,
	): Promise<PagePaginatedResponse<DocumentWalletListRow>> {
		return ApiClient.get<PagePaginatedResponse<DocumentWalletListRow>>(
			BASE,
			query as Record<string, unknown>,
		);
	}
}
