import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreatePerDiemShiftInput } from "@/services/per-diem-shifts.service";
import { PerDiemShiftsService } from "@/services/per-diem-shifts.service";

export type CommandCenterQuery = {
	search?: string;
	department?: string;
	occupation?: string;
	page?: number;
	limit?: number;
};

export const perDiemShiftKeys = {
	all: ["per-diem-shifts"] as const,
	commandCenter: (orgId: string, query: CommandCenterQuery) =>
		[...perDiemShiftKeys.all, "command-center", orgId, query] as const,
	commandCenterMeta: (orgId: string) =>
		[...perDiemShiftKeys.all, "command-center-meta", orgId] as const,
};

export function useCommandCenterShifts(
	orgId: string,
	query: CommandCenterQuery,
) {
	return useQuery({
		queryKey: perDiemShiftKeys.commandCenter(orgId, query),
		queryFn: () => PerDiemShiftsService.getCommandCenterLocations(query),
		enabled: !!orgId,
		refetchOnMount: "always",
	});
}

export function useCommandCenterShiftsMeta(orgId: string) {
	return useQuery({
		queryKey: perDiemShiftKeys.commandCenterMeta(orgId),
		queryFn: () => PerDiemShiftsService.getCommandCenterLocations({}),
		enabled: !!orgId,
		staleTime: 5 * 60 * 1000,
	});
}

export function useCreatePerDiemShift() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreatePerDiemShiftInput) =>
			PerDiemShiftsService.create(input),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: perDiemShiftKeys.all });
		},
	});
}

export function useCancelPerDiemShift() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: { shiftId: string; reason?: string }) =>
			PerDiemShiftsService.cancel(input.shiftId, {
				reason: input.reason,
			}),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: perDiemShiftKeys.all });
		},
	});
}
