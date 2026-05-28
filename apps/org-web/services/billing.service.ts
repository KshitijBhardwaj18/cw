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
	vendorId?: string;
	projectId?: string;
	all?: boolean;
	page?: number;
	limit?: number;
};

export type InvoiceDraftListSummary = {
	draftCount: number;
	totalAmount: number;
	approvedAmount: number;
	disputedAmount: number;
	totalBillableHours: number;
};

export type FinalInvoiceSummary = {
	totalCount: number;
	totalAmount: number;
	paidCount: number;
	paidAmount: number;
	pendingCount: number;
	pendingAmount: number;
	overdueCount: number;
	overdueAmount: number;
};

export type FinalInvoiceStatus = "PAID" | "PENDING_PAYMENT" | "OVERDUE";

export type FinalInvoiceListRow = OrgInvoiceListRow & {
	finalStatus: FinalInvoiceStatus;
};

export type InvoiceApproverOption = {
	userId: string;
	name: string;
	email: string;
	role: string;
};

/** List row returned by GET /org/billing/invoices (includes vendor when present). */
export type OrgInvoiceListRow = ApiInvoiceListItem & {
	vendorId?: string | null;
	vendor?: { id: string; name: string } | null;
};

export type InvoiceLineItemInput = {
	description: string;
	quantity?: number;
	unitPrice: number;
	amount?: number;
	lineType?: string;
	candidateId?: string;
	placementId?: string;
	periodStart?: string;
	periodEnd?: string;
};

export type SpendAnalyticsQuery = {
	search?: string;
	page?: number;
	limit?: number;
	all?: boolean;
	periodFrom?: string;
	periodTo?: string;
	periodType?: string;
	departmentId?: string;
	/** Matches `department.costCenter` (case-insensitive). */
	costCenter?: string;
	locationId?: string;
	vendorId?: string;
	occupationId?: string;
	projectId?: string;
};

export type SpendAnalyticsSummary = {
	rowCount: number;
	totalSpend: number;
	regularHours: number;
	overtimeHours: number;
	totalHours: number;
	totalInvoices: number;
	activePlacements: number;
	permanentHeadcount: number;
	contingentHeadcount: number;
	contractorHeadcount: number;
	totalSavings: number;
};

export type SavingsByDepartmentRow = {
	id: string;
	departmentId: string | null;
	departmentName: string;
	departmentCostCenter: string | null;
	savingsAmount: number;
	pctOfTotal: number;
};

export type SavingsByDepartmentResponse = {
	data: SavingsByDepartmentRow[];
	totalSavings: number;
};

export type SpendAnalyticsRow = {
	id: string;
	organizationId: string;
	periodStart: string;
	periodEnd: string;
	periodType: string;
	departmentId: string | null;
	locationId: string | null;
	vendorId: string | null;
	occupationId: string | null;
	projectId: string | null;
	totalSpend: number;
	regularHours: number;
	overtimeHours: number;
	totalHours: number;
	activePlacements: number;
	totalInvoices: number;
	averageBillRate: number;
	permanentHeadcount: number;
	contingentHeadcount: number;
	contractorHeadcount: number;
	calculatedAt: string;
	department: { id: string; name: string; costCenter?: string | null } | null;
	location: { id: string; name: string } | null;
	vendor: { id: string; name: string } | null;
	occupation: { id: string; name: string } | null;
	project: { id: string; name: string } | null;
};

export type SpendOpenCommittedBreakdownRow = {
	id: string;
	requisitionUuid: string;
	requisitionId: string;
	requisitionName: string;
	department: string;
	costCenter: string;
	type: "OPEN" | "COMMITTED";
	openSpend: number | null;
	committedSpend: number | null;
};

