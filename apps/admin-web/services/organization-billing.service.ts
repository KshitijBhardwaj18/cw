import type { PagePaginatedResponse } from "@repo/shared";
import type {
	BillingConfig as ApiBillingConfig,
	InvoiceDetail as ApiInvoiceDetail,
	InvoiceListItem as ApiInvoiceListItem,
} from "@repo/ui/general/billing/types";
import { ApiClient } from "@/lib/api-client";

export type PayCodeStats = {
	total: number;
	active: number;
	categories: number;
};

export type PayCodesQuery = {
	search?: string;
	page?: number;
	limit?: number;
};

export type PayCodeItem = {
	id: string;
	code: string;
	category: string;
	description: string;
	multiplier: number | null;
	sortOrder: number;
	isActive: boolean;
};

export type InvoicesQuery = {
	search?: string;
	status?: string;
	page?: number;
	limit?: number;
};

export type WorkforceBillingFeeTypeApi = "HOUR" | "SHIFT";

export type WorkforceBillingRateDto = {
	id: string;
	organizationId: string;
	workforceType: string;
	isActive: boolean;
	techFee: number;
	feeType: WorkforceBillingFeeTypeApi;
	createdAt: string;
	updatedAt: string;
};

export type UpdateWorkforceBillingRatePayload = {
	isActive?: boolean;
	techFee?: number;
	feeType?: WorkforceBillingFeeTypeApi;
};

export type UpdateBillingConfigPayload = {
	contactName?: string;
	contactEmail?: string;
	contactPhone?: string;
	billingStreet?: string;
	billingCity?: string;
	billingState?: string;
	billingZip?: string;
	remittanceStreet?: string;
	remittanceCity?: string;
	remittanceState?: string;
	remittanceZip?: string;
	paymentTerms?: string;
	billingFrequency?: string;
	invoiceGrouping?: string;
	currency?: string;
	cycleStartDay?: string;
	invoiceFormat?: string;
	invoiceDeliveryEmail?: boolean;
	invoiceDeliverySftp?: boolean;
	invoiceDeliveryDownload?: boolean;
	otThreshold?: number;
	timesheetApproval?: boolean;
	mobileEntry?: boolean;
	fileUpload?: boolean;
	disputeTracking?: boolean;
	mspPercent?: number;
	saasPercent?: number;
	markupType?: string;
	markupValue?: number;
};

function base(organizationId: string) {
	return `/api/organizations/${organizationId}/billing`;
}

export class OrganizationBillingService {
	static async getPayCodeStats(organizationId: string) {
		return ApiClient.get<PayCodeStats>(
			`${base(organizationId)}/pay-codes/stats`,
		);
	}

	static async listPayCodes(organizationId: string, query?: PayCodesQuery) {
		return ApiClient.get<PagePaginatedResponse<PayCodeItem>>(
			`${base(organizationId)}/pay-codes`,
			query,
		);
	}

	static async createPayCode(
		organizationId: string,
		payload: {
			code: string;
			category: string;
			description: string;
			multiplier?: number;
			isActive?: boolean;
		},
	) {
		return ApiClient.post<PayCodeItem>(
			`${base(organizationId)}/pay-codes`,
			payload,
		);
	}

	static async deletePayCode(organizationId: string, payCodeId: string) {
		return ApiClient.delete<{ success: boolean }>(
			`${base(organizationId)}/pay-codes/${payCodeId}`,
		);
	}

	static async updatePayCode(
		organizationId: string,
		payCodeId: string,
		payload: {
			code?: string;
			category?: string;
			description?: string;
			multiplier?: number | null;
			isActive?: boolean;
		},
	) {
		return ApiClient.patch<PayCodeItem>(
			`${base(organizationId)}/pay-codes/${payCodeId}`,
			payload,
		);
	}

	static async getConfig(organizationId: string) {
		return ApiClient.get<ApiBillingConfig>(`${base(organizationId)}/config`);
	}

	static async updateConfig(
		organizationId: string,
		payload: UpdateBillingConfigPayload,
	) {
		return ApiClient.put<ApiBillingConfig>(
			`${base(organizationId)}/config`,
			payload,
		);
	}

	static async getPendingInvoiceCount(organizationId: string) {
		return ApiClient.get<number>(
			`${base(organizationId)}/invoices/pending-count`,
		);
	}

	static async listInvoices(organizationId: string, query?: InvoicesQuery) {
		return ApiClient.get<PagePaginatedResponse<ApiInvoiceListItem>>(
			`${base(organizationId)}/invoices`,
			query as Record<string, unknown>,
		);
	}

	static async getInvoice(organizationId: string, invoiceId: string) {
		return ApiClient.get<ApiInvoiceDetail>(
			`${base(organizationId)}/invoices/${invoiceId}`,
		);
	}

	static async updateInvoiceStatus(
		organizationId: string,
		invoiceId: string,
		status: string,
	) {
		return ApiClient.patch<ApiInvoiceDetail>(
			`${base(organizationId)}/invoices/${invoiceId}/status`,
			{ status },
		);
	}

	static async downloadInvoiceCsv(organizationId: string, invoiceId: string) {
		return ApiClient.getBlob(
			`${base(organizationId)}/invoices/${invoiceId}/download-csv`,
		);
	}

	static async downloadInvoicePdf(organizationId: string, invoiceId: string) {
		return ApiClient.getBlob(
			`${base(organizationId)}/invoices/${invoiceId}/download-pdf`,
		);
	}

	static async listWorkforceBillingRates(organizationId: string) {
		return ApiClient.get<WorkforceBillingRateDto[]>(
			`${base(organizationId)}/workforce-rates`,
		);
	}

	static async updateWorkforceBillingRate(
		organizationId: string,
		rateId: string,
		payload: UpdateWorkforceBillingRatePayload,
	) {
		return ApiClient.patch<WorkforceBillingRateDto>(
			`${base(organizationId)}/workforce-rates/${rateId}`,
			payload,
		);
	}
}
