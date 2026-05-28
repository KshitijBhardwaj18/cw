import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	DisputesQuery,
	EntriesQuery,
	HolidaysQuery,
	MissingTimeQuery,
	TimekeepingPolicy,
} from "@/services/timekeeping.service";
import { TimekeepingService } from "@/services/timekeeping.service";

export const timekeepingKeys = {
	all: ["timekeeping"] as const,
	stats: () => [...timekeepingKeys.all, "stats"] as const,
	entryCounts: (filters: Partial<EntriesQuery> = {}) =>
		[...timekeepingKeys.all, "entry-counts", filters] as const,
	entriesGrouped: (query: EntriesQuery) =>
		[...timekeepingKeys.all, "entries-grouped", query] as const,
	entries: (query: EntriesQuery) =>
		[...timekeepingKeys.all, "entries", query] as const,
	disputeCounts: () => [...timekeepingKeys.all, "dispute-counts"] as const,
	disputes: (query: DisputesQuery) =>
		[...timekeepingKeys.all, "disputes", query] as const,
	missingTimeStats: () =>
		[...timekeepingKeys.all, "missing-time-stats"] as const,
	missingTime: (query: MissingTimeQuery) =>
		[...timekeepingKeys.all, "missing-time", query] as const,
	holidayStats: (year?: number) =>
		[...timekeepingKeys.all, "holiday-stats", year] as const,
	holidays: (query: HolidaysQuery = {}) =>
		[...timekeepingKeys.all, "holidays", query] as const,
	policy: () => [...timekeepingKeys.all, "policy"] as const,
	uploadJob: (jobId: string) =>
		[...timekeepingKeys.all, "upload-job", jobId] as const,
};

export function useTimekeepingStats() {
	return useQuery({
		queryKey: timekeepingKeys.stats(),
		queryFn: () => TimekeepingService.getStats(),
		refetchOnMount: "always",
	});
}

export function useEntryStatusCounts(filters: Partial<EntriesQuery> = {}) {
	return useQuery({
		queryKey: timekeepingKeys.entryCounts(filters),
		queryFn: () => TimekeepingService.getEntryStatusCounts(filters),
		refetchOnMount: "always",
	});
}

export function useEntriesGrouped(query: EntriesQuery) {
	return useQuery({
		queryKey: timekeepingKeys.entriesGrouped(query),
		queryFn: () => TimekeepingService.listEntriesGrouped(query),
		refetchOnMount: "always",
	});
}

export function useEntries(query: EntriesQuery) {
	return useQuery({
		queryKey: timekeepingKeys.entries(query),
		queryFn: () => TimekeepingService.listEntries(query),
		refetchOnMount: "always",
	});
}

export function useUpdateEntryStatus() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			entryId,
			payload,
		}: {
			entryId: string;
			payload: { status: string; approvalSource?: string };
		}) => TimekeepingService.updateEntryStatus(entryId, payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: timekeepingKeys.all });
		},
	});
}

export function useCreateDispute() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			entryId,
			payload,
		}: {
			entryId: string;
			payload: {
				disputeType?: string;
				description: string;
				originalHours?: number;
				disputedHours?: number;
				supportingDocuments?: {
					key?: string;
					name: string;
					type: string;
					size: number;
					lastModified?: number;
				}[];
			};
		}) => TimekeepingService.createDispute(entryId, payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: timekeepingKeys.all });
		},
	});
}

export function useDisputeStatusCounts() {
	return useQuery({
		queryKey: timekeepingKeys.disputeCounts(),
		queryFn: () => TimekeepingService.getDisputeStatusCounts(),
		refetchOnMount: "always",
	});
}

export function useDisputes(query: DisputesQuery) {
	return useQuery({
		queryKey: timekeepingKeys.disputes(query),
		queryFn: () => TimekeepingService.listDisputes(query),
		refetchOnMount: "always",
	});
}

export function useResolveDispute() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			disputeId,
			payload,
		}: {
			disputeId: string;
			payload: {
				resolution?: string;
				resolutionCategory?: string;
				finalHours?: number;
			};
		}) => TimekeepingService.resolveDispute(disputeId, payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: timekeepingKeys.all });
		},
	});
}

