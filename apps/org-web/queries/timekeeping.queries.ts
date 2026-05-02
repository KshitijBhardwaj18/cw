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
	stats: (orgId: string) => [...timekeepingKeys.all, "stats", orgId] as const,
	entryCounts: (orgId: string, filters: Partial<EntriesQuery> = {}) =>
		[...timekeepingKeys.all, "entry-counts", orgId, filters] as const,
	entriesGrouped: (orgId: string, query: EntriesQuery) =>
		[...timekeepingKeys.all, "entries-grouped", orgId, query] as const,
	entries: (orgId: string, query: EntriesQuery) =>
		[...timekeepingKeys.all, "entries", orgId, query] as const,
	disputeCounts: (orgId: string) =>
		[...timekeepingKeys.all, "dispute-counts", orgId] as const,
	disputes: (orgId: string, query: DisputesQuery) =>
		[...timekeepingKeys.all, "disputes", orgId, query] as const,
	missingTimeStats: (orgId: string) =>
		[...timekeepingKeys.all, "missing-time-stats", orgId] as const,
	missingTime: (orgId: string, query: MissingTimeQuery) =>
		[...timekeepingKeys.all, "missing-time", orgId, query] as const,
	holidayStats: (orgId: string, year?: number) =>
		[...timekeepingKeys.all, "holiday-stats", orgId, year] as const,
	holidays: (orgId: string, query: HolidaysQuery = {}) =>
		[...timekeepingKeys.all, "holidays", orgId, query] as const,
	policy: (orgId: string) => [...timekeepingKeys.all, "policy", orgId] as const,
	uploadJob: (orgId: string, jobId: string) =>
		[...timekeepingKeys.all, "upload-job", orgId, jobId] as const,
};

export function useTimekeepingStats(orgId: string) {
	return useQuery({
		queryKey: timekeepingKeys.stats(orgId),
		queryFn: () => TimekeepingService.getStats(),
		enabled: !!orgId,
		refetchOnMount: "always",
	});
}

export function useEntryStatusCounts(
	orgId: string,
	filters: Partial<EntriesQuery> = {},
) {
	return useQuery({
		queryKey: timekeepingKeys.entryCounts(orgId, filters),
		queryFn: () => TimekeepingService.getEntryStatusCounts(filters),
		enabled: !!orgId,
		refetchOnMount: "always",
	});
}

export function useEntriesGrouped(orgId: string, query: EntriesQuery) {
	return useQuery({
		queryKey: timekeepingKeys.entriesGrouped(orgId, query),
		queryFn: () => TimekeepingService.listEntriesGrouped(query),
		enabled: !!orgId,
		refetchOnMount: "always",
	});
}

export function useEntries(orgId: string, query: EntriesQuery) {
	return useQuery({
		queryKey: timekeepingKeys.entries(orgId, query),
		queryFn: () => TimekeepingService.listEntries(query),
		enabled: !!orgId,
		refetchOnMount: "always",
	});
}

export function useUpdateEntryStatus(_orgId: string) {
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

export function useCreateDispute(_orgId: string) {
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

export function useDisputeStatusCounts(orgId: string) {
	return useQuery({
		queryKey: timekeepingKeys.disputeCounts(orgId),
		queryFn: () => TimekeepingService.getDisputeStatusCounts(),
		enabled: !!orgId,
		refetchOnMount: "always",
	});
}

export function useDisputes(orgId: string, query: DisputesQuery) {
	return useQuery({
		queryKey: timekeepingKeys.disputes(orgId, query),
		queryFn: () => TimekeepingService.listDisputes(query),
		enabled: !!orgId,
		refetchOnMount: "always",
	});
}

export function useResolveDispute(_orgId: string) {
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

export function useRejectDispute(_orgId: string) {
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

export function useMissingTimeStats(orgId: string) {
	return useQuery({
		queryKey: timekeepingKeys.missingTimeStats(orgId),
		queryFn: () => TimekeepingService.getMissingTimeStats(),
		enabled: !!orgId,
		refetchOnMount: "always",
	});
}

export function useMissingTime(orgId: string, query: MissingTimeQuery) {
	return useQuery({
		queryKey: timekeepingKeys.missingTime(orgId, query),
		queryFn: () => TimekeepingService.listMissingTime(query),
		enabled: !!orgId,
		refetchOnMount: "always",
	});
}

export function useSendReminder(orgId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ caseId, message }: { caseId: string; message?: string }) =>
			TimekeepingService.sendReminder(caseId, { message }),
		onSuccess: () => {
			qc.invalidateQueries({
				queryKey: [...timekeepingKeys.all, "missing-time"],
			});
			qc.invalidateQueries({
				queryKey: timekeepingKeys.missingTimeStats(orgId),
			});
		},
	});
}

export function useBulkSendReminders(orgId: string) {
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
				queryKey: timekeepingKeys.missingTimeStats(orgId),
			});
		},
	});
}

export function useHolidayStats(orgId: string, year?: number) {
	return useQuery({
		queryKey: timekeepingKeys.holidayStats(orgId, year),
		queryFn: () => TimekeepingService.getHolidayStats(year),
		enabled: !!orgId,
		staleTime: 60_000,
	});
}

export function useHolidays(orgId: string, query: HolidaysQuery = {}) {
	return useQuery({
		queryKey: timekeepingKeys.holidays(orgId, query),
		queryFn: () => TimekeepingService.listHolidays(query),
		enabled: !!orgId,
		staleTime: 60_000,
	});
}

export function useCreateHoliday(_orgId: string) {
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

export function useDeleteHoliday(_orgId: string) {
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

export function useTimekeepingPolicy(orgId: string) {
	return useQuery({
		queryKey: timekeepingKeys.policy(orgId),
		queryFn: () => TimekeepingService.getPolicy(),
		enabled: !!orgId,
		staleTime: 30_000,
	});
}

export function useUpdateTimekeepingPolicy(orgId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (payload: Partial<TimekeepingPolicy>) =>
			TimekeepingService.updatePolicy(payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: timekeepingKeys.policy(orgId) });
		},
	});
}

export function useInternalUpload(_orgId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (file: File) => TimekeepingService.internalUpload(file),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: timekeepingKeys.all });
			qc.invalidateQueries({ queryKey: ["billing"] });
		},
	});
}

export function useUploadJobStatus(
	orgId: string,
	jobId: string | null,
	enabled = false,
) {
	return useQuery({
		queryKey: timekeepingKeys.uploadJob(orgId, jobId ?? ""),
		queryFn: () => {
			if (!jobId) throw new Error("jobId is required");
			return TimekeepingService.getUploadJob(jobId);
		},
		enabled: !!orgId && !!jobId && enabled,
		refetchInterval: (query) => {
			const status = query.state.data?.status;
			return status === "COMPLETED" || status === "FAILED" ? false : 3000;
		},
	});
}
