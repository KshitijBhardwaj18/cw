import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { OrganizationTimekeepingService } from "@/services/organization-timekeeping.service";
import type {
	DisputesQuery,
	EntriesQuery,
	HolidaysQuery,
	MissingTimeQuery,
	TimekeepingPolicy,
} from "@/services/organization-timekeeping.types";

export const organizationTimekeepingKeys = {
	all: ["organization-timekeeping"] as const,
	stats: (orgId: string) =>
		[...organizationTimekeepingKeys.all, "stats", orgId] as const,
	entryCounts: (orgId: string, filters: Partial<EntriesQuery> = {}) =>
		[
			...organizationTimekeepingKeys.all,
			"entry-counts",
			orgId,
			filters,
		] as const,
	entriesGrouped: (orgId: string, query: EntriesQuery) =>
		[
			...organizationTimekeepingKeys.all,
			"entries-grouped",
			orgId,
			query,
		] as const,
	entries: (orgId: string, query: EntriesQuery) =>
		[...organizationTimekeepingKeys.all, "entries", orgId, query] as const,
	disputeCounts: (orgId: string) =>
		[...organizationTimekeepingKeys.all, "dispute-counts", orgId] as const,
	disputes: (orgId: string, query: DisputesQuery) =>
		[...organizationTimekeepingKeys.all, "disputes", orgId, query] as const,
	missingTimeStats: (orgId: string) =>
		[...organizationTimekeepingKeys.all, "missing-time-stats", orgId] as const,
	missingTime: (orgId: string, query: MissingTimeQuery) =>
		[...organizationTimekeepingKeys.all, "missing-time", orgId, query] as const,
	holidayStats: (orgId: string, year?: number) =>
		[...organizationTimekeepingKeys.all, "holiday-stats", orgId, year] as const,
	holidays: (orgId: string, query: HolidaysQuery = {}) =>
		[...organizationTimekeepingKeys.all, "holidays", orgId, query] as const,
	policy: (orgId: string) =>
		[...organizationTimekeepingKeys.all, "policy", orgId] as const,
};

export function useTimekeepingStats(orgId: string) {
	return useQuery({
		queryKey: organizationTimekeepingKeys.stats(orgId),
		queryFn: () => OrganizationTimekeepingService.getStats(orgId),
		enabled: !!orgId,
		refetchOnMount: "always",
	});
}

export function useEntryStatusCounts(
	orgId: string,
	filters: Partial<EntriesQuery> = {},
) {
	return useQuery({
		queryKey: organizationTimekeepingKeys.entryCounts(orgId, filters),
		queryFn: () =>
			OrganizationTimekeepingService.getEntryStatusCounts(orgId, filters),
		enabled: !!orgId,
		refetchOnMount: "always",
	});
}

export function useEntriesGrouped(orgId: string, query: EntriesQuery) {
	return useQuery({
		queryKey: organizationTimekeepingKeys.entriesGrouped(orgId, query),
		queryFn: () =>
			OrganizationTimekeepingService.listEntriesGrouped(orgId, query),
		enabled: !!orgId,
		refetchOnMount: "always",
	});
}

export function useEntries(orgId: string, query: EntriesQuery) {
	return useQuery({
		queryKey: organizationTimekeepingKeys.entries(orgId, query),
		queryFn: () => OrganizationTimekeepingService.listEntries(orgId, query),
		enabled: !!orgId,
		refetchOnMount: "always",
	});
}

export function useUpdateEntryStatus(orgId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			entryId,
			payload,
		}: {
			entryId: string;
			payload: { status: string; approvalSource?: string };
		}) =>
			OrganizationTimekeepingService.updateEntryStatus(orgId, entryId, payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: organizationTimekeepingKeys.all });
		},
	});
}

export function useCreateDispute(orgId: string) {
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
		}) => OrganizationTimekeepingService.createDispute(orgId, entryId, payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: organizationTimekeepingKeys.all });
		},
	});
}

export function useDisputeStatusCounts(orgId: string) {
	return useQuery({
		queryKey: organizationTimekeepingKeys.disputeCounts(orgId),
		queryFn: () => OrganizationTimekeepingService.getDisputeStatusCounts(orgId),
		enabled: !!orgId,
		refetchOnMount: "always",
	});
}

