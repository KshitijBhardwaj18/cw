import { useQuery } from "@tanstack/react-query";
import type { VendorInvoicesQuery } from "@/services/vendor-invoices.service";
import { VendorInvoicesService } from "@/services/vendor-invoices.service";

export const vendorInvoicesKeys = {
	all: ["vendor-invoices"] as const,
	list: (query: VendorInvoicesQuery) =>
		[...vendorInvoicesKeys.all, "list", query] as const,
	summary: (query: VendorInvoicesQuery = {}) =>
		[...vendorInvoicesKeys.all, "summary", query] as const,
	breakdown: (invoiceId?: string) =>
		[...vendorInvoicesKeys.all, "breakdown", invoiceId] as const,
};

export function useVendorInvoices(query: VendorInvoicesQuery) {
	return useQuery({
		queryKey: vendorInvoicesKeys.list(query),
		queryFn: () => VendorInvoicesService.listInvoices(query),
		refetchOnMount: "always",
		staleTime: 30_000,
	});
}

export function useVendorInvoiceSummary(query: VendorInvoicesQuery = {}) {
	return useQuery({
		queryKey: vendorInvoicesKeys.summary(query),
		queryFn: () => VendorInvoicesService.getSummary(query),
		refetchOnMount: "always",
		staleTime: 30_000,
	});
}

export function useVendorInvoiceBreakdown(invoiceId?: string) {
	return useQuery({
		queryKey: vendorInvoicesKeys.breakdown(invoiceId),
		queryFn: () => VendorInvoicesService.getBreakdown(invoiceId as string),
		enabled: Boolean(invoiceId),
	});
}
