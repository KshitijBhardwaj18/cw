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
	payCodeStats: (orgId: string) =>
		[...billingKeys.all, "pay-code-stats", orgId] as const,
	payCodes: (orgId: string, query: PayCodesQuery = {}) =>
		[...billingKeys.all, "pay-codes", orgId, query] as const,
	config: (orgId: string) => [...billingKeys.all, "config", orgId] as const,
	invoices: (orgId: string, query: InvoicesQuery = {}) =>
		[...billingKeys.all, "invoices", orgId, query] as const,
	invoice: (orgId: string, invoiceId: string) =>
		[...billingKeys.all, "invoice", orgId, invoiceId] as const,
	pendingCount: (orgId: string) =>
		[...billingKeys.all, "pending-count", orgId] as const,
	invoiceHistoryPendingCount: (orgId: string) =>
		[...billingKeys.all, "invoice-history-pending-count", orgId] as const,
	invoiceHistory: (orgId: string, query: InvoicesQuery = {}) =>
		[...billingKeys.all, "invoice-history", orgId, query] as const,
	invoiceDraftMetrics: (orgId: string) =>
		[...billingKeys.all, "invoice-draft-metrics", orgId] as const,
	invoiceDraftSummary: (orgId: string, query: InvoicesQuery = {}) =>
		[...billingKeys.all, "invoice-draft-summary", orgId, query] as const,
	finalInvoices: (orgId: string, query: InvoicesQuery = {}) =>
		[...billingKeys.all, "final-invoices", orgId, query] as const,
	finalInvoiceSummary: (orgId: string, query: InvoicesQuery = {}) =>
		[...billingKeys.all, "final-invoice-summary", orgId, query] as const,
	invoiceApprovers: (orgId: string) =>
		[...billingKeys.all, "invoice-approvers", orgId] as const,
	spendSummary: (orgId: string, query: SpendAnalyticsQuery = {}) =>
		[...billingKeys.all, "spend-summary", orgId, query] as const,
	spendAnalytics: (orgId: string, query: SpendAnalyticsQuery = {}) =>
		[...billingKeys.all, "spend-analytics", orgId, query] as const,
	spendOpenCommittedBreakdown: (
		orgId: string,
		query: SpendAnalyticsQuery = {},
	) =>
		[
			...billingKeys.all,
			"spend-open-committed-breakdown",
			orgId,
			query,
		] as const,
};

function invalidateInvoiceCaches(
	qc: QueryClient,
	orgId: string,
	invoiceId?: string,
) {
	qc.invalidateQueries({ queryKey: [...billingKeys.all, "invoices", orgId] });
	qc.invalidateQueries({
		queryKey: billingKeys.invoiceDraftMetrics(orgId),
	});
	if (invoiceId) {
		qc.invalidateQueries({
			queryKey: billingKeys.invoice(orgId, invoiceId),
		});
	}
	qc.invalidateQueries({ queryKey: billingKeys.pendingCount(orgId) });
}

export function usePayCodeStats(orgId: string) {
	return useQuery({
		queryKey: billingKeys.payCodeStats(orgId),
		queryFn: () => BillingService.getPayCodeStats(),
		enabled: !!orgId,
		staleTime: 60_000,
	});
}

export function usePayCodes(orgId: string, query: PayCodesQuery = {}) {
	return useQuery({
		queryKey: billingKeys.payCodes(orgId, query),
		queryFn: () => BillingService.listPayCodes(query),
		enabled: !!orgId,
		staleTime: 60_000,
	});
}

export function useCreatePayCode(orgId: string) {
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
			qc.invalidateQueries({ queryKey: billingKeys.payCodeStats(orgId) });
		},
	});
}

export function useDeletePayCode(orgId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (payCodeId: string) => BillingService.deletePayCode(payCodeId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: [...billingKeys.all, "pay-codes"] });
			qc.invalidateQueries({ queryKey: billingKeys.payCodeStats(orgId) });
		},
	});
}

export function useBillingConfig(orgId: string) {
	return useQuery({
		queryKey: billingKeys.config(orgId),
		queryFn: () => BillingService.getConfig(),
		enabled: !!orgId,
		staleTime: 60_000,
	});
}

export function useUpdateBillingConfig(orgId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (payload: UpdateBillingConfigPayload) =>
			BillingService.updateConfig(payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: billingKeys.config(orgId) });
		},
	});
}

export function usePendingInvoiceCount(orgId: string) {
	return useQuery({
		queryKey: billingKeys.pendingCount(orgId),
		queryFn: () => BillingService.getPendingInvoiceCount(),
		enabled: !!orgId,
		staleTime: 30_000,
	});
}

export function useInvoiceHistoryPendingCount(orgId: string) {
	return useQuery({
		queryKey: billingKeys.invoiceHistoryPendingCount(orgId),
		queryFn: () => BillingService.getInvoiceHistoryPendingCount(),
		enabled: !!orgId,
		staleTime: 30_000,
	});
}

