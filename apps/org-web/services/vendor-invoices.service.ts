import type { PagePaginatedResponse } from "@repo/shared";
import { ApiClient } from "@/lib/api-client";
import type {
	VendorInvoiceBreakdown,
	VendorInvoiceMetricStats,
	VendorInvoiceRow,
} from "@/types/vendor-invoices";

const BASE = "/api/org/billing/vendor/invoices";

export type VendorInvoicesQuery = {
	page?: number;
	limit?: number;
	search?: string;
	status?: string;
};

export class VendorInvoicesService {
	static async listInvoices(query: VendorInvoicesQuery) {
		return ApiClient.get<PagePaginatedResponse<VendorInvoiceRow>>(
			BASE,
			query as Record<string, unknown>,
		);
	}

	static async getSummary(query?: VendorInvoicesQuery) {
		return ApiClient.get<VendorInvoiceMetricStats>(
			`${BASE}/summary`,
			query as Record<string, unknown> | undefined,
		);
	}

	static async getBreakdown(invoiceId: string) {
		return ApiClient.get<VendorInvoiceBreakdown>(
			`${BASE}/${invoiceId}/breakdown`,
		);
	}

	static async downloadInvoicePdf(invoiceId: string) {
		return ApiClient.getBlob(`${BASE}/${invoiceId}/download-pdf`);
	}

	static async downloadInvoiceCsv(invoiceId: string) {
		return ApiClient.getBlob(`${BASE}/${invoiceId}/download-csv`);
	}
}