export function useRejectDispute() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			disputeId,
			reason,
		}: {
			disputeId: string;
			reason: string;
		}) => TimekeepingService.rejectDispute(disputeId, { reason }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: timekeepingKeys.all });
		},
	});
}

export function useMissingTimeStats() {
	return useQuery({
		queryKey: timekeepingKeys.missingTimeStats(),
		queryFn: () => TimekeepingService.getMissingTimeStats(),
		refetchOnMount: "always",
	});
}

export function useMissingTime(query: MissingTimeQuery) {
	return useQuery({
		queryKey: timekeepingKeys.missingTime(query),
		queryFn: () => TimekeepingService.listMissingTime(query),
		refetchOnMount: "always",
	});
}

export function useSendReminder() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ caseId, message }: { caseId: string; message?: string }) =>
			TimekeepingService.sendReminder(caseId, { message }),
		onSuccess: () => {
			qc.invalidateQueries({
				queryKey: [...timekeepingKeys.all, "missing-time"],
			});
			qc.invalidateQueries({
				queryKey: timekeepingKeys.missingTimeStats(),
			});
		},
	});
}

export function useBulkSendReminders() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			target,
			message,
		}: {
			target: "all" | "overdue";
			message?: string;
		}) => TimekeepingService.bulkSendReminders(target, { message }),
		onSuccess: () => {
			qc.invalidateQueries({
				queryKey: [...timekeepingKeys.all, "missing-time"],
			});
			qc.invalidateQueries({
				queryKey: timekeepingKeys.missingTimeStats(),
			});
		},
	});
}

export function useHolidayStats(year?: number) {
	return useQuery({
		queryKey: timekeepingKeys.holidayStats(year),
		queryFn: () => TimekeepingService.getHolidayStats(year),
		staleTime: 60_000,
	});
}

export function useHolidays(query: HolidaysQuery = {}) {
	return useQuery({
		queryKey: timekeepingKeys.holidays(query),
		queryFn: () => TimekeepingService.listHolidays(query),
		staleTime: 60_000,
	});
}

export function useCreateHoliday() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (payload: {
			name: string;
			observedOn: string;
			holidayType?: string;
		}) => TimekeepingService.createHoliday(payload),
		onSuccess: () => {
			qc.invalidateQueries({
				queryKey: [...timekeepingKeys.all, "holidays"],
			});
			qc.invalidateQueries({
				queryKey: [...timekeepingKeys.all, "holiday-stats"],
			});
		},
	});
}

export function useDeleteHoliday() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (holidayId: string) =>
			TimekeepingService.deleteHoliday(holidayId),
		onSuccess: () => {
			qc.invalidateQueries({
				queryKey: [...timekeepingKeys.all, "holidays"],
			});
			qc.invalidateQueries({
				queryKey: [...timekeepingKeys.all, "holiday-stats"],
			});
		},
	});
}

export function useTimekeepingPolicy() {
	return useQuery({
		queryKey: timekeepingKeys.policy(),
		queryFn: () => TimekeepingService.getPolicy(),
		staleTime: 30_000,
	});
}

export function useUpdateTimekeepingPolicy() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (payload: Partial<TimekeepingPolicy>) =>
			TimekeepingService.updatePolicy(payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: timekeepingKeys.policy() });
		},
	});
}

export function useInternalUpload() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (file: File) => TimekeepingService.internalUpload(file),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: timekeepingKeys.all });
			qc.invalidateQueries({ queryKey: ["billing"] });
		},
	});
}

export function useUploadJobStatus(jobId: string | null, enabled = false) {
	return useQuery({
		queryKey: timekeepingKeys.uploadJob(jobId ?? ""),
		queryFn: () => {
			if (!jobId) throw new Error("jobId is required");
			return TimekeepingService.getUploadJob(jobId);
		},
		enabled: !!jobId && enabled,
		refetchInterval: (query) => {
			const status = query.state.data?.status;
			return status === "COMPLETED" || status === "FAILED" ? false : 3000;
		},
	});
}