export function useDisputes(orgId: string, query: DisputesQuery) {
	return useQuery({
		queryKey: organizationTimekeepingKeys.disputes(orgId, query),
		queryFn: () => OrganizationTimekeepingService.listDisputes(orgId, query),
		enabled: !!orgId,
		refetchOnMount: "always",
	});
}

export function useResolveDispute(orgId: string) {
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
		}) =>
			OrganizationTimekeepingService.resolveDispute(orgId, disputeId, payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: organizationTimekeepingKeys.all });
		},
	});
}

export function useRejectDispute(orgId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			disputeId,
			reason,
		}: {
			disputeId: string;
			reason: string;
		}) =>
			OrganizationTimekeepingService.rejectDispute(orgId, disputeId, {
				reason,
			}),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: organizationTimekeepingKeys.all });
		},
	});
}

export function useMissingTimeStats(orgId: string) {
	return useQuery({
		queryKey: organizationTimekeepingKeys.missingTimeStats(orgId),
		queryFn: () => OrganizationTimekeepingService.getMissingTimeStats(orgId),
		enabled: !!orgId,
		refetchOnMount: "always",
	});
}

export function useMissingTime(orgId: string, query: MissingTimeQuery) {
	return useQuery({
		queryKey: organizationTimekeepingKeys.missingTime(orgId, query),
		queryFn: () => OrganizationTimekeepingService.listMissingTime(orgId, query),
		enabled: !!orgId,
		refetchOnMount: "always",
	});
}

export function useSendReminder(orgId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ caseId, message }: { caseId: string; message?: string }) =>
			OrganizationTimekeepingService.sendReminder(orgId, caseId, { message }),
		onSuccess: () => {
			qc.invalidateQueries({
				queryKey: [...organizationTimekeepingKeys.all, "missing-time"],
			});
			qc.invalidateQueries({
				queryKey: organizationTimekeepingKeys.missingTimeStats(orgId),
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
		}) =>
			OrganizationTimekeepingService.bulkSendReminders(orgId, target, {
				message,
			}),
		onSuccess: () => {
			qc.invalidateQueries({
				queryKey: [...organizationTimekeepingKeys.all, "missing-time"],
			});
			qc.invalidateQueries({
				queryKey: organizationTimekeepingKeys.missingTimeStats(orgId),
			});
		},
	});
}

export function useHolidayStats(orgId: string, year?: number) {
	return useQuery({
		queryKey: organizationTimekeepingKeys.holidayStats(orgId, year),
		queryFn: () => OrganizationTimekeepingService.getHolidayStats(orgId, year),
		enabled: !!orgId,
		staleTime: 60_000,
	});
}

export function useHolidays(orgId: string, query: HolidaysQuery = {}) {
	return useQuery({
		queryKey: organizationTimekeepingKeys.holidays(orgId, query),
		queryFn: () => OrganizationTimekeepingService.listHolidays(orgId, query),
		enabled: !!orgId,
		staleTime: 60_000,
	});
}

export function useCreateHoliday(orgId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (payload: {
			name: string;
			observedOn: string;
			holidayType?: string;
		}) => OrganizationTimekeepingService.createHoliday(orgId, payload),
		onSuccess: () => {
			qc.invalidateQueries({
				queryKey: [...organizationTimekeepingKeys.all, "holidays"],
			});
			qc.invalidateQueries({
				queryKey: [...organizationTimekeepingKeys.all, "holiday-stats"],
			});
		},
	});
}

export function useDeleteHoliday(orgId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (holidayId: string) =>
			OrganizationTimekeepingService.deleteHoliday(orgId, holidayId),
		onSuccess: () => {
			qc.invalidateQueries({
				queryKey: [...organizationTimekeepingKeys.all, "holidays"],
			});
			qc.invalidateQueries({
				queryKey: [...organizationTimekeepingKeys.all, "holiday-stats"],
			});
		},
	});
}

export function useTimekeepingPolicy(orgId: string) {
	return useQuery({
		queryKey: organizationTimekeepingKeys.policy(orgId),
		queryFn: () => OrganizationTimekeepingService.getPolicy(orgId),
		enabled: !!orgId,
		staleTime: 30_000,
	});
}

export function useUpdateTimekeepingPolicy(orgId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (payload: Partial<TimekeepingPolicy>) =>
			OrganizationTimekeepingService.updatePolicy(orgId, payload),
		onSuccess: () => {
			qc.invalidateQueries({
				queryKey: organizationTimekeepingKeys.policy(orgId),
			});
		},
	});
}
