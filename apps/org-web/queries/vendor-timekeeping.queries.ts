import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UpdateVendorTimekeepingEntryInput } from "@/services/vendor-timekeeping.service";
import { VendorTimekeepingService } from "@/services/vendor-timekeeping.service";

export const vendorTimekeepingKeys = {
	all: ["vendor-timekeeping"] as const,
	metrics: () => [...vendorTimekeepingKeys.all, "metrics"] as const,
	payCodes: () => [...vendorTimekeepingKeys.all, "pay-codes"] as const,
	entries: (query: Record<string, unknown>) =>
		[...vendorTimekeepingKeys.all, "entries", query] as const,
};

export function useVendorTimekeepingMetrics() {
	return useQuery({
		queryKey: vendorTimekeepingKeys.metrics(),
		queryFn: () => VendorTimekeepingService.getMetrics(),
		staleTime: 30_000,
		refetchOnMount: "always",
	});
}

export function useVendorTimekeepingEntries(query: {
	page: number;
	limit: number;
	search?: string;
}) {
	return useQuery({
		queryKey: vendorTimekeepingKeys.entries(query),
		queryFn: () => VendorTimekeepingService.listEntries(query),
		staleTime: 30_000,
		refetchOnMount: "always",
	});
}

export function useVendorTimekeepingPayCodes() {
	return useQuery({
		queryKey: vendorTimekeepingKeys.payCodes(),
		queryFn: () => VendorTimekeepingService.getPayCodes(),
		staleTime: 60_000,
		refetchOnMount: "always",
	});
}

export function useUpdateVendorTimekeepingEntry() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			entryId,
			body,
		}: {
			entryId: string;
			body: UpdateVendorTimekeepingEntryInput;
		}) => VendorTimekeepingService.updateEntry(entryId, body),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: vendorTimekeepingKeys.all });
		},
	});
}

export function useSubmitVendorTimekeepingDrafts() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (entryIds?: string[]) =>
			VendorTimekeepingService.submitDrafts(entryIds),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: vendorTimekeepingKeys.all });
		},
	});
}
