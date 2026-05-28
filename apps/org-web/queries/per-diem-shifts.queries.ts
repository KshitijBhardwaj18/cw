import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	CreatePerDiemShiftInput,
	UpdatePerDiemShiftInput,
} from "@/services/per-diem-shifts.service";
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
	commandCenter: (query: CommandCenterQuery) =>
		[...perDiemShiftKeys.all, "command-center", query] as const,
	commandCenterMeta: () =>
		[...perDiemShiftKeys.all, "command-center-meta"] as const,
	detail: (shiftId: string) =>
		[...perDiemShiftKeys.all, "detail", shiftId] as const,
};

export function useCommandCenterShifts(query: CommandCenterQuery) {
	return useQuery({
		queryKey: perDiemShiftKeys.commandCenter(query),
		queryFn: () => PerDiemShiftsService.getCommandCenterLocations(query),
		refetchOnMount: "always",
	});
}

export function useCommandCenterShiftsMeta() {
	return useQuery({
		queryKey: perDiemShiftKeys.commandCenterMeta(),
		queryFn: () => PerDiemShiftsService.getCommandCenterLocations({}),
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

export function usePerDiemShiftDetail(
	shiftId: string | null,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: perDiemShiftKeys.detail(shiftId ?? ""),
		queryFn: () => PerDiemShiftsService.findOne(shiftId as string),
		enabled: (options?.enabled ?? true) && !!shiftId,
		refetchOnMount: "always",
	});
}

export function useUpdatePerDiemShift(shiftId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: UpdatePerDiemShiftInput) =>
			PerDiemShiftsService.update(shiftId, input),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: perDiemShiftKeys.all });
			void queryClient.invalidateQueries({
				queryKey: perDiemShiftKeys.detail(shiftId),
			});
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
