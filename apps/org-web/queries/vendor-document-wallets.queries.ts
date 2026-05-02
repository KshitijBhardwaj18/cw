import { useQuery } from "@tanstack/react-query";
import {
	type VendorDocumentWalletsListQuery,
	VendorDocumentWalletsService,
} from "@/services/vendor-document-wallets.service";

export const vendorDocumentWalletsKeys = {
	all: ["vendor-document-wallets"] as const,
	metrics: () => [...vendorDocumentWalletsKeys.all, "metrics"] as const,
	list: (query: VendorDocumentWalletsListQuery) =>
		[...vendorDocumentWalletsKeys.all, "list", query] as const,
};

export function useVendorDocumentWalletsMetrics() {
	return useQuery({
		queryKey: vendorDocumentWalletsKeys.metrics(),
		queryFn: () => VendorDocumentWalletsService.getMetrics(),
		refetchOnMount: "always",
	});
}

export function useVendorDocumentWalletsList(
	query: VendorDocumentWalletsListQuery,
) {
	return useQuery({
		queryKey: vendorDocumentWalletsKeys.list(query),
		queryFn: () => VendorDocumentWalletsService.list(query),
		refetchOnMount: "always",
	});
}