export type SpendOpenCommittedBreakdownResponse = {
	data: SpendOpenCommittedBreakdownRow[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	totalOpenSpend: number;
	totalCommittedSpend: number;
};

export type UpdateBillingConfigPayload = {
	// Contact
	contactName?: string;
	contactEmail?: string;
	contactPhone?: string;
	// Billing address
	billingStreet?: string;
	billingCity?: string;
	billingState?: string;
	billingZip?: string;
	// Remittance address
	remittanceStreet?: string;
	remittanceCity?: string;
	remittanceState?: string;
	remittanceZip?: string;
	// Invoice preferences
	paymentTerms?: string;
	billingFrequency?: string;
	invoiceGrouping?: string;
	currency?: string;
	cycleStartDay?: string;
	invoiceFormat?: string;
	invoiceDeliveryEmail?: boolean;
	invoiceDeliverySftp?: boolean;
	invoiceDeliveryDownload?: boolean;
	// Timekeeping rules
	otThreshold?: number;
	timesheetApproval?: boolean;
	mobileEntry?: boolean;
	fileUpload?: boolean;
	disputeTracking?: boolean;
	// Fee structure
	mspPercent?: number;
	saasPercent?: number;
	markupType?: string;
	markupValue?: number;
};

export type TriggerBillingCycleRunResponse = {
	jobId: string;
	organizationId: string;
	billingFrequency: string;
	cycleStartDay: string | null;
	delayMinutes: number;
	scheduledFor: string;
};

const BASE = "/api/org/billing";

export class BillingService {
	static async getPayCodeStats() {
		return ApiClient.get<PayCodeStats>(`${BASE}/pay-codes/stats`);
	}

	static async listPayCodes(query?: PayCodesQuery) {
		return ApiClient.get<PagePaginatedResponse<PayCodeItem>>(
			`${BASE}/pay-codes`,
			query,
		);
	}

	static async createPayCode(payload: {
		code: string;
		category: string;
		description: string;
		multiplier?: number;
		isActive?: boolean;
	}) {
		return ApiClient.post<PayCodeItem>(`${BASE}/pay-codes`, payload);
	}

	static async deletePayCode(payCodeId: string) {
		return ApiClient.delete<{ success: boolean }>(
			`${BASE}/pay-codes/${payCodeId}`,
		);
	}

	static async updatePayCode(
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
			`${BASE}/pay-codes/${payCodeId}`,
			payload,
		);
	}

	static async getConfig() {
		return ApiClient.get<ApiBillingConfig>(`${BASE}/config`);
	}

	static async updateConfig(payload: UpdateBillingConfigPayload) {
		return ApiClient.put<ApiBillingConfig>(`${BASE}/config`, payload);
	}

	static async triggerBillingCycleRun(delayMinutes: number) {
		return ApiClient.post<TriggerBillingCycleRunResponse>(`${BASE}/run-now`, {
			delayMinutes,
		});
	}

	static async getPendingInvoiceCount() {
		return ApiClient.get<number>(`${BASE}/invoices/pending-count`);
	}

	static async getInvoiceHistoryPendingCount() {
		return ApiClient.get<number>(`${BASE}/invoices/history/pending-count`);
	}

	static async listInvoices(query?: InvoicesQuery) {
		return ApiClient.get<PagePaginatedResponse<OrgInvoiceListRow>>(
			`${BASE}/invoices`,
			query as Record<string, unknown>,
		);
	}

	static async listInvoiceHistory(query?: InvoicesQuery) {
		return ApiClient.get<PagePaginatedResponse<OrgInvoiceListRow>>(
			`${BASE}/invoices/history`,
			query as Record<string, unknown>,
		);
	}

	static async listFinalInvoices(query?: InvoicesQuery) {
		return ApiClient.get<PagePaginatedResponse<FinalInvoiceListRow>>(
			`${BASE}/invoices/final`,
			query as Record<string, unknown>,
		);
	}

	static async getFinalInvoiceSummary(query?: InvoicesQuery) {
		return ApiClient.get<FinalInvoiceSummary>(
			`${BASE}/invoices/final-summary`,
			query as Record<string, unknown>,
		);
	}

	static async listInvoiceApprovers() {
		return ApiClient.get<InvoiceApproverOption[]>(`${BASE}/invoices/approvers`);
	}

	static async getInvoiceDraftSummary(query?: InvoicesQuery) {
		return ApiClient.get<InvoiceDraftListSummary>(
			`${BASE}/invoices/draft-summary`,
			query as Record<string, unknown>,
		);
	}

	static async getInvoice(invoiceId: string) {
		return ApiClient.get<ApiInvoiceDetail>(`${BASE}/invoices/${invoiceId}`);
	}

	static async updateInvoiceStatus(invoiceId: string, status: string) {
		return ApiClient.patch<ApiInvoiceDetail>(
			`${BASE}/invoices/${invoiceId}/status`,
			{ status },
		);
	}

	static async submitInvoice(invoiceId: string) {
		return ApiClient.post<ApiInvoiceDetail>(
			`${BASE}/invoices/${invoiceId}/submit`,
			{},
		);
	}

	static async reviewInvoice(
		invoiceId: string,
		payload?: { reviewNotes?: string },
	) {
		return ApiClient.post<ApiInvoiceDetail>(
			`${BASE}/invoices/${invoiceId}/review`,
			payload ?? {},
		);
	}

	static async approveInvoice(
		invoiceId: string,
		payload?: { approvalNotes?: string },
	) {
		return ApiClient.post<ApiInvoiceDetail>(
			`${BASE}/invoices/${invoiceId}/approve`,
			payload ?? {},
		);
	}

	static async routeInvoiceForApproval(
		invoiceId: string,
		payload: { approverUserId: string; routingNotes?: string },
	) {
		return ApiClient.post<ApiInvoiceDetail>(
			`${BASE}/invoices/${invoiceId}/route-approval`,
			payload,
		);
	}

	static async markInvoiceSent(invoiceId: string) {
		return ApiClient.post<ApiInvoiceDetail>(
			`${BASE}/invoices/${invoiceId}/mark-sent`,
			{},
		);
	}

	static async markInvoicePaid(
		invoiceId: string,
		payload: {
			paidDate: string;
			amountPaid?: number;
			paymentMethod?: string;
			paymentReference?: string;
		},
	) {
		return ApiClient.post<ApiInvoiceDetail>(
			`${BASE}/invoices/${invoiceId}/mark-paid`,
			payload,
		);
	}

	static async downloadInvoiceCsv(invoiceId: string) {
		return ApiClient.getBlob(`${BASE}/invoices/${invoiceId}/download-csv`);
	}

	static async downloadInvoicePdf(invoiceId: string) {
		return ApiClient.getBlob(`${BASE}/invoices/${invoiceId}/download-pdf`);
	}

	static async getSpendAnalyticsSummary(query?: SpendAnalyticsQuery) {
		return ApiClient.get<SpendAnalyticsSummary>(
			`${BASE}/spend-analytics/summary`,
			query as Record<string, unknown>,
		);
	}

	static async listSpendAnalytics(query?: SpendAnalyticsQuery) {
		return ApiClient.get<PagePaginatedResponse<SpendAnalyticsRow>>(
			`${BASE}/spend-analytics`,
			query as Record<string, unknown>,
		);
	}

	static async listSpendOpenCommittedBreakdown(query?: SpendAnalyticsQuery) {
		return ApiClient.get<SpendOpenCommittedBreakdownResponse>(
			`${BASE}/spend-analytics/open-committed-breakdown`,
			query as Record<string, unknown>,
		);
	}

	static async getSavingsByDepartment(query?: SpendAnalyticsQuery) {
		return ApiClient.get<SavingsByDepartmentResponse>(
			`${BASE}/spend-analytics/savings-by-department`,
			query as Record<string, unknown>,
		);
	}
}
