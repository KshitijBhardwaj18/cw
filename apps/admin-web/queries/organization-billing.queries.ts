import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	InvoicesQuery,
	PayCodesQuery,
	UpdateBillingConfigPayload,
	UpdateWorkforceBillingRatePayload,
} from "@/services/organization-billing.service";
import { OrganizationBillingService } from "@/services/organization-billing.service";

export const organizationBillingKeys = {
	all: ["organization-billing"] as const,
	payCodeStats: (orgId: string) =>
		[...organizationBillingKeys.all, "pay-code-stats", orgId] as const,
	payCodes: (orgId: string, query: PayCodesQuery = {}) =>
		[...organizationBillingKeys.all, "pay-codes", orgId, query] as const,
	config: (orgId: string) =>
		[...organizationBillingKeys.all, "config", orgId] as const,
	invoices: (orgId: string, query: InvoicesQuery = {}) =>
		[...organizationBillingKeys.all, "invoices", orgId, query] as const,
	invoice: (orgId: string, invoiceId: string) =>
		[...organizationBillingKeys.all, "invoice", orgId, invoiceId] as const,
	pendingCount: (orgId: string) =>
		[...organizationBillingKeys.all, "pending-count", orgId] as const,
	workforceRates: (orgId: string) =>
		[...organizationBillingKeys.all, "workforce-rates", orgId] as const,
};

export function usePayCodeStats(orgId: string) {
	return useQuery({
		queryKey: organizationBillingKeys.payCodeStats(orgId),
		queryFn: () => OrganizationBillingService.getPayCodeStats(orgId),
		enabled: !!orgId,
		staleTime: 60_000,
	});
}

export function usePayCodes(orgId: string, query: PayCodesQuery = {}) {
	return useQuery({
		queryKey: organizationBillingKeys.payCodes(orgId, query),
		queryFn: () => OrganizationBillingService.listPayCodes(orgId, query),
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
		}) => OrganizationBillingService.createPayCode(orgId, payload),
		onSuccess: () => {
			qc.invalidateQueries({
				queryKey: [...organizationBillingKeys.all, "pay-codes"],
			});
			qc.invalidateQueries({
				queryKey: organizationBillingKeys.payCodeStats(orgId),
			});
		},
	});
}

export function useDeletePayCode(orgId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (payCodeId: string) =>
			OrganizationBillingService.deletePayCode(orgId, payCodeId),
		onSuccess: () => {
			qc.invalidateQueries({
				queryKey: [...organizationBillingKeys.all, "pay-codes"],
			});
			qc.invalidateQueries({
				queryKey: organizationBillingKeys.payCodeStats(orgId),
			});
		},
	});
}

export function useBillingConfig(orgId: string) {
	return useQuery({
		queryKey: organizationBillingKeys.config(orgId),
		queryFn: () => OrganizationBillingService.getConfig(orgId),
		enabled: !!orgId,
		staleTime: 60_000,
	});
}

export function useUpdateBillingConfig(orgId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (payload: UpdateBillingConfigPayload) =>
			OrganizationBillingService.updateConfig(orgId, payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: organizationBillingKeys.config(orgId) });
		},
	});
}

export function usePendingInvoiceCount(
	orgId: string,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: organizationBillingKeys.pendingCount(orgId),
		queryFn: () => OrganizationBillingService.getPendingInvoiceCount(orgId),
		enabled: !!orgId && (options?.enabled ?? true),
		staleTime: 30_000,
	});
}

export function useInvoices(
	orgId: string,
	query: InvoicesQuery = {},
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: organizationBillingKeys.invoices(orgId, query),
		queryFn: () => OrganizationBillingService.listInvoices(orgId, query),
		enabled: !!orgId && (options?.enabled ?? true),
	});
}

export function useInvoice(orgId: string, invoiceId: string) {
	return useQuery({
		queryKey: organizationBillingKeys.invoice(orgId, invoiceId),
		queryFn: () => OrganizationBillingService.getInvoice(orgId, invoiceId),
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
		}) =>
			OrganizationBillingService.updateInvoiceStatus(orgId, invoiceId, status),
		onSuccess: (_, { invoiceId }) => {
			qc.invalidateQueries({
				queryKey: organizationBillingKeys.invoice(orgId, invoiceId),
			});
			qc.invalidateQueries({
				queryKey: [...organizationBillingKeys.all, "invoices"],
			});
			qc.invalidateQueries({
				queryKey: organizationBillingKeys.pendingCount(orgId),
			});
		},
	});
}

export function useWorkforceBillingRates(orgId: string) {
	return useQuery({
		queryKey: organizationBillingKeys.workforceRates(orgId),
		queryFn: () => OrganizationBillingService.listWorkforceBillingRates(orgId),
		enabled: !!orgId,
		staleTime: 30_000,
	});
}

export function useUpdateWorkforceBillingRate(orgId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			rateId,
			payload,
		}: {
			rateId: string;
			payload: UpdateWorkforceBillingRatePayload;
		}) =>
			OrganizationBillingService.updateWorkforceBillingRate(
				orgId,
				rateId,
				payload,
			),
		onSuccess: () => {
			qc.invalidateQueries({
				queryKey: organizationBillingKeys.workforceRates(orgId),
			});
		},
	});
}
