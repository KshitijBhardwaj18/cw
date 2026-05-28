import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UpdateVendorTimekeepingEntryInput } from "@/services/vendor-timekeeping.service";
import { VendorTimekeepingService } from "@/services/vendor-timekeeping.service";

export const vendorTimekeepingKeys = {
	all: ["vendor-timekeeping"] as const,
	metrics: () => [...vendorTimekeepingKeys.all, "metrics"] as const,
	payCodes: () => [...vendorTimekeepingKeys.all, "pay-codes"] as const,
	entries: (query: Record<string, unknown>) =>
		[...vendorTimekeepingKeys.all, "entries", query] as const,
	uploadJob: (jobId: string) =>
		[...vendorTimekeepingKeys.all, "upload-job", jobId] as const,
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

export function useVendorInternalUpload() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (file: File) => VendorTimekeepingService.internalUpload(file),
		onSuccess: () => {
			void qc.invalidateQueries({ queryKey: vendorTimekeepingKeys.all });
		},
	});
}

export function useVendorUploadJobStatus(
	jobId: string | null,
	enabled = false,
) {
	return useQuery({
		queryKey: vendorTimekeepingKeys.uploadJob(jobId ?? ""),
		queryFn: () => {
			if (!jobId) throw new Error("jobId is required");
			return VendorTimekeepingService.getUploadJob(jobId);
		},
		enabled: !!jobId && enabled,
		refetchInterval: (query) => {
			const status = query.state.data?.status;
			return status === "COMPLETED" || status === "FAILED" ? false : 3000;
		},
	});
}
