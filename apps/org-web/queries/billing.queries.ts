import {
	type QueryClient,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import type {
	InvoicesQuery,
	PayCodesQuery,
	SpendAnalyticsQuery,
	UpdateBillingConfigPayload,
} from "@/services/billing.service";
import { BillingService } from "@/services/billing.service";

export const billingKeys = {
	all: ["billing"] as const,
	payCodeStats: () => [...billingKeys.all, "pay-code-stats"] as const,
	payCodes: (query: PayCodesQuery = {}) =>
		[...billingKeys.all, "pay-codes", query] as const,
	config: () => [...billingKeys.all, "config"] as const,
	invoices: (query: InvoicesQuery = {}) =>
		[...billingKeys.all, "invoices", query] as const,
	invoice: (invoiceId: string) =>
		[...billingKeys.all, "invoice", invoiceId] as const,
	pendingCount: () => [...billingKeys.all, "pending-count"] as const,
	invoiceHistoryPendingCount: () =>
		[...billingKeys.all, "invoice-history-pending-count"] as const,
	invoiceHistory: (query: InvoicesQuery = {}) =>
		[...billingKeys.all, "invoice-history", query] as const,
	invoiceDraftMetrics: () =>
		[...billingKeys.all, "invoice-draft-metrics"] as const,
	invoiceDraftSummary: (query: InvoicesQuery = {}) =>
		[...billingKeys.all, "invoice-draft-summary", query] as const,
	finalInvoices: (query: InvoicesQuery = {}) =>
		[...billingKeys.all, "final-invoices", query] as const,
	finalInvoiceSummary: (query: InvoicesQuery = {}) =>
		[...billingKeys.all, "final-invoice-summary", query] as const,
	invoiceApprovers: () => [...billingKeys.all, "invoice-approvers"] as const,
	spendSummary: (query: SpendAnalyticsQuery = {}) =>
		[...billingKeys.all, "spend-summary", query] as const,
	spendAnalytics: (query: SpendAnalyticsQuery = {}) =>
		[...billingKeys.all, "spend-analytics", query] as const,
	spendSavingsByDepartment: (query: SpendAnalyticsQuery = {}) =>
		[...billingKeys.all, "spend-savings-by-department", query] as const,
	spendOpenCommittedBreakdown: (query: SpendAnalyticsQuery = {}) =>
		[...billingKeys.all, "spend-open-committed-breakdown", query] as const,
};

function invalidateInvoiceCaches(qc: QueryClient, invoiceId?: string) {
	qc.invalidateQueries({ queryKey: [...billingKeys.all, "invoices"] });
	qc.invalidateQueries({
		queryKey: billingKeys.invoiceDraftMetrics(),
	});
	if (invoiceId) {
		qc.invalidateQueries({
			queryKey: billingKeys.invoice(invoiceId),
		});
	}
	qc.invalidateQueries({ queryKey: billingKeys.pendingCount() });
}

export function usePayCodeStats() {
	return useQuery({
		queryKey: billingKeys.payCodeStats(),
		queryFn: () => BillingService.getPayCodeStats(),
		staleTime: 60_000,
	});
}

export function usePayCodes(query: PayCodesQuery = {}) {
	return useQuery({
		queryKey: billingKeys.payCodes(query),
		queryFn: () => BillingService.listPayCodes(query),
		staleTime: 60_000,
	});
}

export function useCreatePayCode() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (payload: {
			code: string;
			category: string;
			description: string;
			multiplier?: number;
			isActive?: boolean;
		}) => BillingService.createPayCode(payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [...billingKeys.all, "pay-codes"] });
			qc.invalidateQueries({ queryKey: billingKeys.payCodeStats() });
		},
	});
}

export function useDeletePayCode() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (payCodeId: string) => BillingService.deletePayCode(payCodeId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [...billingKeys.all, "pay-codes"] });
			qc.invalidateQueries({ queryKey: billingKeys.payCodeStats() });
		},
	});
}

export function useBillingConfig() {
	return useQuery({
		queryKey: billingKeys.config(),
		queryFn: () => BillingService.getConfig(),
		staleTime: 60_000,
	});
}

export function useUpdateBillingConfig() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (payload: UpdateBillingConfigPayload) =>
			BillingService.updateConfig(payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: billingKeys.config() });
		},
	});
}

export function usePendingInvoiceCount() {
	return useQuery({
		queryKey: billingKeys.pendingCount(),
		queryFn: () => BillingService.getPendingInvoiceCount(),
		staleTime: 30_000,
	});
}

export function useInvoiceHistoryPendingCount() {
	return useQuery({
		queryKey: billingKeys.invoiceHistoryPendingCount(),
		queryFn: () => BillingService.getInvoiceHistoryPendingCount(),
		staleTime: 30_000,
	});
}

export function useInvoices(query: InvoicesQuery = {}) {
	return useQuery({
		queryKey: billingKeys.invoices(query),
		queryFn: () => BillingService.listInvoices(query),
	});
}

export function useInvoiceHistory(query: InvoicesQuery = {}) {
	return useQuery({
		queryKey: billingKeys.invoiceHistory(query),
		queryFn: () => BillingService.listInvoiceHistory(query),
	});
}

export function useInvoice(invoiceId: string) {
	return useQuery({
		queryKey: billingKeys.invoice(invoiceId),
		queryFn: () => BillingService.getInvoice(invoiceId),
		enabled: !!invoiceId,
	});
}

export function useUpdateInvoiceStatus() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			invoiceId,
			status,
		}: {
			invoiceId: string;
			status: string;
		}) => BillingService.updateInvoiceStatus(invoiceId, status),
		onSuccess: (_, { invoiceId }) => {
			invalidateInvoiceCaches(qc, invoiceId);
		},
	});
}