export function useInvoices(orgId: string, query: InvoicesQuery = {}) {
	return useQuery({
		queryKey: billingKeys.invoices(orgId, query),
		queryFn: () => BillingService.listInvoices(query),
		enabled: !!orgId,
	});
}

export function useInvoiceHistory(orgId: string, query: InvoicesQuery = {}) {
	return useQuery({
		queryKey: billingKeys.invoiceHistory(orgId, query),
		queryFn: () => BillingService.listInvoiceHistory(query),
		enabled: !!orgId,
	});
}

export function useInvoice(orgId: string, invoiceId: string) {
	return useQuery({
		queryKey: billingKeys.invoice(orgId, invoiceId),
		queryFn: () => BillingService.getInvoice(invoiceId),
		enabled: !!orgId && !!invoiceId,
	});
}

export function useUpdateInvoiceStatus(orgId: string) {
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
			invalidateInvoiceCaches(qc, orgId, invoiceId);
		},
	});
}

export function useInvoiceDraftMetrics(
	orgId: string,
	query: InvoicesQuery = {
		status: "DRAFT",
		page: 1,
		limit: 500,
	},
) {
	return useQuery({
		queryKey: billingKeys.invoices(orgId, query),
		queryFn: () => BillingService.listInvoices(query),
		enabled: !!orgId,
		staleTime: 30_000,
	});
}

export function useInvoiceDraftSummary(
	orgId: string,
	query: InvoicesQuery = {
		status: "DRAFT",
	},
) {
	return useQuery({
		queryKey: billingKeys.invoiceDraftSummary(orgId, query),
		queryFn: () => BillingService.getInvoiceDraftSummary(query),
		enabled: !!orgId,
		staleTime: 30_000,
	});
}

export function useFinalInvoices(orgId: string, query: InvoicesQuery = {}) {
	return useQuery({
		queryKey: billingKeys.finalInvoices(orgId, query),
		queryFn: () => BillingService.listFinalInvoices(query),
		enabled: !!orgId,
	});
}

export function useFinalInvoiceSummary(
	orgId: string,
	query: InvoicesQuery = {},
) {
	return useQuery({
		queryKey: billingKeys.finalInvoiceSummary(orgId, query),
		queryFn: () => BillingService.getFinalInvoiceSummary(query),
		enabled: !!orgId,
		staleTime: 30_000,
	});
}

export function useInvoiceApprovers(orgId: string) {
	return useQuery({
		queryKey: billingKeys.invoiceApprovers(orgId),
		queryFn: () => BillingService.listInvoiceApprovers(),
		enabled: !!orgId,
		staleTime: 60_000,
	});
}

export function useSubmitInvoice(orgId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (invoiceId: string) => BillingService.submitInvoice(invoiceId),
		onSuccess: (_, invoiceId) => {
			invalidateInvoiceCaches(qc, orgId, invoiceId);
		},
	});
}

export function useReviewInvoice(orgId: string) {
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
			invalidateInvoiceCaches(qc, orgId, invoiceId);
		},
	});
}

export function useApproveInvoice(orgId: string) {
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
			invalidateInvoiceCaches(qc, orgId, invoiceId);
		},
	});
}

export function useMarkInvoiceSent(orgId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (invoiceId: string) =>
			BillingService.markInvoiceSent(invoiceId),
		onSuccess: (_, invoiceId) => {
			invalidateInvoiceCaches(qc, orgId, invoiceId);
		},
	});
}

export function useMarkInvoicePaid(orgId: string) {
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
			invalidateInvoiceCaches(qc, orgId, invoiceId);
		},
	});
}

export function useRouteInvoiceForApproval(orgId: string) {
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
			invalidateInvoiceCaches(qc, orgId, invoiceId);
			qc.invalidateQueries({ queryKey: billingKeys.finalInvoices(orgId) });
			qc.invalidateQueries({
				queryKey: billingKeys.finalInvoiceSummary(orgId),
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

export function useSpendAnalyticsSummary(
	orgId: string,
	query: SpendAnalyticsQuery = {},
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: billingKeys.spendSummary(orgId, query),
		queryFn: () => BillingService.getSpendAnalyticsSummary(query),
		enabled: !!orgId && (options?.enabled ?? true),
		staleTime: 60_000,
	});
}

export function useSpendAnalyticsList(
	orgId: string,
	query: SpendAnalyticsQuery = {},
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: billingKeys.spendAnalytics(orgId, query),
		queryFn: () => BillingService.listSpendAnalytics(query),
		enabled: !!orgId && (options?.enabled ?? true),
		staleTime: 60_000,
	});
}

export function useSpendOpenCommittedBreakdown(
	orgId: string,
	query: SpendAnalyticsQuery = {},
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: billingKeys.spendOpenCommittedBreakdown(orgId, query),
		queryFn: () => BillingService.listSpendOpenCommittedBreakdown(query),
		enabled: !!orgId && (options?.enabled ?? true),
		staleTime: 30_000,
	});
}