export function useInvoiceDraftMetrics(
	query: InvoicesQuery = {
		status: "DRAFT",
		page: 1,
		limit: 500,
	},
) {
	return useQuery({
		queryKey: billingKeys.invoices(query),
		queryFn: () => BillingService.listInvoices(query),
		staleTime: 30_000,
	});
}

export function useInvoiceDraftSummary(
	query: InvoicesQuery = {
		status: "DRAFT",
	},
) {
	return useQuery({
		queryKey: billingKeys.invoiceDraftSummary(query),
		queryFn: () => BillingService.getInvoiceDraftSummary(query),
		staleTime: 30_000,
	});
}

export function useFinalInvoices(query: InvoicesQuery = {}) {
	return useQuery({
		queryKey: billingKeys.finalInvoices(query),
		queryFn: () => BillingService.listFinalInvoices(query),
	});
}

export function useFinalInvoiceSummary(query: InvoicesQuery = {}) {
	return useQuery({
		queryKey: billingKeys.finalInvoiceSummary(query),
		queryFn: () => BillingService.getFinalInvoiceSummary(query),
		staleTime: 30_000,
	});
}

export function useInvoiceApprovers() {
	return useQuery({
		queryKey: billingKeys.invoiceApprovers(),
		queryFn: () => BillingService.listInvoiceApprovers(),
		staleTime: 60_000,
	});
}

export function useSubmitInvoice() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (invoiceId: string) => BillingService.submitInvoice(invoiceId),
		onSuccess: (_, invoiceId) => {
			invalidateInvoiceCaches(qc, invoiceId);
		},
	});
}

export function useReviewInvoice() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			invoiceId,
			reviewNotes,
		}: {
			invoiceId: string;
			reviewNotes?: string;
		}) => BillingService.reviewInvoice(invoiceId, { reviewNotes }),
		onSuccess: (_, { invoiceId }) => {
			invalidateInvoiceCaches(qc, invoiceId);
		},
	});
}

export function useApproveInvoice() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			invoiceId,
			approvalNotes,
		}: {
			invoiceId: string;
			approvalNotes?: string;
		}) => BillingService.approveInvoice(invoiceId, { approvalNotes }),
		onSuccess: (_, { invoiceId }) => {
			invalidateInvoiceCaches(qc, invoiceId);
		},
	});
}

export function useMarkInvoiceSent() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (invoiceId: string) =>
			BillingService.markInvoiceSent(invoiceId),
		onSuccess: (_, invoiceId) => {
			invalidateInvoiceCaches(qc, invoiceId);
		},
	});
}

export function useMarkInvoicePaid() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			invoiceId,
			payload,
		}: {
			invoiceId: string;
			payload: Parameters<typeof BillingService.markInvoicePaid>[1];
		}) => BillingService.markInvoicePaid(invoiceId, payload),
		onSuccess: (_, { invoiceId }) => {
			invalidateInvoiceCaches(qc, invoiceId);
		},
	});
}

export function useRouteInvoiceForApproval() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			invoiceId,
			payload,
		}: {
			invoiceId: string;
			payload: { approverUserId: string; routingNotes?: string };
		}) => BillingService.routeInvoiceForApproval(invoiceId, payload),
		onSuccess: (_, { invoiceId }) => {
			invalidateInvoiceCaches(qc, invoiceId);
			qc.invalidateQueries({ queryKey: billingKeys.finalInvoices() });
			qc.invalidateQueries({
				queryKey: billingKeys.finalInvoiceSummary(),
			});
		},
	});
}

export function useTriggerBillingCycleRun() {
	return useMutation({
		mutationFn: (minutesFromNow: number) =>
			BillingService.triggerBillingCycleRun(minutesFromNow),
	});
}

const SPEND_ANALYTICS_STALE_TIME = 60_000;
const SPEND_ANALYTICS_GC_TIME = 5 * 60_000;

export function useSpendAnalyticsSummary(
	query: SpendAnalyticsQuery = {},
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: billingKeys.spendSummary(query),
		queryFn: () => BillingService.getSpendAnalyticsSummary(query),
		enabled: options?.enabled ?? true,
		staleTime: SPEND_ANALYTICS_STALE_TIME,
		gcTime: SPEND_ANALYTICS_GC_TIME,
		placeholderData: (prev) => prev,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
	});
}

export function useSpendAnalyticsList(
	query: SpendAnalyticsQuery = {},
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: billingKeys.spendAnalytics(query),
		queryFn: () => BillingService.listSpendAnalytics(query),
		enabled: options?.enabled ?? true,
		staleTime: SPEND_ANALYTICS_STALE_TIME,
		gcTime: SPEND_ANALYTICS_GC_TIME,
		placeholderData: (prev) => prev,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
	});
}

export function useSpendOpenCommittedBreakdown(
	query: SpendAnalyticsQuery = {},
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: billingKeys.spendOpenCommittedBreakdown(query),
		queryFn: () => BillingService.listSpendOpenCommittedBreakdown(query),
		enabled: options?.enabled ?? true,
		staleTime: SPEND_ANALYTICS_STALE_TIME,
		gcTime: SPEND_ANALYTICS_GC_TIME,
		placeholderData: (prev) => prev,
		refetchOnWindowFocus: true,
		refetchOnMount: false,
	});
}

export function useSpendSavingsByDepartment(
	query: SpendAnalyticsQuery = {},
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: billingKeys.spendSavingsByDepartment(query),
		queryFn: () => BillingService.getSavingsByDepartment(query),
		enabled: options?.enabled ?? true,
		staleTime: SPEND_ANALYTICS_STALE_TIME,
		gcTime: SPEND_ANALYTICS_GC_TIME,
		placeholderData: (prev) => prev,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
	});
}
